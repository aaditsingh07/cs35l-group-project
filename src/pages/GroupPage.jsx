import React from "react";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5001";

function GroupPage() {
  const [group, setGroup] = React.useState(null);
  const [members, setMembers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function fetchMyGroup() {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${BASE}/api/groups/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load group.");
          return;
        }

        setGroup(data.group);
        setMembers(data.members);
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyGroup();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1>🛡️ Your Group</h1>
        <p>Loading group information...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <Link to="/dashboard">← Back to Dashboard</Link>

      <h1>🛡️ Your Group</h1>

      <p>
        View your assigned project group and collaborate with teammates.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && !group && (
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginTop: "2rem",
          }}
        >
          <h2>No Group Assigned</h2>
          <p>You have not been assigned to a project group yet.</p>
        </div>
      )}

      {!error && group && (
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginTop: "2rem",
            borderLeft: "6px solid #FF6B6B",
          }}
        >
          <h2>Group Information</h2>

          <p>
            <strong>Group Name:</strong> {group.name}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {group.description || "No description yet."}
          </p>

          <h2 style={{ marginTop: "2rem" }}>Group Members</h2>

          {members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <ul
              style={{
                textAlign: "left",
                maxWidth: "500px",
                margin: "0 auto",
                lineHeight: "2",
              }}
            >
              {members.map((member) => (
                <li key={member.id}>
                  <strong>{member.name}</strong> — {member.email}
                </li>
              ))}
            </ul>
          )}

          <h2 style={{ marginTop: "2rem" }}>Group Tools</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <Link to="/tasks">
              <button>⚡ Task Board</button>
            </Link>

            <Link to="/meetings">
              <button>📅 Meetings</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupPage;