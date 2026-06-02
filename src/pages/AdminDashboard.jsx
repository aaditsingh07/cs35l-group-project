import React from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE = "http://localhost:5001";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [stats, setStats] = React.useState({ users: 0, groups: 0, tasks: 0 });

  const adminName = (localStorage.getItem("name") || "Admin").split(" ")[0];

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [unreadRes, usersRes, groupsRes, tasksRes] = await Promise.all([
          fetch(`${BASE}/api/unread-count`, { headers: authHeaders() }),
          fetch(`${BASE}/api/admin/users`, { headers: authHeaders() }),
          fetch(`${BASE}/api/admin/groups`, { headers: authHeaders() }),
          fetch(`${BASE}/api/admin/tasks`, { headers: authHeaders() }),
        ]);

        if (unreadRes.ok) {
          const data = await unreadRes.json();
          setUnreadCount(data.count || 0);
        }

        const [users, groups, tasks] = await Promise.all([
          usersRes.ok ? usersRes.json() : [],
          groupsRes.ok ? groupsRes.json() : [],
          tasksRes.ok ? tasksRes.json() : [],
        ]);

        setStats({
          users: Array.isArray(users) ? users.length : 0,
          groups: Array.isArray(groups) ? groups.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
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

      <h2>Welcome back, {adminName}! 👋</h2>

      <div
        style={{
          background: "linear-gradient(135deg, #DC3545, #FF6B6B)",
          color: "white",
          padding: "2rem",
          borderRadius: "16px",
          marginTop: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 12px 30px rgba(220,53,69,0.35)",
        }}
      >
        <h2 style={{ margin: 0 }}>🔐 Admin Dashboard</h2>
        <p style={{ marginTop: "0.75rem" }}>
          Manage users, groups, and tasks.
        </p>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
          <span style={{ fontWeight: "bold" }}>👥 {stats.users} Users</span>
          <span style={{ fontWeight: "bold" }}>🛡️ {stats.groups} Groups</span>
          <span style={{ fontWeight: "bold" }}>⚡ {stats.tasks} Tasks</span>
        </div>
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
            borderLeft: "6px solid #34D399",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3>🛡️ Manage Groups</h3>
          <p>Create groups, assign users, and auto-assign by group size.</p>
          <Link to="/admin/groups">
            <button>Manage Groups</button>
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
          <h3>👥 Manage Users</h3>
          <p>View all users, change roles, and reset passwords.</p>
          <Link to="/admin/groups">
            <button>Manage Users</button>
          </Link>
        </div>

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
          <h3>⚡ All Tasks</h3>
          <p>View all personal and group tasks across the platform.</p>
          <Link to="/admin/groups">
            <button>View Tasks</button>
          </Link>
        </div>

        <div
          style={{
            border: "none",
            borderLeft: "6px solid #A78BFA",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            💬 Messages
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
          <p>Message users directly as admin.</p>
          <Link to="/messages">
            <button>View Messages</button>
          </Link>
        </div>
      </div>
    </div>
  );
}