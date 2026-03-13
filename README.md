# Multicode – Real-time Multiplayer Coding Battles

Multicode is a full-stack web application where two players join a room, receive the same coding problem, and race to be the first to pass all test cases.

This project is split into **frontend** (React + Vite + Tailwind) and **backend** (Node.js + Express + MongoDB + Socket.IO).

## 1. Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB running locally (or a connection string to a remote instance)
- (Optional) Access to a Judge0 instance or RapidAPI Judge0

## 2. Environment configuration

Copy `.env.example` to `.env` in the project root and adjust values:

```bash
cp .env.example .env
```

Key variables:

- `MONGO_URI` – your MongoDB connection string
- `PORT` – backend HTTP port (default: `4000`)
- `JUDGE0_URL` – base URL of your Judge0 instance
- `JUDGE0_KEY` – API key if using RapidAPI Judge0 (optional for self-hosted)

The backend reads environment variables via `dotenv`. Make sure you run it from the project root or have a `.env` close to `backend/server.js`.

## 3. Install dependencies

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 4. Running the backend

In `backend/`:

```bash
npm run dev
```

This will start the Express + Socket.IO server on `http://localhost:4000` by default.

## 5. Running the frontend

In a separate terminal, from `frontend/`:

```bash
npm run dev
```

Vite will start the React app on `http://localhost:5173`.

The frontend expects:

- REST API base URL: `http://localhost:4000/api`
- Socket.IO server: `http://localhost:4000`

You can override these with:

- `VITE_API_URL` – REST API base (e.g. `http://localhost:4000/api`)
- `VITE_SOCKET_URL` – Socket.IO URL (e.g. `http://localhost:4000`)

by creating a `.env` file inside `frontend/`.

## 6. Database models (MongoDB)

The backend defines three main Mongoose models under `backend/models/`:

- `User` – `username`, `wins`, `losses`, `rating`
- `Problem` – `title`, `description`, `difficulty`, `testCases[]` (`input`, `expectedOutput`)
- `Battle` – `roomId`, `player1`, `player2`, `winner`, `problem`, `state`, timestamps

To get started quickly, insert at least one `Problem` document so random problems can be served.

## 7. High-level flow

- A user logs in with a username (no password) – stored in MongoDB.
- A room creator generates a room and shares the ID/link.
- When both players join, the backend selects a random problem and starts the battle.
- Both players code in the Monaco editor with a 10-minute shared timer.
- On **Run**, code is sent to the backend, which calls Judge0 and validates against MongoDB test cases.
- On **Submit**, if all test cases pass, the first player to do so wins; the result is persisted and broadcast via Socket.IO.
- Leaderboard shows users sorted by wins/rating.

## 8. Notes

- This is an MVP-style implementation; you can extend it with spectator mode, battle history, daily challenges, and richer winner animations.
- For production, secure Judge0 access, add rate limiting, robust error handling, and proper auth.

