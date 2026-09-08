import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { authFetch } from "../lib/api";

export default function NewGoal({ session, onLogout }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | creating | uploading | done | error
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setStatus("creating");

    try {
      const goal = await authFetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, intensity, end_date: endDate }),
      });

      if (file) {
        setStatus("uploading");
        const formData = new FormData();
        formData.append("goal_id", goal.id);
        formData.append("file", file);

        // Note: no Content-Type header here on purpose — the browser sets the
        // correct multipart boundary automatically when the body is FormData.
        await authFetch("/api/documents", { method: "POST", body: formData });
      }

      setStatus("done");
      navigate("/");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  const busy = status === "creating" || status === "uploading";

  return (
    <div className="page">
      <div className="margin-rule" />
      <div className="content">
        <Nav onLogout={onLogout} />

        <h1 className="serif" style={{ fontSize: 26, marginBottom: 8 }}>
          New goal
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          Be specific — the more precise the goal, the better your questions will be.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Goal</label>
          <input
            id="title"
            placeholder="e.g. Pass my thermodynamics midterm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="description">Extra context (optional)</label>
          <textarea
            id="description"
            rows={3}
            placeholder="Anything that helps target the right questions — topics the exam covers, what you're weakest on, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label htmlFor="intensity">Intensity</label>
          <select id="intensity" value={intensity} onChange={(e) => setIntensity(e.target.value)}>
            <option value="intense">Intense — daily, 5 questions, weekly pop quiz</option>
            <option value="moderate">Moderate — daily, 1 question, biweekly pop quiz</option>
            <option value="easy">Easy — every other day, monthly pop quiz</option>
          </select>

          <label htmlFor="end_date">Goal end date</label>
          <input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <label htmlFor="file">Upload your notes (PDF or image)</label>
          <input
            id="file"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {error && (
            <p style={{ color: "var(--margin-line)", fontSize: 14, marginTop: 12 }}>{error}</p>
          )}

          <button type="submit" disabled={busy} style={{ marginTop: 24 }}>
            {status === "creating" && "Creating goal…"}
            {status === "uploading" && "Generating your questions…"}
            {(status === "idle" || status === "error") && "Create goal"}
          </button>
        </form>
      </div>
    </div>
  );
}
