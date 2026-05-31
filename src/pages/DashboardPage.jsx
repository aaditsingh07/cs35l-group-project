import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("name") || "there";
  const name = fullName.split(" ")[0];
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const token = localStorage.getItem("token");
  
        const res = await fetch(
          "http://localhost:5001/api/unread-count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error(err);
      }
    }
  
    fetchUnreadCount();
  }, []);
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
        <h1>⚡ GroupHub</h1>
        <button onClick={handleLogout}>Log Out</button>
      </div>

      <h2>Welcome back, {name}! 👋</h2>

      <div
        style={{
          background: "linear-gradient(135deg, #0B5ED7, #3A86FF)",
          color: "white",
          padding: "2rem",
          borderRadius: "16px",
          marginTop: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 12px 30px rgba(11,94,215,0.35)",
        }}
      >
        <h2 style={{ margin: 0 }}>
          🦸 GroupHub Hero Headquarters
        </h2>

        <p style={{ marginTop: "0.75rem" }}>
          Manage tasks, meetings, groups, and messages all from one place.
        </p>
      </div>

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
            border: "none",
            borderLeft: "6px solid #FFC107",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3>⚡ Tasks</h3>
          <p>Manage and track your group's tasks.</p>
          <Link to="/tasks">
            <button>View Tasks</button>
          </Link>
        </div>

        <div
          style={{
            border: "none",
            borderLeft: "6px solid #3A86FF",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3>📅 Meetings</h3>
          <p>Schedule and join group meetings.</p>
          <Link to="/meetings">
            <button>View Meetings</button>
          </Link>
        </div>

        <div
          style={{
            border: "none",
            borderLeft: "6px solid #FF6B6B",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3>🛡️ Your Group</h3>
          <p>View your group and its members.</p>
          <Link to="/group">
            <button>View Group</button>
          </Link>
        </div>

        <div
          style={{
            border: "none",
            borderLeft: "6px solid #4CAF50",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  💬 Your Messages

  {unreadCount > 0 && (
    <span
      style={{
        background: "#DC3545",
        color: "white",
        borderRadius: "999px",
        minWidth: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: "bold",
      }}
    >
      {unreadCount}
    </span>
  )}
</h3>
          <p>View your group & personal messages.</p>
          <Link to="/messages">
            <button>View Messages</button>
          </Link>
        </div>
      </div>
    </div>
  );
}