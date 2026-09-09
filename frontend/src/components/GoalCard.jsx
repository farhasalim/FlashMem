import { Link } from "react-router-dom";

const intensityLabel = {
  intense: "Intense · daily, 5 questions",
  moderate: "Moderate · daily, 1 question",
  easy: "Easy · every other day",
};

export default function GoalCard({ goal, onDelete }) {
  const daysLeft = Math.ceil(
    (new Date(goal.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  function handleDelete() {
    if (window.confirm(`Delete "${goal.title}"? This also deletes its questions and quiz history.`)) {
      onDelete(goal.id);
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="eyebrow">{intensityLabel[goal.intensity]}</div>
        <button
          className="secondary"
          onClick={handleDelete}
          style={{ padding: "4px 10px", fontSize: 13 }}
        >
          Delete
        </button>
      </div>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>{goal.title}</h2>
      <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 14 }}>
        {daysLeft > 0 ? `${daysLeft} days left` : "Goal period ended"}
      </div>
      <Link to={`/quiz/${goal.id}`}>
        <button>Start today's quiz</button>
      </Link>
    </div>
  );
}