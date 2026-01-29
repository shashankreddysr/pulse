import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/"); // or navigate("/dashboard") if you have
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-auth">
      <div className="auth-layout">
        {/* LEFT: login card */}
        <div className="auth-wrapper card">
          <h2 className="page-title">Welcome back</h2>
          <p className="page-subtitle">
            Sign in to manage sensitivity-checked video content.
          </p>

          {error && <p className="text-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                className="input"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-muted" style={{ marginTop: "0.75rem" }}>
            No account? <Link to="/register">Create one</Link>
          </p>

          <p className="text-muted" style={{ marginTop: "0.75rem" }}>
            Need help? <Link to="/contact">Contact us</Link>
          </p>
        </div>

        {/* RIGHT: floating PULSE hero */}
        <div className="auth-hero">
          <div className="hero-badge">AI + Real-time</div>

          <div className="hero-title">PULSE</div>

          <p className="hero-subtitle">
            Bring production-grade video verification and secure streaming into
            your workflows in minutes.
          </p>

          <ul className="hero-list">
            <li>Real-time streaming events</li>
            <li>Multi-tenant isolation</li>
            <li>Secure uploads + access control</li>
            <li>Audit-friendly logging</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;