# Simple React Login System with JWT Authentication and Protected Dashboard

## 1. Aim
To build a simple full-stack application that demonstrates **authentication using JWT (JSON Web Token)**: a user logs in with a username and password, the backend generates a token containing `userId` and `role`, the token is stored in the browser's `localStorage`, and a **protected dashboard** is shown only to authenticated users.

## 2. Technologies Used
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Auth | jsonwebtoken (JWT) |
| Other | cors |

No database, no OAuth, no Firebase, no API keys. Demo authentication only.

## 3. Folder Structure
```
labmst/
├── backend/
│   ├── server.js          # Express server: /login and /dashboard
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Login page + Dashboard + auth logic
│   │   ├── App.css        # Styling
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
└── README.md
```

## 4. Architecture
```
 +---------------------+    POST /login {username,password}    +----------------------+
 |  React Frontend     | ------------------------------------> |  Express Backend     |
 |  (Vite, port 5173)  | <------------------------------------ |  (port 5000)         |
 |                     |    { token, userId, role }            |  jsonwebtoken        |
 |  localStorage:      |                                       |                      |
 |   - token           |    GET /dashboard                     |  verifyToken         |
 |   - role            | ----- Authorization: Bearer <token> ->|  middleware          |
 +---------------------+ <---- { userId, role } or 401 ------- +----------------------+
```

## 5. Workflow
1. User opens `http://localhost:5173`. No token in localStorage → **Login page** is shown.
2. User enters `admin` / `1234` and clicks **Login**.
3. Frontend sends `POST /login` to the backend.
4. Backend checks credentials. If valid, it creates a JWT with payload `{ userId: 101, role: "admin" }` signed with a secret key.
5. Frontend stores `token` and `role` in `localStorage`.
6. Since a token now exists, the **Dashboard** is shown.
7. The Dashboard calls `GET /dashboard` with header `Authorization: Bearer <token>`.
8. Backend middleware verifies the token using `jwt.verify()`. Valid → returns user info; invalid/missing/expired → HTTP 401 (frontend logs the user out).
9. On **Logout**, `token` and `role` are removed from localStorage and the Login page is shown again.

## 6. Installation Steps
1. Install **Node.js** (v18 or newer) from https://nodejs.org
2. Extract the ZIP file.
3. Open two terminals (one for backend, one for frontend).

## 7. Backend Setup Commands
```bash
cd backend
npm install
node server.js
```
Backend runs on **http://localhost:5000**

## 8. Frontend Setup Commands
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

## 9. How to Run the Project
1. Start the backend first (terminal 1).
2. Start the frontend (terminal 2).
3. Open **http://localhost:5173** in your browser.
4. Log in with the demo credentials.

## 10. Demo Username / Password
| Username | Password |
|----------|----------|
| admin | 1234 |

## 11. API Endpoints
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/login` | No | Validates credentials, returns JWT |
| GET | `/dashboard` | Yes (Bearer token) | Verifies JWT, returns userId and role |

## 12. Explanation of JWT
**JWT (JSON Web Token)** is a compact, signed string used to securely prove identity between client and server. It has three parts separated by dots:

`HEADER.PAYLOAD.SIGNATURE`

- **Header** – algorithm and token type (e.g. HS256, JWT).
- **Payload** – data (claims). Here: `userId`, `role`, plus `iat` (issued at) and `exp` (expiry).
- **Signature** – created using header + payload + secret key. If anyone changes the payload, the signature no longer matches and verification fails.

The server is **stateless**: it does not store sessions; it just verifies the token on each request. Token in this project expires in **1 hour**.

## 13. Explanation of Token Storage
After login, the token is saved in the browser using:
```js
localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
```
`localStorage` persists even after refreshing or closing the tab, so the user stays logged in. You can see it in the browser: **F12 → Application → Local Storage → http://localhost:5173**.

Note: localStorage is simple but can be read by JavaScript (XSS risk). Production apps often use HttpOnly cookies.

## 14. Explanation of Protected UI
The Dashboard is not shown unless a token exists in `localStorage`:
```jsx
{localStorage.getItem("token") ? <Dashboard /> : <Login />}
```
The Dashboard also calls the protected backend route `/dashboard` with the token. The backend verifies the JWT, so protection is real (server-side) and not just hiding a component. If the token is deleted, tampered with, or expired, the user is sent back to the Login page.

## 15. Expected Output
- **Login page:** card titled "React Login System" with Username, Password, blue Login button, and a Demo Credentials box.
- **Wrong credentials:** red message "Invalid username or password".
- **Correct credentials (admin / 1234):** Dashboard with
  - Welcome to the Protected Dashboard
  - User ID: 101
  - Role: admin
  - JWT Token: Stored in localStorage
  - Logout button
- **Logout:** token and role are removed from localStorage and the Login page returns.

## 16. Viva Questions and Answers

**Q1. What is authentication?**
Verifying who the user is (e.g. checking username and password).

**Q2. What is authorization?**
Deciding what an authenticated user is allowed to access (e.g. based on role).

**Q3. What is JWT?**
JSON Web Token, a signed token containing claims (like userId and role) used to authenticate requests.

**Q4. What are the three parts of a JWT?**
Header, Payload, Signature.

**Q5. What does our JWT payload contain?**
`userId: 101` and `role: "admin"` (plus `iat` and `exp` added automatically).

**Q6. Is JWT encrypted?**
No, it is encoded (Base64URL) and signed. Anyone can read the payload, so never put passwords in it.

**Q7. How does the server verify a token?**
Using `jwt.verify(token, SECRET_KEY)`, which recomputes the signature and checks expiry.

**Q8. Where is the token stored in this project?**
In the browser's `localStorage`.

**Q9. What is the `Authorization: Bearer <token>` header?**
The standard way to send a JWT to the server with each protected request.

**Q10. What does HTTP 401 mean?**
Unauthorized: token missing, invalid, or expired.

**Q11. What is a protected route?**
A route that runs only after the token is verified (middleware `verifyToken`).

**Q12. What is CORS and why is `cors` used?**
Cross-Origin Resource Sharing. Frontend (port 5173) and backend (port 5000) have different origins, so the backend must allow the browser to make the request.

**Q13. What happens on logout?**
Token and role are removed from localStorage and the Login page is shown.

**Q14. Why is the secret key important?**
It signs tokens. If leaked, anyone can forge valid tokens. In production it should be kept in an environment variable.

**Q15. Limitations of this demo?**
Hard-coded user, plain-text password, secret in code, localStorage storage. Real apps use a database, hashed passwords (bcrypt), env variables, and HTTPS.

**Q16. What is the difference between localStorage and sessionStorage?**
localStorage persists until cleared; sessionStorage is cleared when the tab closes.
