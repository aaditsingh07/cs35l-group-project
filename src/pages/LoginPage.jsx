import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  if (localStorage.getItem("token")) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      navigate("/dashboard");
    } catch (err) {
      setError("Could not connect to the server.");
    }
  }

  return (
    <div>
      <h1>Welcome back</h1>
      <p>Sign in to your account</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Sign In</button>
      </form>

      {/* Footer */}
      <p>
        Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
