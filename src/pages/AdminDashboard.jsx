import React from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5001/api/admin";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("users");
  const [users, setUsers] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setError("");
    try {
      const [uRes, gRes, tRes] = await Promise.all([
        fetch(`${API}/users`, { headers: authHeaders() }),
        fetch(`${API}/groups`, { headers: authHeaders() }),
        fetch(`${API}/tasks`, { headers: authHeaders() }),
      ]);
      if (!uRes.ok || !gRes.ok || !tRes.ok) {
        setError("Failed to load admin data.");
        return;
      }
      setUsers(await uRes.json());
      setGroups(await gRes.json());
      setTasks(await tRes.json());
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function toggleRole(user) {
    const newRole = user.account_type === "admin" ? "user" : "admin";
    const res = await fetch(`${API}/users/${user.id}/role`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ account_type: newRole }),
    });
    if (res.ok) fetchAll();
  }

  async function deleteGroup(id) {
    if (!window.confirm("Delete this group? Members will be ungrouped.")) return;
    const res = await fetch(`${API}/groups/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) fetchAll();
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {["users", "groups", "tasks"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ fontWeight: tab === t ? "bold" : "normal" }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Group</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.account_type}</td>
                <td>{u.group_id ?? "—"}</td>
                <td>
                  <button onClick={() => toggleRole(u)}>
                    {u.account_type === "admin" ? "Make User" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "groups" && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Description</th><th>Members</th><th>Created</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.name}</td>
                <td>{g.description ?? "—"}</td>
                <td>{g.member_count}</td>
                <td>{g.created_at}</td>
                <td>
                  <button onClick={() => deleteGroup(g.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "tasks" && (
        tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {Object.keys(tasks[0]).map((k) => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={i}>
                  {Object.values(t).map((v, j) => <td key={j}>{String(v ?? "—")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
