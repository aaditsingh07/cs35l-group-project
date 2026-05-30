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
    <div>
      <Link to="/dashboard">Back to Dashboard</Link>

      <h1>Meetings</h1>

      <p>This page allows users to propose meeting times.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Meeting Title</label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Project check-in"
          />
        </div>

        <div>
          <label>Meeting Time</label>
          <input
            type="datetime-local"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />
        </div>

        <button type="submit">Propose Meeting</button>
      </form>

      <h2>Proposed Meetings</h2>

      {meetings.length === 0 ? (
        <p>No meetings proposed yet.</p>
      ) : (
<ul>
  {meetings.map((meeting) => (
    <li
      key={meeting.id}
      style={{ marginBottom: "15px" }}
    >
      <strong>{meeting.title}</strong>

      <div>
        {new Date(meeting.meeting_time).toLocaleString()}
      </div>

      <button
        onClick={() => handleDelete(meeting.id)}
        style={{ marginTop: "5px" }}
      >
        Delete
      </button>
    </li>
  ))}
</ul>
      )}
    </div>
  );
}