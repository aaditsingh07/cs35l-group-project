import React from "react";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5001/api";

export default function MeetingPage() {
  const [meetingTitle, setMeetingTitle] = React.useState("");
  const [meetingTime, setMeetingTime] = React.useState("");
  const [meetings, setMeetings] = React.useState([]);

  React.useEffect(() => {
    async function fetchMeetings() {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${BASE}/meetings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setMeetings(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchMeetings();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!meetingTitle.trim() || !meetingTime) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: meetingTitle.trim(),
          meeting_time: meetingTime,
        }),
      });

      const newMeeting = await res.json();

      setMeetings([newMeeting, ...meetings]);

      setMeetingTitle("");
      setMeetingTime("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${BASE}/meetings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMeetings(
        meetings.filter((meeting) => meeting.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <Link to="/dashboard">← Back to Dashboard</Link>

        <h1>📅 Meetings</h1>

        <p>
          Schedule project meetings and coordinate with your team.
        </p>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderLeft: "6px solid #3A86FF",
            marginTop: "1.5rem",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Meeting Title
              </label>

              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Project check-in"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Meeting Time
              </label>

              <input
                type="datetime-local"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button type="submit">
              📅 Propose Meeting
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: "3rem" }}>
        <h2>Proposed Meetings</h2>

        {meetings.length === 0 ? (
          <p>No meetings proposed yet.</p>
        ) : (
          <ul style={{ paddingLeft: "20px" }}>
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                style={{
                  marginBottom: "20px",
                  background: "white",
                  padding: "1rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  listStyle: "none",
                  maxWidth: "500px",
                }}
              >
                <strong>{meeting.title}</strong>

                <div style={{ marginTop: "0.5rem" }}>
                  {new Date(
                    meeting.meeting_time
                  ).toLocaleString()}
                </div>

                <button
                  onClick={() =>
                    handleDelete(meeting.id)
                  }
                  style={{
                    marginTop: "10px",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}