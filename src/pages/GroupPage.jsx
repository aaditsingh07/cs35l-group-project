import React from "react";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5001";

function GroupPage() {
  // ========================================
  // State variables
  // group: stores the user's assigned group
  // members: stores the users in the same group
  // loading: true while the page is waiting for backend data
  // error: stores an error message if something goes wrong
  // ========================================
  const [group, setGroup] = React.useState(null);
  const [members, setMembers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // ========================================
  // Load group data from the backend
  // This runs once when the page first opens.
  // The backend uses the token to know which user is logged in.
  // ========================================
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

  // ========================================
  // Loading display
  // This shows while the frontend is waiting for backend data.
  // ========================================
  if (loading) {
    return (
      <div>
        <h1>Your Group</h1>
        <p>Loading group information...</p>
      </div>
    );
  }

  // ========================================
  // Main page UI
  // Shows the user's assigned group and group members.
  // ========================================
  return (
    <div>
      {/* ========================================
          Back link
          Allows the user to return to the dashboard.
          ======================================== */}
      <Link to="/dashboard">Back to Dashboard</Link>

      {/* ========================================
          Page title section
          Explains what this page is for.
          ======================================== */}
      <h1>Your Group</h1>

      <p>
        This page shows your assigned project group and group members.
      </p>

      {/* ========================================
          Error message section
          Shows a message if the backend request fails.
          ======================================== */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ========================================
          No group section
          Shows this if the user is logged in but has not been assigned to a group.
          ======================================== */}
      {!error && !group && (
        <div>
          <h2>No Group Assigned</h2>
          <p>You have not been assigned to a project group yet.</p>
        </div>
      )}

      {/* ========================================
          Group information section
          Shows the group name and description if a group exists.
          ======================================== */}
      {!error && group && (
        <div>
          <h2>Group Information</h2>

          <p>
            <strong>Group Name:</strong> {group.name}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {group.description || "No description yet."}
          </p>

          {/* ========================================
              Group members section
              Uses .map() to display each member in a list.
              ======================================== */}
          <h2>Group Members</h2>

          {members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <ul>
              {members.map((member) => (
                <li key={member.id}>
                  <strong>{member.name}</strong> — {member.email}
                </li>
              ))}
            </ul>
          )}
          {/* ========================================
              Group tools section
              Links to other pages that help the group work together.
              ======================================== */}
          <h2>Group Tools</h2>
          
          <ul>
            <li>
              <Link to="/tasks">Go to Task Board</Link>
            </li>
            <li>
              <Link to="/meetings">Go to Meetings</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default GroupPage;
