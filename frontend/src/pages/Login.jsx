import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page page-auth">
      <div className="auth-layout">
        {/* Left: login card */}
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
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </form>
          <p className="text-muted" style={{ marginTop: "0.75rem" }}>
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>

        {/* Right: floating PULSE hero */}
        <div className="auth-hero">
          <div className="hero-title">PULSE</div>
          <p className="hero-subtitle">
            Intelligent video sensitivity analysis with real-time streaming and
            multi-tenant controls.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;