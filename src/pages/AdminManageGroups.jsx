import React from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5001/api/admin";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function AdminManageGroups() {
  const [groups, setGroups] = React.useState([]);
  const [error, setError] = React.useState("");
  const [newGroupName, setNewGroupName] = React.useState("");
  const [newGroupDesc, setNewGroupDesc] = React.useState("");
  const [autoSize, setAutoSize] = React.useState("4");
  const [autoMsg, setAutoMsg] = React.useState("");

  React.useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const res = await fetch(`${API}/groups`, { headers: authHeaders() });
      if (!res.ok) { setError("Failed to load groups."); return; }
      setGroups(await res.json());
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function createGroup(e) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const res = await fetch(`${API}/groups`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim(), description: newGroupDesc.trim() || null }),
    });
    if (res.ok) { setNewGroupName(""); setNewGroupDesc(""); fetchGroups(); }
    else setError("Failed to create group.");
  }

  async function deleteGroup(id) {
    if (!window.confirm("Delete this group? Members will be ungrouped.")) return;
    const res = await fetch(`${API}/groups/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) fetchGroups();
  }

  async function handleAutoAssign() {
    setAutoMsg("");
    const res = await fetch(`${API}/groups/auto-assign`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ groupSize: Number(autoSize) }),
    });
    const data = await res.json();
    if (!res.ok) setAutoMsg(data.error);
    else { setAutoMsg(`Done — created ${data.groupsCreated} groups for ${data.usersAssigned} users.`); fetchGroups(); }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <Link to="/admin">← Back to Dashboard</Link>

      <h1 style={{ color: "#0B5ED7" }}>Groups</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={createGroup}
        style={{
          display: "flex", gap: "0.5rem", alignItems: "center",
          marginBottom: "1rem", padding: "0.75rem",
          background: "#f7f7f7", border: "1px solid #ccc", borderRadius: "4px",
        }}
      >
        <strong>New group:</strong>
        <input
          type="text"
          placeholder="Name (required)"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          style={{ padding: "0.4rem" }}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newGroupDesc}
          onChange={(e) => setNewGroupDesc(e.target.value)}
          style={{ padding: "0.4rem", flex: 1 }}
        />
        <button type="submit">Create</button>
      </form>

      <div
        style={{
          display: "flex", gap: "0.75rem", alignItems: "center",
          padding: "0.75rem", marginBottom: "1rem",
          background: "#f0f7ff", border: "1px solid #99c", borderRadius: 4,
        }}
      >
        <strong>Auto-assign unassigned users:</strong>
        <label>
          Group size:
          <input
            type="number" min="2" max="10"
            value={autoSize}
            onChange={(e) => setAutoSize(e.target.value)}
            style={{ width: 60, marginLeft: "0.4rem", padding: "0.3rem" }}
          />
        </label>
        <button onClick={handleAutoAssign}>Auto-Assign</button>
        {autoMsg && (
          <span style={{ color: autoMsg.startsWith("Done") ? "green" : "red" }}>{autoMsg}</span>
        )}
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Members</th>
            <th>Created</th>
            <th>Action</th>
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
    </div>
  );
}