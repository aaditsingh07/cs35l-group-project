import React from "react";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5001";

export default function MessagesPage() {
  const [conversations, setConversations] = React.useState({
    userConversations: [],
    groupConversations: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [groupBtnHover, setGroupBtnHover] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [showPicker, setShowPicker] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [createError, setCreateError] = React.useState("");

  const [activeConversation, setActiveConversation] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [messagesError, setMessagesError] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const isAdmin = localStorage.getItem("account_type") === "admin";

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  })();

  const messagesEndRef = React.useRef(null);

  function fetchMessages() {
    setLoading(true);
    fetch(`${BASE}/api/conversations`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load conversations.");
        setLoading(false);
      });
  }

  function openPicker() {
    setCreateError("");
    setShowPicker(true);
    if (users.length === 0) {
      fetch(`${BASE}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => setCreateError("Failed to load users."));
    }
  }

  function cancelPicker() {
    setShowPicker(false);
    setSelectedUserId("");
    setCreateError("");
  }

  function startConversation() {
    if (!selectedUserId) {
      setCreateError("Please select a user.");
      return;
    }
    fetch(`${BASE}/api/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ toUserId: Number(selectedUserId) }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setCreateError(data.error || "Failed to create conversation.");
          return;
        }
        cancelPicker();
        fetchMessages();
      })
      .catch(() => setCreateError("Failed to create conversation."));
  }

  function loadConversation(id, isGroup, title) {
    if (!id) {
      setMessagesError("No group conversation available.");
      setActiveConversation({
        id: null,
        isGroup,
        title: title || "Group Chat",
      });
      setMessages([]);
      return;
    }
    setActiveConversation({ id, isGroup, title });
    setMessages([]);
    setMessagesError("");
    setDraft("");
    setMessagesLoading(true);
    fetch(
      `${BASE}/api/conversations/${id}/messages?isGroup=${isGroup ? "true" : "false"}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    )
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setMessagesError(data.error || "Failed to load messages.");
          setMessagesLoading(false);
          return;
        }
        setMessages(Array.isArray(data) ? data : []);
        setMessagesLoading(false);
      })
      .catch(() => {
        setMessagesError("Failed to load messages.");
        setMessagesLoading(false);
      });
  }

  function openGroupConversation() {
    const group = conversations.groupConversations[0];
    if (!group) {
      if (isAdmin) {
        // Admin group chat not yet created — show placeholder
        loadConversation(null, true, "Admin Group Chat");
      }
      // Non-admin ungrouped students can't reach here since the button is hidden
      return;
    }
    const title = isAdmin
      ? group.title || "Admin Group Chat"
      : group.title || "Group Chat";
    loadConversation(group.id, true, title);
  }

  function sendMessage() {
    if (!activeConversation || !activeConversation.id) return;
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    fetch(`${BASE}/api/conversations/${activeConversation.id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        content: text,
        isGroup: activeConversation.isGroup,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setMessagesError(data.error || "Failed to send message.");
          setSending(false);
          return;
        }
        setMessages((prev) => [...prev, data]);
        setDraft("");
        setSending(false);
      })
      .catch(() => {
        setMessagesError("Failed to send message.");
        setSending(false);
      });
  }

  function handleEnterSend(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  React.useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!activeConversation?.id) return;
    const interval = setInterval(() => {
      fetch(
        `${BASE}/api/conversations/${activeConversation.id}/messages?isGroup=${activeConversation.isGroup ? "true" : "false"}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
        .then((res) => res.json())
        .then((data) => { if (Array.isArray(data)) setMessages(data); })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConversation?.id]);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
          background: "white",
          borderBottom: "1px solid #eee",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          gap: "1rem",
          flexShrink: 0,
        }}
      >
        <Link
          to={isAdmin ? "/admin" : "/dashboard"}
          style={{ textDecoration: "none", color: "#0B5ED7", fontWeight: "bold" }}
        >
          ← Back to Dashboard
        </Link>
        <span style={{ color: "#888", fontSize: "0.9rem" }}>
          {isAdmin ? "Admin" : "Student"} · Messages
        </span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "1rem" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "20vw",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginRight: "1.5rem",
            padding: "20px",
            paddingTop: "10px",
            overflowY: "auto",
          }}
        >
          <h1
            style={{
              margin: 0,
              padding: 0,
              color: "#0B5ED7",
              fontSize: "2.5rem",
            }}
          >
            💬 Messages
          </h1>

          <div name="group-conversation-list"></div>

          {/* Group chat section — three cases */}
          {isAdmin ? (
            // Case 1: Admin — always show Admin Group Chat button
            <button
              onClick={openGroupConversation}
              style={{
                background: activeConversation?.isGroup ? "#E8F1FF" : "white",
                border: activeConversation?.isGroup
                  ? "2px solid #3A86FF"
                  : "1px solid #ddd",
                padding: "12px",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                color: "#333",
                borderRadius: "12px",
                fontWeight: "bold",
                marginTop: "1rem",
              }}
            >
              🔐 Admin Group Chat
            </button>
          ) : conversations.groupConversations.length > 0 ? (
            // Case 2: Student in a group — show Group Chat button
            <button
              onClick={openGroupConversation}
              style={{
                background: activeConversation?.isGroup ? "#E8F1FF" : "white",
                border: activeConversation?.isGroup
                  ? "2px solid #3A86FF"
                  : "1px solid #ddd",
                padding: "12px",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                color: "#333",
                borderRadius: "12px",
                fontWeight: "bold",
                marginTop: "1rem",
              }}
            >
              👥 Group Chat
            </button>
          ) : (
            // Case 3: Student not in a group — show info message
            <div
              style={{
                marginTop: "1rem",
                padding: "12px",
                borderRadius: "12px",
                background: "#FFF8E1",
                border: "1px solid #FFD54F",
                color: "#795548",
                fontSize: "0.875rem",
              }}
            >
              📭 You are not currently assigned to a group.
            </div>
          )}

          <div style={{ marginTop: "1rem" }} name="user-conversation-list">
            <h3 style={{ marginTop: "1rem" }}>Direct Messages</h3>
            {!showPicker && (
              <button
                onClick={openPicker}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#FFC107",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "1rem",
                }}
              >
                Create Conversation
              </button>
            )}
            {showPicker && (
              <div style={{ marginBottom: "0.5rem" }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{ width: "100%", marginBottom: "0.25rem" }}
                >
                  <option value="">Select a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button onClick={startConversation}>Start</button>
                  <button onClick={cancelPicker}>Cancel</button>
                </div>
                {createError && (
                  <div style={{ color: "red", marginTop: "0.25rem" }}>
                    {createError}
                  </div>
                )}
              </div>
            )}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {loading && <li>Loading...</li>}
              {error && <li style={{ color: "red" }}>{error}</li>}
              {!loading &&
                !error &&
                conversations.userConversations.map((conv) => {
                  const isActive =
                    activeConversation &&
                    !activeConversation.isGroup &&
                    activeConversation.id === conv.id;
                  return (
                    <li key={conv.id} style={{ marginBottom: "0.5rem" }}>
                      <button
                        onClick={() =>
                          loadConversation(conv.id, false, conv.other_user_name)
                        }
                        style={{
                          background: isActive ? "#E8F1FF" : "white",
                          border: isActive
                            ? "2px solid #3A86FF"
                            : "1px solid #ddd",
                          padding: "12px",
                          cursor: "pointer",
                          textAlign: "left",
                          width: "100%",
                          color: "#333",
                          borderRadius: "12px",
                          fontWeight: isActive ? "bold" : "normal",
                        }}
                      >
                        Conversation with {conv.other_user_name}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        {/* Message view */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "20px",
          }}
          name="message-view"
        >
          {!activeConversation && (
            <div
              style={{
                margin: "auto",
                textAlign: "center",
                color: "#888",
              }}
            >
              <h2>💬 No Conversation Selected</h2>
              <p>Select a conversation from the left sidebar.</p>
            </div>
          )}
          {activeConversation && (
            <>
              <h2
                style={{
                  margin: "0 0 1rem 0",
                  color: "#0B5ED7",
                  fontSize: "2rem",
                }}
              >
                💬 {activeConversation.title}
              </h2>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  border: "none",
                  borderRadius: "16px",
                  padding: "0.5rem",
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {messagesLoading && <div>Loading messages...</div>}
                {messagesError && (
                  <div style={{ color: "red" }}>{messagesError}</div>
                )}
                {!messagesLoading && !messagesError && messages.length === 0 && (
                  <div
                    style={{
                      color: "#888",
                      textAlign: "center",
                      marginTop: "2rem",
                    }}
                  >
                    💬 No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map((m) => {
                  const mine = m.sender_id === currentUserId;
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        background: mine ? "#3A86FF" : "#F2F2F2",
                        color: mine ? "white" : "#222",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75em",
                          color: mine ? "rgba(255,255,255,0.8)" : "#555",
                          marginBottom: "0.15rem",
                        }}
                      >
                        {m.sender_name || "Unknown"} ·{" "}
                        {new Date(
                          m.created_at.endsWith("Z")
                            ? m.created_at
                            : m.created_at + "Z",
                        ).toLocaleString()}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleEnterSend}
                  placeholder={
                    activeConversation.id
                      ? "Type a message..."
                      : "No conversation available."
                  }
                  disabled={!activeConversation.id || sending}
                  rows={2}
                  style={{
                    flex: 1,
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    padding: "12px",
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!activeConversation.id || sending || !draft.trim()}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#FFC107",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}