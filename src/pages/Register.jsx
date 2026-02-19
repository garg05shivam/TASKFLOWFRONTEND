import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const slowToastId = "auth-slow";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (!payload.name || !payload.email || !payload.password) {
      toast.error("All fields are required.");
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

      const response = await api.post("/auth/register", payload);
      clearTimeout(delayedToast);
      toast.dismiss(slowToastId);
      toast.success(response.data.message || "Registered. Verify your account.");
      navigate(`/verify-otp?email=${encodeURIComponent(payload.email)}`);
    } catch (error) {
      clearTimeout(delayedToast);
      toast.dismiss(slowToastId);
      if (error.code === "ECONNABORTED") {
        toast.error("Server took too long to wake up. Please try again in 20-30 seconds.");
        return;
      }

      if (!error.response) {
        toast.error("Cannot reach server right now. Check backend status and try again.");
        return;
      }

      const message = error.response?.data?.message || "Registration failed.";
      const loweredMessage = message.toLowerCase();

      if (loweredMessage.includes("already") && loweredMessage.includes("email")) {
        toast.error("Email already exists. Please verify OTP or login.");
        navigate(`/verify-otp?email=${encodeURIComponent(payload.email)}`);
        return;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">TaskFlow</p>
        <h2>Create account</h2>
        <p className="auth-description">
          Register and verify your OTP to activate your account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />

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
            placeholder="Choose a strong password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
