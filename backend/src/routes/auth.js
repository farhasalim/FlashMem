import { Router } from "express";
// bcryptjs, not bcrypt — a pure-JS implementation of the same hashing algorithm,
// with an identical API (hash, compare). bcrypt requires compiling native C++ code
// on install, which needs build tools most Windows machines don't have set up by
// default. bcryptjs avoids that entirely, at a small performance cost that's
// irrelevant at this project's scale.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Node's built-in crypto module — no new dependency needed
import { query } from "../db.js";

export const authRouter = Router();

function signToken(userId, expiresIn = "30d") {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
}

authRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email and a password of at least 6 characters are required" });
  }

  const existing = await query(`select id from users where email = $1`, [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `insert into users (email, password_hash) values ($1, $2) returning id, email`,
    [email, passwordHash]
  );
  const user = result.rows[0];

  res.status(201).json({ token: signToken(user.id), user: { ...user, isGuest: false } });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const result = await query(`select * from users where email = $1`, [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  res.json({ token: signToken(user.id), user: { id: user.id, email: user.email, isGuest: user.is_guest } });
});

authRouter.post("/guest", async (req, res) => {
  // Opportunistic cleanup: every time someone starts a new guest session, first
  // delete any guest accounts whose 24-hour window has already passed. This
  // avoids needing a separate scheduled job (cron) just for this — the cleanup
  // piggybacks on real traffic instead. The "on delete cascade" set up in
  // schema.sql means each expired guest's goals, documents, questions, and
  // quiz_attempts are automatically removed too, with no extra queries.
  await query(`delete from users where is_guest = true and created_at < now() - interval '24 hours'`);

  // A guest still needs a real row in `users`, since every other table's foreign
  // keys point there — there's no such thing as a goal with no owner in this
  // schema, by design (it's what makes the ownership checks throughout the rest
  // of the app work uniformly for both guests and real accounts).
  const guestEmail = `guest-${crypto.randomUUID()}@flashmem.local`;
  const randomPassword = crypto.randomUUID(); // never shown to anyone; guests don't log back in with a password
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const result = await query(
    `insert into users (email, password_hash, is_guest) values ($1, $2, true) returning id, email`,
    [guestEmail, passwordHash]
  );
  const user = result.rows[0];

  // 24h instead of the normal 30d — this is what actually makes the session
  // "expire" from the user's point of view: once the token is expired,
  // requireAuth (middleware/auth.js) rejects every request with it, and the
  // frontend redirects back to the login screen.
  const token = signToken(user.id, "24h");

  res.status(201).json({ token, user: { id: user.id, email: user.email, isGuest: true } });
});