import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth.js";
import { goalsRouter } from "./routes/goals.js";
import { documentsRouter } from "./routes/documents.js";
import { quizzesRouter } from "./routes/quizzes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/quizzes", quizzesRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`FlashMem backend running on http://localhost:${port}`));
