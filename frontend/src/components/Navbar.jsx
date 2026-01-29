import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ( { theme, onToggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-logo">Pulse</span>
        {user && (
          <>
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
            {(user.role === "editor" || user.role === "admin") && (
            <Link to="/upload" className="nav-link">
              Upload
            </Link>
            )}
          </>
        )}
      </div>

      <div className="nav-right">
        <button className="btn btn-ghost" onClick={onToggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {user ? (
          <>
            <span className="nav-user">
              {user.email} · <strong>{user.role}</strong>
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;