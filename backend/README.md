# Backend

This is the backend for the emexa project.

Quick start

1. Install dependencies

```powershell
cd backend
npm install
```

2. Copy environment variables

```powershell
copy .env.example .env
# edit .env to set MONGO_URI if you want DB-backed behaviour
```

3. Start the server

```powershell
# development (requires nodemon)
npm run dev

# or run directly
node server.js
```

Notes

- If `MONGO_URI` is not set the server will skip connecting to MongoDB (useful for quick local runs).
- For local development the `protect` middleware allows bypassing Authorization when `ALLOW_DEV_AUTH_BYPASS=true`.

API

- `GET /api/users` - requires Authorization header in production, returns users without passwords.
- `POST /api/users` - create a new user. Body: `{ name, email, password }`.
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
