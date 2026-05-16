import React from "react";
import { Link } from "react-router-dom";

function MeetingPage() {
  const [meetingTitle, setMeetingTitle] = React.useState("");
  const [meetingTime, setMeetingTime] = React.useState("");
  const [meetings, setMeetings] = React.useState([]);

  function handleSubmit(e) {
    e.preventDefault();

    const newMeeting = {
      id: Date.now(),
      title: meetingTitle,
      time: meetingTime,
    };

    setMeetings([newMeeting, ...meetings]);
    setMeetingTitle("");
    setMeetingTime("");
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
            <li key={meeting.id}>
              <strong>{meeting.title}</strong> — {meeting.time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
