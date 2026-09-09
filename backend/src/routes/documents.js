import { Router } from "express";
import multer from "multer";
import { query } from "../db.js";
import { extractText } from "../services/parseDocument.js";
import { generateQuestions } from "../services/aiService.js";
import { requireAuth } from "../middleware/auth.js";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

// Memory storage keeps this simple for Week 1 — files aren't persisted, only their
// extracted text is. TODO Week 2 stretch: store the original file on disk or in
// object storage if you want users to be able to re-view their source material later.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

documentsRouter.post("/", upload.single("file"), async (req, res) => {
  const { goal_id } = req.body;
  if (!goal_id || !req.file) {
    return res.status(400).json({ error: "goal_id and a file are required" });
  }

  // Ownership check: this goal must belong to whoever the JWT says is asking.
  const goalResult = await query(`select * from goals where id = $1 and user_id = $2`, [
    goal_id,
    req.userId,
  ]);
  const goal = goalResult.rows[0];
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  try {
    const extractedText = await extractText(req.file.buffer, req.file.mimetype);

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
    const docResult = await query(
      `insert into documents (goal_id, file_name, file_type, extracted_text)
       values ($1, $2, $3, $4) returning *`,
      [goal_id, req.file.originalname, fileType, extractedText]
    );
    const document = docResult.rows[0];

    const qaPairs = await generateQuestions(extractedText, goal.title, goal.description);

    const insertedQuestions = [];
    for (const pair of qaPairs) {
      const qResult = await query(
        `insert into questions (goal_id, document_id, question, answer)
         values ($1, $2, $3, $4) returning *`,
        [goal_id, document.id, pair.question, pair.answer]
      );
      insertedQuestions.push(qResult.rows[0]);
    }

    res.status(201).json({ document, questions: insertedQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process document: " + err.message });
  }
});
