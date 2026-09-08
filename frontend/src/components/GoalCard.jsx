import { Link } from "react-router-dom";

const intensityLabel = {
  intense: "Intense · daily, 5 questions",
  moderate: "Moderate · daily, 1 question",
  easy: "Easy · every other day",
};

export default function GoalCard({ goal }) {
  const daysLeft = Math.ceil(
    (new Date(goal.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="card">
      <div className="eyebrow">{intensityLabel[goal.intensity]}</div>
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
