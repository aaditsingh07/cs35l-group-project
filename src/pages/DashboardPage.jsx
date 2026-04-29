import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "there";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/");
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>GroupHub</h1>
        <button onClick={handleLogout}>Log Out</button>
      </div>

      <h2>Welcome back, {name}!</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "1.5rem",
          }}
        >
          <h3>Tasks</h3>
          <p>Manage and track your group's tasks.</p>
          <button disabled>View Tasks</button>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "1.5rem",
          }}
        >
          <h3>Meetings</h3>
          <p>Schedule and join group meetings.</p>
          <button disabled>View Meetings</button>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "1.5rem",
          }}
        >
          <h3>Your Group</h3>
          <p>View your group and its members.</p>
          <button disabled>View Group</button>
        </div>
      </div>
    </div>
  );
}
