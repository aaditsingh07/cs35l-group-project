import React from "react";

const BASE = "http://localhost:5001";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p style={{ color: "#888", fontStyle: "italic" }}>No tasks yet.</p>;
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            padding: "0.8   rem 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => onToggle(task)}
            style={{ flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <strong
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "#999" : "inherit",
              }}
            >
              {task.title}
            </strong>
            {task.description && (
              <p
                style={{
                  margin: "0.25rem 0 0",
                  color: "#555",
                  fontSize: "0.9em",
                }}
              >
                {task.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              flexShrink: 0,
              color: "#c00",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function TasksPage() {
  const [personalTasks, setPersonalTasks] = React.useState([]);
  const [groupTasks, setGroupTasks] = React.useState([]);
  const [hasGroup, setHasGroup] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isGroupTask, setIsGroupTask] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  async function fetchTasks() {
    try {
      const res = await fetch(`${BASE}/api/tasks/get`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load tasks.");
        return;
      }
      setHasGroup(data.hasGroup);
      setGroupTasks(data.group ?? []);
      setPersonalTasks(data.personal ?? []);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (isGroupTask && !hasGroup) {
      setError("You must be in a group to create a group task.");
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/tasks/create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, description, isGroupTask }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create task.");
        return;
      }
      if (data.group_id) {
        setGroupTasks((prev) => [data, ...prev]);
      } else {
        setPersonalTasks((prev) => [data, ...prev]);
      }
      setTitle("");
      setDescription("");
      setFormOpen(false);
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${BASE}/api/tasks/delete`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete task.");
        return;
      }
      setPersonalTasks((prev) => prev.filter((t) => t.id !== id));
      setGroupTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function handleToggle(task) {
    try {
      const res = await fetch(`${BASE}/api/tasks/toggle`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ completed: !task.completed, id: task.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update task.");
        return;
      }
      const update = (prev) =>
        prev.map((t) =>
          t.id === data.id ? { ...t, completed: data.completed } : t,
        );
      setPersonalTasks(update);
      setGroupTasks(update);
    } catch {
      setError("Could not connect to the server.");
    }
  }

  function matchesSearch(task) {
    const keyword = searchTerm.trim().toLowerCase();

    if(!keyword){
      return true;
    }
    
    return(task.title.toLowerCase().includes(keyword)||
           (task.description || "").toLowerCase(),includes(keyword)
    );
  }
  const filteredPersonalTasks = personalTasks.filter(matchSearch);
  const filterGroupTasks = groupTasks.filter(matchesSearch);
  const hasSearchResult = filteredPersonalTasks > 0 || filterGroupTasks
  
  const columnStyle = {
    flex: 1,
    minWidth: 0,
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fafafa",
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Task Board</h1>
        <button
          onClick={() => {
            setFormOpen((o) => !o);
            setIsGroupTask(false);
            setError("");
          }}
        >
          {formOpen ? "Cancel" : "New Task"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem", maxWidth: "420px"}}>
        <label htmlFor="task-search" style={{ fontWeight: 500 }}>
          Search Tasks
        </label>
        <input
          id="task-search"
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.25rem",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
          />
      </div>

      {formOpen && (
        <form
          onSubmit={handleCreate}
          noValidate
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxWidth: "400px",
          }}
        >
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="What needs to be done?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: 500 }}>Type:</span>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="taskType"
                checked={!isGroupTask}
                onChange={() => setIsGroupTask(false)}
              />
              Personal
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="taskType"
                checked={isGroupTask}
                onChange={() => setIsGroupTask(true)}
              />
              Group
            </label>
          </div>
          <button type="submit" style={{ alignSelf: "flex-start" }}>
            Add Task
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
      <>
        {searchTerm.trim() && !hasSearchResults && (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          No tasks match your search.
        </p>
      )}
        <div
          style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}
        >
          <div style={columnStyle}>
            <h2 style={{ marginTop: 0 }}>Personal Tasks</h2>
            <TaskList
              tasks={filteredPersonalTasks}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>

          {hasGroup && (
            <div style={columnStyle}>
              <h2 style={{ marginTop: 0 }}>Group Tasks</h2>
              <TaskList
                tasks={filteredGroupTasks}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </>
    )}
    </div>
  );
}
