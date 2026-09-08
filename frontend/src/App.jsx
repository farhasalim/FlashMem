import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSession, clearSession } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewGoal from "./pages/NewGoal";
import Quiz from "./pages/Quiz";

export default function App() {
  // `session` here is { token, user: { id, email } } — set on login/signup,
  // restored from localStorage on refresh via getSession().
  const [session, setSession] = useState(getSession());

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" /> : <Login onLoggedIn={setSession} />}
        />
        <Route
          path="/"
          element={
            session ? (
              <Dashboard session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/new-goal"
          element={
            session ? (
              <NewGoal session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/quiz/:goalId"
          element={
            session ? (
              <Quiz session={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
