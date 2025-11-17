import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
  Outlet
} from "react-router-dom";
import "./App.css";

/* ---------------------------
   DEFAULTS
   --------------------------- */
const DEFAULTS = {
  theme: "light",
  notifications: true
};

/* ---------------------------
   NAVBAR
   --------------------------- */
function Navbar() {
  return (
    <nav className="nav">
      <NavLink to="/login" className="nav-link">Login</NavLink>
      <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
      <NavLink to="/user/101" className="nav-link">User 101</NavLink>
    </nav>
  );
}

/* ---------------------------
   LOGIN
   --------------------------- */
function Login() {
  const navigate = useNavigate();
  function handleLogin() {
    navigate("/dashboard");
  }

  return (
    <section>
      <h2>Login</h2>
      <p>Click the button to enter Dashboard.</p>
      <button className="btn" onClick={handleLogin}>Login</button>
    </section>
  );
}

/* ---------------------------
   DASHBOARD LAYOUT (uses Outlet)
   --------------------------- */
function DashboardLayout() {
  return (
    <div>
      <h2>Dashboard</h2>

      <div className="subnav">
        {/* Use relative links; Dashboard route is /dashboard */}
        <NavLink to="/dashboard" end className="subnav-link">Home</NavLink>
        <NavLink to="/dashboard/profile" className="subnav-link">Profile</NavLink>
        <NavLink to="/dashboard/settings" className="subnav-link">Settings</NavLink>
      </div>

      <div className="nested-area">
        {/* Outlet renders nested child routes declared at top-level Routes */}
        <Outlet />
      </div>
    </div>
  );
}

function DashboardMain() {
  return (
    <section>
      <h3>Dashboard Home</h3>
      <p>Welcome to your dashboard.</p>
    </section>
  );
}

function Profile() {
  return (
    <section>
      <h3>User Profile</h3>
      <p>This is your profile section.</p>
    </section>
  );
}

/* ---------------------------
   SETTINGS (with persistence)
   --------------------------- */
function Settings() {
  const [theme, setTheme] = useState(DEFAULTS.theme);
  const [notifications, setNotifications] = useState(DEFAULTS.notifications);
  const [savedAt, setSavedAt] = useState(null);

  // load stored settings on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("settings_theme");
      const storedNotif = localStorage.getItem("settings_notifications");

      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
        document.documentElement.setAttribute("data-theme", storedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", DEFAULTS.theme);
      }

      if (storedNotif !== null) {
        setNotifications(storedNotif === "true");
      }
    } catch (e) {
      console.warn("Could not read settings from localStorage", e);
      document.documentElement.setAttribute("data-theme", DEFAULTS.theme);
    }
  }, []);

  // apply theme immediately when changed
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function handleSave() {
    try {
      localStorage.setItem("settings_theme", theme);
      localStorage.setItem("settings_notifications", notifications ? "true" : "false");
      setSavedAt(new Date().toLocaleString());
    } catch (e) {
      console.warn("Could not save settings to localStorage", e);
    }
  }

  function handleReset() {
    setTheme(DEFAULTS.theme);
    setNotifications(DEFAULTS.notifications);
    try {
      localStorage.removeItem("settings_theme");
      localStorage.removeItem("settings_notifications");
    } catch (e) {
      console.warn("Could not clear settings from localStorage", e);
    }
    setSavedAt(null);
    document.documentElement.setAttribute("data-theme", DEFAULTS.theme);
  }

  return (
    <section>
      <h3>Settings</h3>

      <p className="muted">Change visual and notification preferences for this dashboard. Click Save to persist.</p>

      <div className="setting-box">
        <h4>Theme</h4>
        <div className="setting-options">
          <label className="radio-label">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
            />
            Light
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />
            Dark
          </label>
        </div>

        <p className="hint" style={{ marginTop: 10 }}>
          Theme applies immediately but will be persisted only when you click <strong>Save</strong>.
        </p>
      </div>

      <div className="setting-box">
        <h4>Notifications</h4>

        <label className="toggle-label">
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(v => !v)}
          />
          Enable Email Notifications
        </label>

        <p className="hint" style={{ marginTop: 10 }}>
          Toggle email notifications for dashboard alerts. This setting is saved when you click <strong>Save</strong>.
        </p>
      </div>

      <div className="setting-box">
        <h4>Account</h4>
        <p>Status: <strong style={{ color: "green" }}>Active</strong></p>
        <p className="muted">No destructive account actions are available from this demo page.</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <button className="btn" onClick={handleSave}>Save</button>
        <button className="btn secondary" onClick={handleReset}>Reset</button>
        <div className="settings-status">
          {savedAt ? `Saved: ${savedAt}` : "Not saved"}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------
   USER DETAILS (dynamic)
   --------------------------- */
function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <section>
      <h2>User Details</h2>
      <p>User ID: <strong>{id}</strong></p>

      <button className="btn" onClick={() => navigate(-1)}>Go Back</button>
    </section>
  );
}

/* ---------------------------
   APP (top-level Routes with nested children)
   --------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Dashboard route with nested child routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardMain />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/user/:id" element={<UserDetails />} />

          <Route path="/" element={<Login />} />
          <Route path="*" element={<h2>404 Page Not Found</h2>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}