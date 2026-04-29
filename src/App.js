import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
   </BrowserRouter>
  );
}

export default App;
