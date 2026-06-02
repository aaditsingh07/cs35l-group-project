import React from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5001/api/admin";
const CREATE_NEW_GROUP = "__create_new__";
const UNGROUP = "__none__";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function AdminManageUsers() {
  const [users, setUsers] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState(() => new Set());
  const [bulkChoice, setBulkChoice] = React.useState("");
  const [applying, setApplying] = React.useState(false);

  React.useEffect(() => {
    fetchUsers("");
    fetchGroups();
  }, []);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      fetchUsers(search);
      setSelectedIds(new Set());
    }, 250);
    return () => clearTimeout(handle);
  }, [search]);

  async function fetchUsers(q) {
    try {
      const url = q ? `${API}/users/search?q=${encodeURIComponent(q)}` : `${API}/users`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) { setError("Failed to load users."); return; }
      setUsers(await res.json());
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function fetchGroups() {
    const res = await fetch(`${API}/groups`, { headers: authHeaders() });
    if (res.ok) setGroups(await res.json());
  }

  async function toggleRole(user) {
    const newRole = user.account_type === "admin" ? "user" : "admin";
    const res = await fetch(`${API}/users/${user.id}/role`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ account_type: newRole }),
    });
    if (res.ok) fetchUsers(search);
  }

  async function updatePassword(user) {
    const newPassword = window.prompt(`Enter new password for ${user.name}:`);
    if (!newPassword) return;
    const res = await fetch(`${API}/admin/users/${user.id}/password`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: newPassword }),
    });
    alert(res.ok ? "Password updated successfully." : "Failed to update password.");
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const visibleIds = users.map((u) => u.id);
      const allSelected = visibleIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(visibleIds);
    });
  }

  async function applyBulk() {
    if (selectedIds.size === 0 || !bulkChoice) return;
    setApplying(true);
    setError("");
    try {
      let targetGroupId;
      if (bulkChoice === UNGROUP) {
        targetGroupId = null;
      } else if (bulkChoice === CREATE_NEW_GROUP) {
        const name = window.prompt("New group name:");
        if (!name?.trim()) { setApplying(false); return; }
        const description = window.prompt("Description (optional):") ?? "";
        const createRes = await fetch(`${API}/groups`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
        });
        if (!createRes.ok) { setError("Failed to create group."); setApplying(false); return; }
        const created = await createRes.json();
        targetGroupId = created.id;
        await fetchGroups();
      } else {
        targetGroupId = Number(bulkChoice);
      }
      const res = await fetch(`${API}/users/group-bulk`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: Array.from(selectedIds), group_id: targetGroupId }),
      });
      if (!res.ok) { setError("Failed to assign users to group."); return; }
      setSelectedIds(new Set());
      setBulkChoice("");
      await fetchUsers(search);
      await fetchGroups();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setApplying(false);
    }
  }

  const allVisibleSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <Link to="/admin">← Back to Dashboard</Link>

      <h1 style={{ color: "#0B5ED7" }}>👥 User Management</h1>
      <p>View all users, change roles, and reset passwords.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search users by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.4rem", width: "300px" }}
        />
      </div>

      {selectedIds.size > 0 && (
        <div
          style={{
            display: "flex", gap: "0.75rem", alignItems: "center",
            padding: "0.75rem", marginBottom: "0.75rem",
            background: "#f0f4ff", border: "1px solid #aac", borderRadius: "4px",
          }}
        >
          <strong>{selectedIds.size} selected</strong>
          <select value={bulkChoice} onChange={(e) => setBulkChoice(e.target.value)} disabled={applying}>
            <option value="" disabled>-- Choose group --</option>
            <option value={UNGROUP}>None (remove from group)</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            <option value={CREATE_NEW_GROUP}>+ Create new group…</option>
          </select>
          <button onClick={applyBulk} disabled={!bulkChoice || applying}>
            {applying ? "Applying…" : "Apply"}
          </button>
          <button onClick={() => setSelectedIds(new Set())} disabled={applying}>Clear</button>
        </div>
      )}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} aria-label="Select all visible users" /></th>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Group</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td><input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelected(u.id)} aria-label={`Select ${u.name}`} /></td>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.account_type}</td>
              <td>{u.group_name ?? "—"}</td>
              <td>
                <button onClick={() => toggleRole(u)}>{u.account_type === "admin" ? "Make User" : "Make Admin"}</button>
                <button onClick={() => updatePassword(u)}>Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}