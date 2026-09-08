import jwt from "jsonwebtoken";

/**
 * Verifies the Authorization: Bearer <token> header and attaches the decoded
 * user id to req.userId. Every protected route relies on this instead of
 * trusting anything the client claims about who it is.
 */
export function requireAuth(req, res, next) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing or malformed Authorization header" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
