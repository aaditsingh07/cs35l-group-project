import React from "react";

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
      loadConversation(null, true, "Group Chat");
      return;
    }
    loadConversation(group.id, true, group.title || "Group Chat");
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

  // Let user also hit enter to send message
  function handleEnterSend(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  React.useEffect(() => {
    fetchMessages();
  }, []);

  // Load at latest message
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          width: "20vw",
          backgroundColor: "#f4f4f4",
          padding: "20px",
          paddingTop: "10px",
          overflowY: "auto",
        }}
      >
        <h1 style={{ margin: "0", padding: "0" }}>Conversations</h1>
        <div name="group-conversation-list"></div>
        <button
          onMouseEnter={() => setGroupBtnHover(true)}
          onMouseLeave={() => setGroupBtnHover(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            marginTop: "1rem",
            fontSize: "1.2em",
            color: groupBtnHover ? "#555" : "#000",
            borderBottom: groupBtnHover
              ? "2px solid #555"
              : "2px solid transparent",
          }}
          onClick={openGroupConversation}
        >
          Group Chat
        </button>
        <div style={{ marginTop: "1rem" }} name="user-conversation-list">
          <h3 style={{ marginTop: "1rem" }}>Direct Messages</h3>
          {!showPicker && (
            <button onClick={openPicker}>Create Conversation</button>
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
                        background: isActive ? "#e0e0e0" : "none",
                        border: "none",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        color: "#333",
                        fontSize: "1em",
                        borderRadius: "4px",
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "80vw",
          padding: "20px",
        }}
        name="message-view"
      >
        {!activeConversation && (
          <div style={{ margin: "auto", color: "#888" }}>
            Select a conversation to start messaging.
          </div>
        )}
        {activeConversation && (
          <>
            <h2 style={{ margin: "0 0 1rem 0" }}>{activeConversation.title}</h2>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "0.5rem",
                background: "#fafafa",
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
                <div style={{ color: "#888" }}>No messages yet.</div>
              )}
              {messages.map((m) => {
                const mine = m.sender_id === currentUserId;
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: mine ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      background: mine ? "#cce5ff" : "#eee",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75em",
                        color: "#555",
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
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!activeConversation.id || sending || !draft.trim()}
                style={{ padding: "0 1rem" }}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
