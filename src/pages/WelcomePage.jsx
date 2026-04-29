import React from "react";
import { Link } from "react-router-dom";

function WelcomePage() {
  return (
    <div>
      <h1> Welcome to CS35L GroupHub </h1>
      <p>
        A project management app for CS35L students to communicate, schedule
        meetings, and organize group tasks.
      </p>

      <Link to="/login">
        <button>Log In</button>
      </Link>

      <Link to="/signup">
        <button>Sign Up</button>
      </Link>
    </div>
  );
}
export default WelcomePage;
