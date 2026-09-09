import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const goalsRouter = Router();

goalsRouter.use(requireAuth);

goalsRouter.post("/", async (req, res) => {
  const userId = req.userId;
  const { title, description, intensity, end_date } = req.body;

  if (!title || !intensity || !end_date) {
    return res.status(400).json({ error: "title, intensity, and end_date are required" });
  }

  const result = await query(
    `insert into goals (user_id, title, description, intensity, end_date)
     values ($1, $2, $3, $4, $5) returning *`,
    [userId, title, description ?? null, intensity, end_date]
  );

  res.status(201).json(result.rows[0]);
});

goalsRouter.get("/", async (req, res) => {
  const result = await query(
    `select * from goals where user_id = $1 order by created_at desc`,
    [req.userId]
  );
  res.json(result.rows);
});

goalsRouter.get("/:id", async (req, res) => {
  const result = await query(`select * from goals where id = $1 and user_id = $2`, [
    req.params.id,
    req.userId,
  ]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Goal not found" });
  res.json(result.rows[0]);
});

goalsRouter.delete("/:id", async (req, res) => {
  // "returning id" doubles as our ownership check: if this goal doesn't belong to
  // the requesting user, the WHERE clause matches zero rows and nothing is deleted.
  // The database's "on delete cascade" (set up in schema.sql) automatically removes
  // this goal's documents, questions, and quiz_attempts too — no extra queries needed.
  const result = await query(
    `delete from goals where id = $1 and user_id = $2 returning id`,
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Goal not found" });
  res.status(204).send();
});
