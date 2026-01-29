import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    tenantId: "demo-org-1",
    role: "editor"
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page page-auth">
      <div className="auth-layout">
        {/* Left: registration card */}
        <div className="auth-wrapper card">
          <h2 className="page-title">Create an account</h2>
          <p className="page-subtitle">
            Each account is isolated by tenant for secure multi-organisation use.
          </p>
          {error && <p className="text-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Name</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
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
            <div className="form-group">
              <label className="label">Tenant ID</label>
              <input
                className="input"
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Register
            </button>
          </form>
          <p className="text-muted" style={{ marginTop: "0.75rem" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        {/* Right: same hero so the first impression stays consistent */}
        <div className="auth-hero">
          <div className="hero-title">PULSE</div>
          <p className="hero-subtitle">
            Bring production-grade video verification and secure streaming into
            your workflows in minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;