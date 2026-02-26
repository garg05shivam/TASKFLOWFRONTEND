import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Routes, Route, useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "./api/axios";
import { useAuth } from "./context/AuthContext";
import CreateProject from "./pages/CreateProject";
import CreateTask from "./pages/CreateTask";
import Dashboard from "./pages/Dashboard";
import EditTask from "./pages/EditTask";
import InviteAccept from "./pages/InviteAccept";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProjectDetails from "./pages/ProjectDetails";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast.error("Session expired. Please log in again.");
      navigate("/", { replace: true });
    });

    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id/tasks/new"
          element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:id/edit"
          element={
            <ProtectedRoute>
              <EditTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invite/accept"
          element={<InviteAccept />}
        />
      </Routes>
    </>
  );
}

export default App;
