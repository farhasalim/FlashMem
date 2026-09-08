import { useState } from "react";
import { login, signup, saveSession } from "../lib/api";

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = mode === "login" ? await login(email, password) : await signup(email, password);
      saveSession(data);
      onLoggedIn(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="margin-rule" />
      <div className="content" style={{ maxWidth: 400, paddingTop: 96 }}>
        <h1 className="serif" style={{ fontSize: 32, marginBottom: 8 }}>
          FlashMem
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>
          Set a goal. Upload your notes. Get quizzed until it sticks.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p style={{ color: "var(--margin-line)", fontSize: 14, marginTop: 12 }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: 24, width: "100%" }}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Create an account" : "Log in instead"}
          </a>
        </p>
      </div>
    </div>
  );
}
