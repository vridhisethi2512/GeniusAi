# PrepGenius AI — Backend

Production-ready backend API for **PrepGenius AI**, an AI-powered placement preparation platform. Built with Node.js, Express, MongoDB (Mongoose), JWT authentication, and Google Gemini (free tier) for all AI features.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js (MVC architecture)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT (short-lived access token + httpOnly refresh token cookie), bcrypt password hashing
- **AI:** Google Gemini API (`@google/generative-ai`, free tier — `gemini-2.0-flash` by default)
- **File handling:** Multer (uploads) + pdf-parse / mammoth (text extraction)
- **Security:** helmet, cors, express-mongo-sanitize, xss-clean, express-rate-limit
- **Logging:** winston (console + file logs under `/logs`)

## Folder Structure

```
src/
├── config/         # db.js, gemini.js
├── models/         # Mongoose schemas: User, Resume, InterviewSession, Question, Answer
├── controllers/     # Thin HTTP layer per feature
├── services/        # Business logic + Gemini AI prompt engineering (services/ai/*)
├── routes/          # Express routers per feature, mounted under /api/v1
├── middleware/       # auth, error handling, upload, rate limiting, validation
├── utils/            # ApiError, ApiResponse, logger, token helpers, resume parser
├── validators/        # express-validator chains per feature
├── app.js
└── server.js
```

## 1. Prerequisites

- Node.js **v18+** installed
- A MongoDB Atlas cluster (free tier is fine) — get your connection string
- A Google Gemini API key (free tier) from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 2. Setup

```bash
# 1. Unzip and enter the project
cd prepgenius-backend

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env
```

Open `.env` and set at minimum:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/prepgenius?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<generate a long random string>
JWT_REFRESH_SECRET=<generate a different long random string>
GEMINI_API_KEY=<your Gemini API key>
CLIENT_ORIGIN=http://localhost:5173
```

> Tip: generate strong secrets with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

## 3. Run the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`. Health check: `GET http://localhost:5000/health`.

## 4. Connecting your existing React frontend

Your frontend should point its API base URL to:

```
http://localhost:5000/api/v1
```

Requests that use the refresh-token flow must be made **with credentials** (so the httpOnly cookie is sent), e.g. with `axios`:

```js
axios.defaults.baseURL = 'http://localhost:5000/api/v1';
axios.defaults.withCredentials = true;
```

Make sure `CLIENT_ORIGIN` in your backend `.env` exactly matches your frontend's dev URL (e.g. `http://localhost:5173` for Vite's default port) — CORS will reject requests from any other origin.

## 5. API Overview

All routes are prefixed with `/api/v1`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public (cookie) | Refresh access token |
| POST | `/auth/logout` | Private | Logout, clears refresh cookie |
| GET | `/auth/me` | Private | Get current user |
| PATCH | `/auth/me` | Private | Update profile |
| PATCH | `/auth/change-password` | Private | Change password |
| GET / PATCH / DELETE | `/users/profile` | Private | Profile management (mirrors /auth/me + deactivation) |
| POST | `/resumes/analyze` | Private | Upload + AI-analyze a resume (multipart, field name `resume`) |
| GET | `/resumes` | Private | List user's resumes |
| GET | `/resumes/:id` | Private | Get a specific resume analysis |
| DELETE | `/resumes/:id` | Private | Delete a resume |
| POST | `/interviews` | Private | Start a new AI mock interview session |
| GET | `/interviews` | Private | Interview history (paginated) |
| GET | `/interviews/:sessionId` | Private | Get session + questions/answers |
| POST | `/interviews/:sessionId/answers` | Private | Submit an answer for AI evaluation |
| PATCH | `/interviews/:sessionId/complete` | Private | Finalize session, compute aggregate feedback |
| PATCH | `/interviews/:sessionId/abandon` | Private | Mark session abandoned |
| GET | `/dashboard` | Private | Aggregated dashboard stats |

All `Private` routes require `Authorization: Bearer <accessToken>`.

## 6. Notes on the Gemini Free Tier

- Default model is `gemini-2.0-flash`, configurable via `GEMINI_MODEL` in `.env`.
- `AI_RATE_LIMIT_PER_MINUTE` (default 10) throttles AI-backed routes at the application level to help stay within free-tier quotas.
- Gemini calls automatically retry transient failures (429/500/503) with exponential backoff — see `src/services/ai/geminiClient.service.js`.

## 7. Production Deployment Notes

- Set `NODE_ENV=production` — this disables Mongoose `autoIndex`, tightens cookie `secure`/`sameSite` settings, and hides stack traces from error responses.
- Update `CLIENT_ORIGIN` to your deployed frontend URL (comma-separate multiple origins if needed).
- Ensure `uploads/` and `logs/` directories are writable by the process, or point them at persistent/ephemeral storage appropriate to your host.
