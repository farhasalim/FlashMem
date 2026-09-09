import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import GoalCard from "../components/GoalCard";
import { Link } from "react-router-dom";
import { authFetch } from "../lib/api";

export default function Dashboard({ session, onLogout }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/goals").then((data) => {
      setGoals(data);
      setLoading(false);
    });
  }, [session]);

  async function handleDelete(goalId) {
    await authFetch(`/api/goals/${goalId}`, { method: "DELETE" });
    // Update local state directly rather than re-fetching — avoids an extra
    // network round-trip for something we already know the result of.
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  return (
    <div className="page">
      <div className="margin-rule" />
      <div className="content">
        <Nav onLogout={onLogout} />

        {session.user.isGuest && (
          <div
            className="card"
            style={{ background: "var(--warm-soft)", border: "none", marginBottom: 24 }}
          >
            <p style={{ fontSize: 14, color: "var(--warm)", margin: 0 }}>
              You're in a guest session — everything here is automatically cleared after 24 hours.
            </p>
          </div>
        )}

        <h1 className="serif" style={{ fontSize: 26, marginBottom: 24 }}>
          Your goals
        </h1>

        {loading && <p style={{ color: "var(--muted)" }}>Loading…</p>}

        {!loading && goals.length === 0 && (
          <div className="card">
            <p style={{ marginBottom: 16 }}>
              No goals yet. Start with something specific — "Pass my thermodynamics
              midterm" beats "get better at physics."
            </p>
            <Link to="/new-goal">
              <button>Create your first goal</button>
            </Link>
          </div>
        )}

        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}