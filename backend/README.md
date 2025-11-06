# Backend (Express + Mongoose)

This is a minimal starter backend for the Emexa project.

Quick start:

1. Copy `.env.example` to `.env` and update `MONGO_URI` and other env vars.
2. Install dependencies:

```powershell
cd backend; npm install
```

3. Run in development (requires `nodemon`):

```powershell
cd backend; npm run dev
```

API endpoints:
- GET  / -> health check
- GET  /api/users -> list users (protected placeholder middleware)
- POST /api/users -> create user

Notes:
- This uses ES modules (`type: module`), keep that if you modify `package.json`.
- Replace the placeholder auth in `middleware/auth.js` with real JWT/session logic.
