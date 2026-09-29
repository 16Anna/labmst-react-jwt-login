// ---------------------------------------------------------------
// Backend: Express + JWT (demo authentication, no database)
// ---------------------------------------------------------------
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// Simple secret key stored directly in code (ONLY for college demo!)
const SECRET_KEY = "labmst_demo_secret_key";

// Demo user (hard-coded instead of a database)
const DEMO_USER = {
  userId: 101,
  username: "admin",
  password: "1234",
  role: "admin",
};

app.use(cors());
app.use(express.json());

// ---------------------- POST /login ----------------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    // Payload contains userId and role
    const payload = { userId: DEMO_USER.userId, role: DEMO_USER.role };

    // Generate token (expires in 1 hour)
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

    return res.json({
      message: "Login successful",
      token,
      userId: DEMO_USER.userId,
      role: DEMO_USER.role,
    });
  }

  return res.status(401).json({ message: "Invalid username or password" });
});

// ------------- Middleware: verify JWT on protected routes -------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // { userId, role, iat, exp }
    next();
  });
}

// -------------------- GET /dashboard (protected) --------------------
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard!",
    userId: req.user.userId,
    role: req.user.role,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
