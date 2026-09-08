import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const quizzesRouter = Router();

quizzesRouter.use(requireAuth);

// Week 1: returns up to `count` unanswered (or least-recently-answered) questions
// for a goal, ignoring intensity-tier scheduling entirely.
// TODO Week 2: replace this with real scheduling logic based on goal.intensity —
// e.g. Intense = 5/day, Moderate = 1/day + biweekly full retest, Easy = 1/every 2 days.
quizzesRouter.get("/next/:goalId", async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 5;

  // Ownership check before handing back questions.
  const goalResult = await query(`select id from goals where id = $1 and user_id = $2`, [
    req.params.goalId,
    req.userId,
  ]);
  if (goalResult.rows.length === 0) return res.status(404).json({ error: "Goal not found" });

  const result = await query(
    `select q.* from questions q
     left join (
       select question_id, max(attempted_at) as last_attempt
       from quiz_attempts group by question_id
     ) a on a.question_id = q.id
     where q.goal_id = $1
     order by a.last_attempt asc nulls first
     limit $2`,
    [req.params.goalId, count]
  );

  res.json(result.rows);
});

quizzesRouter.post("/attempt", async (req, res) => {
  const { goal_id, question_id, user_answer, is_pop_quiz } = req.body;

  if (!goal_id || !question_id) {
    return res.status(400).json({ error: "goal_id and question_id are required" });
  }

  // TODO Week 2: real scoring. For now this just records the answer with no score —
  // a reasonable v1 approach is a fuzzy string match against the stored answer, or
  // (nicer, but costs an API call) asking Claude to grade the answer 0-1.
  const result = await query(
    `insert into quiz_attempts (goal_id, question_id, user_id, user_answer, is_pop_quiz)
     values ($1, $2, $3, $4, $5) returning *`,
    [goal_id, question_id, req.userId, user_answer ?? null, is_pop_quiz ?? false]
  );

  res.status(201).json(result.rows[0]);
});
