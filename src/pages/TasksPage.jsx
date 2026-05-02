import React from "react";

const BASE = "http://localhost:5001";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState([]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);

  async function fetchTasks() {
    try {
      const res = await fetch(`${BASE}/api/tasks`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load tasks.");
        return;
      }
      setTasks(data);
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

    try {
      const res = await fetch(`${BASE}/api/tasks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create task.");
        return;
      }
      setTasks((prev) => [data, ...prev]);
      setTitle("");
      setDescription("");
      setFormOpen(false);
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${BASE}/api/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete task.");
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function handleToggle(task) {
    try {
      const res = await fetch(`${BASE}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update task.");
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } catch {
      setError("Could not connect to the server.");
    }
  }

  return (
    <div>
      <div>
        <h1>Task Board</h1>
        <button onClick={() => setFormOpen((o) => !o)}>
          {formOpen ? "Cancel" : "New Task"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {formOpen && (
        <form onSubmit={handleCreate} noValidate>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
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
            />
          </div>

          <button type="submit">Add Task</button>
        </form>
      )}

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Create one to get started.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={!!task.completed}
                onChange={() => handleToggle(task)}
              />
              <div>
                <strong style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                  {task.title}
                </strong>
                {task.description && <p>{task.description}</p>}
              </div>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}