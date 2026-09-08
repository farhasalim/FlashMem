import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Local Postgres doesn't use SSL by default. If you later point this at a hosted
  // Postgres (Render, Neon, etc.) for deployment, you'll likely need to add:
  // ssl: { rejectUnauthorized: false }
});

// Small helper so route files don't each import pg directly.
export async function query(text, params) {
  return pool.query(text, params);
}
