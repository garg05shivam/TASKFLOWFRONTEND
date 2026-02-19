import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "./Auth.css";

function VerifyOtp() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [form, setForm] = useState({
    email: params.get("email") || "",
    otp: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: form.email.trim().toLowerCase(),
      otp: form.otp.trim(),
    };

    if (!payload.email || !payload.otp) {
      toast.error("Email and OTP are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/verify-otp", payload);
      toast.success(response.data.message || "Account verified successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "OTP verification failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      setResending(true);
      const response = await api.post("/auth/resend-otp", { email });
      toast.success(response.data.message || "New OTP sent to your email.");
    } catch (error) {
      const message = error.response?.data?.message || "Could not resend OTP.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">TaskFlow</p>
        <h2>Verify OTP</h2>
        <p className="auth-description">
          Enter the OTP sent to your email to activate login access.
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

          <label htmlFor="otp">OTP</label>
          <input
            id="otp"
            name="otp"
            type="text"
            maxLength={6}
            placeholder="6-digit code"
            value={form.otp}
            onChange={handleChange}
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            className="auth-button auth-button-secondary"
            type="button"
            disabled={resending || loading}
            onClick={handleResendOtp}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </form>

        <p className="auth-footer">
          Back to <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
