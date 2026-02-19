import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Routes, Route, useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "./api/axios";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
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
      </Routes>
    </>
  );
}

export default App;
