import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { authFetch } from "../lib/api";

export default function Quiz({ session, onLogout }) {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/quizzes/next/${goalId}?count=5`).then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, [goalId]);

  const current = questions[index];

  async function handleNext() {
    if (current) {
      await authFetch("/api/quizzes/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_id: goalId,
          question_id: current.id,
          user_answer: answer,
        }),
      });
    }

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setAnswer("");
      setRevealed(false);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="page">
      <div className="margin-rule" />
      <div className="content">
        <Nav onLogout={onLogout} />

        {loading && <p style={{ color: "var(--muted)" }}>Loading today's questions…</p>}

        {!loading && questions.length === 0 && (
          <div className="card">
            <p>
              No questions ready for this goal yet — make sure a document finished
              processing on the goal's creation step.
            </p>
          </div>
        )}

        {!loading && current && (
          <div className="card">
            <div className="eyebrow">
              Question {index + 1} of {questions.length}
            </div>
            <h2 className="serif" style={{ fontSize: 22, marginBottom: 20 }}>
              {current.question}
            </h2>

            <textarea
              rows={3}
              placeholder="Type your answer…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={revealed}
            />

            {revealed && (
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div className="eyebrow">Answer</div>
                {current.answer}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {!revealed ? (
                <button onClick={() => setRevealed(true)}>Reveal answer</button>
              ) : (
                <button onClick={handleNext}>
                  {index + 1 < questions.length ? "Next question" : "Finish"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
