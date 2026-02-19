import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const slowToastId = "auth-slow";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(api.defaults.baseURL, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
    }).catch(() => {});
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (!payload.email || !payload.password) {
      toast.error("Please fill all fields.");
      return;
    }

    let delayedToast;
    try {
      setLoading(true);
      delayedToast = setTimeout(() => {
        toast.loading("Server is waking up. This can take a few seconds.", {
          id: slowToastId,
        });
      }, 4000);

      const response = await api.post("/auth/login", payload);
      clearTimeout(delayedToast);
      toast.dismiss(slowToastId);
      login(response.data.token);
      toast.success("Login successful.");
      navigate("/dashboard");
    } catch (error) {
      clearTimeout(delayedToast);
      toast.dismiss(slowToastId);
      const message = error.response?.data?.message || "Login failed.";
      toast.error(message);

      if (message.toLowerCase().includes("verify")) {
        navigate(`/verify-otp?email=${encodeURIComponent(payload.email)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">TaskFlow</p>
        <h2>Welcome back</h2>
        <p className="auth-description">
          Sign in to manage your projects and tasks.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Do not have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
