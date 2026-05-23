import React from "react";
import { Link } from "react-router-dom";

function MeetingPage() {
  const [meetingTitle, setMeetingTitle] = React.useState("");
  const [meetingTime, setMeetingTime] = React.useState("");
  const [meetings, setMeetings] = React.useState([]);
  const [time, setTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  
  function handleSubmit(e) {
    event.preventDefault();

    if (!title.trim() || !date || !time){
      return;
    }
    
    const newMeeting = {
      id: Date.now(),
      title: title.trim(),
      date,
      time,
      notes: notes.trim(),
    };

    setMeetings([newMeeting, ...meetings]);
    setTitle("");
    setDate("");
    setTime("");
    setNotes("");
  }
  
  function handleDelete(id){
    setMeetings(meetings.filter((meeting) => meeting.id !== id));
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
