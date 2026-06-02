import React from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5001/api/admin";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function AdminTasks() {
  const [tasks, setTasks] = React.useState([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`${API}/tasks`, { headers: authHeaders() });
        if (!res.ok) { setError("Failed to load tasks."); return; }
        setTasks(await res.json());
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <Link to="/admin">← Back to Dashboard</Link>

      <h1>⚡ All Tasks</h1>
      <p>View all personal and group tasks across the platform.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading tasks...</p>}

      {!loading && !error && (
        tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>{Object.keys(tasks[0]).map((k) => <th key={k}>{k}</th>)}</tr>
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