import React from "react";
import { Link } from "react-router-dom";

export default function SignupPage({ onSuccess }) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");

    async function handleSubmit(e) {
        //do stuff
    }

    return (
        <div>
            <h1>Create an account</h1>
            <p>Sign up to get started</p>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div>
                    <label htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </div>

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
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirm">
                        Confirm Password
                    </label>
                    <input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => {
                            setConfirm(e.target.value);
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
                Already have an account?{" "}
                <Link to="/login">
                    <button>Sign In</button>
                </Link>
            </p>
        </div>
    );
}