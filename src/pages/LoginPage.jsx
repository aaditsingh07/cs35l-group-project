
import React from "react";
import { Link } from "react-router-dom";

// ── Main component ────────────────────────────────────────────────────────────

export default function LoginPage({ onSuccess }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    async function handleSubmit(e) {
        //do stuff
    }

    return (
        <div>
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div>
                    <label htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                </div>
            </form>

            {/* Divider */}
            <div>
                <span />
                <span>or</span>
                <span />
            </div>

            {/* OAuth buttons */}
            <button
                type="button"
            >
                Continue with Google
            </button>

            {/* Footer */}
            <p>
                Don&apos;t have an account?{" "}
                <Link to="/signup">
                    <button>Sign Up</button>
                </Link>
            </p>
        </div>
    );
}