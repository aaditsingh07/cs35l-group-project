import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import GroupPage from "./pages/GroupPage";
import MeetingsPage from "./pages/MeetingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import MessagesPage from "./pages/MessagesPage";
import AdminManageUsers from "./pages/AdminManageUsers";
import AdminManageGroups from "./pages/AdminManageGroups";
import AdminViewTasks from "./pages/AdminViewTasks";

function PublicRoute({ children }) {
  return localStorage.getItem("token") ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}

function StudentRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (localStorage.getItem("account_type") === "admin")
    return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (localStorage.getItem("account_type") !== "admin")
    return <Navigate to="/dashboard" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  return localStorage.getItem("token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <WelcomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <StudentRoute>
              <DashboardPage />
            </StudentRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <StudentRoute>
              <TasksPage />
            </StudentRoute>
          }
        />
        <Route
          path="/group"
          element={
            <StudentRoute>
              <GroupPage />
            </StudentRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <StudentRoute>
              <MeetingsPage />
            </StudentRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <AdminRoute>
              <AdminManageGroups />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <AdminRoute>
              <AdminViewTasks />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminManageUsers />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;