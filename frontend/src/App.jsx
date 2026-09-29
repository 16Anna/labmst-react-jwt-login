import { useState, useEffect } from "react";

const API = "http://localhost:5000";

// ---------------------------------------------------------------
// Login page
// ---------------------------------------------------------------
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Token storage in the browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setMessage({ text: data.message, type: "success" });
        onLogin(); // re-read localStorage in App
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (err) {
      setMessage({
        text: "Cannot connect to backend. Is the server running on port 5000?",
        type: "error",
      });
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h1>React Login System</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-blue" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message.text && (
        <p className={`message ${message.type}`}>{message.text}</p>
      )}

      <div className="demo-box">
        <h3>Demo Credentials</h3>
        <p>
          <strong>Username:</strong> admin
        </p>
        <p>
          <strong>Password:</strong> 1234
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Protected Dashboard: calls GET /dashboard with the JWT
// ---------------------------------------------------------------
function Dashboard({ token, onLogout }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setInfo(data);
        } else {
          // Token invalid/expired -> force logout
          onLogout();
        }
      } catch (err) {
        setError("Cannot connect to backend.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="card">
      <h1>Welcome to the Protected Dashboard</h1>

      {error && <p className="message error">{error}</p>}

      {!info && !error && <p>Verifying token with backend...</p>}

      {info && (
        <>
          <p className="message success">{info.message}</p>
          <div className="info-box">
            <p>
              <strong>User ID:</strong> {info.userId}
            </p>
            <p>
              <strong>Role:</strong> {info.role}
            </p>
            <p>
              <strong>JWT Token:</strong> Stored in localStorage
            </p>
          </div>
          <details>
            <summary>Show stored token</summary>
            <p className="token">{token}</p>
          </details>
        </>
      )}

      <button className="btn btn-red" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// App: decides what to show based on the token in localStorage
// ---------------------------------------------------------------
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLogin = () => setToken(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
  };

  return (
    <div className="page">
      {localStorage.getItem("token") ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
