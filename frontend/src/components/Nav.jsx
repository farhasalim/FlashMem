import { Link } from "react-router-dom";

export default function Nav({ onLogout }) {
  return (
    <div className="nav">
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "var(--ink)" }}>
        FlashMem
      </Link>
      <div className="links">
        <Link to="/new-goal">New goal</Link>
        <a href="#" onClick={onLogout}>
          Log out
        </a>
      </div>
    </div>
  );
}
