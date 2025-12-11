# TaskZen

A full-stack, real-time task manager built with Node.js, Express, MongoDB, Socket.IO, and React (Vite). It supports Google login, profile avatars, due dates with time, live countdowns, XP rewards, overdue notifications with sound, and a clean dashboard/Kanban interface.

## Features
- Authentication: Email/password and Google Identity Services
- Profile: Avatar upload with preview, persistent across sessions
- Tasks:
  - Create with date and time for due date
  - Edit and “Finish Task” action
  - Live “Time left / Overdue by” countdown
  - Overdue tasks auto-highlight in red
- Notifications:
  - Real-time notifications via Socket.IO
  - Overdue check every minute (server-side)
  - Beep sound on new notifications (client-side)
- XP System:
  - Earn XP on task completion (low=10, medium=25, high=50)
- UI:
  - Dashboard shows active tasks only
  - Kanban board with columns and badges
  - Accessible Back button on task detail

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO
- Frontend: React, Vite, TailwindCSS
- Auth: JWT access/refresh tokens, Google Identity Services

## Getting Started
### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)

### Clone and Install
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Variables
Create the following `.env` files.

Backend `.env`:
```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/taskzen
JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### Run
Open two terminals and start the servers:
```bash
# Terminal 1 (backend)
cd backend
npm run dev

# Terminal 2 (frontend)
cd frontend
npm run dev
```
- Backend defaults to `http://localhost:5000`
- Frontend dev server prints its URL (commonly `http://localhost:5173`)

### Google Login Setup
- Create a Web OAuth Client in Google Cloud Console
- Add the frontend origin and authorized redirect (Google Identity Services uses One Tap/JWT callback)
- Use the Client ID in both backend and frontend `.env`

## API Summary
Base URL: `http://localhost:5000`

Auth
- `POST /auth/register` — Register
- `POST /auth/login` — Login
- `POST /auth/refresh` — Refresh tokens
- `POST /auth/google` — Login with Google ID token
- `GET /auth/me` — Current user (requires `Authorization: Bearer <token>`)
- `PUT /auth/profile/avatar` — Upload avatar (multipart `avatar`)

Tasks
- `GET /tasks` — List tasks (query: `status`, `priority`, `q`, `dueFrom`, `dueTo`)
- `POST /tasks` — Create task
- `GET /tasks/:id` — Get task
- `PUT /tasks/:id` — Update task (use `status: "done"` to finish)
- `DELETE /tasks/:id` — Delete task
- `POST /tasks/:id/comments` — Add comment

Notifications
- `GET /notifications` — List notifications for current user
- `POST /notifications/read` — Mark notifications as read

## Real-Time Events
Socket.IO connects with `auth.token` (JWT access token).
- Task events: `task:created`, `task:updated`, `task:deleted`, `task:comment_added`
- Notification events: `notification:new`

## Notable Behaviors
- Overdue checker runs every minute and sends a `task_overdue` notification
- Frontend plays a short beep on new notifications
- Overdue tasks visually highlighted; dashboard hides finished tasks
- XP updates on task completion; displayed in Topbar/Profile

## Development Notes
- Styling: TailwindCSS with light/dark theme support
- Data: Mongoose schemas (`Task`, `User`, `Notification`)
- Security: JWT-based authentication, CORS configured with `CLIENT_URL`

## Troubleshooting
- Avatar not updating: ensure frontend uses `VITE_API_URL` and backend serves `/uploads` statics; avatar path may be prefixed with backend base URL
- 401s on API: confirm tokens are set in localStorage; refresh endpoint handles expiry
- Socket not connected: verify access token is valid and server URL matches `VITE_API_URL`

## Deployment

### Render (Backend)
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Environment Variables:
  - `MONGO_URI` = your Atlas URI (include a DB name), e.g. `mongodb+srv://.../taskzen?appName=Cluster0`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_EXPIRES_IN` = `15m`, `JWT_REFRESH_EXPIRES_IN` = `7d`
  - `GOOGLE_CLIENT_ID` = your Google client ID
  - `CLIENT_URL` = your Vercel domain origin, e.g. `https://your-project.vercel.app`
- Health Check Path: `/`
- Avatars: add a persistent Disk and mount `uploads` (e.g. `/opt/render/project/src/uploads`).

### Vercel (Frontend)
- Root Directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Environment Variables:
  - `VITE_API_URL` = your Render backend URL
  - `VITE_GOOGLE_CLIENT_ID` = your Google client ID

### Wiring
- Set `CLIENT_URL` on Render to the Vercel origin (no path, no trailing slash).
- Set `VITE_API_URL` on Vercel to the Render backend URL.
- Add both origins to Google Cloud Console Authorized JavaScript origins.

## Production Notes
- CORS: only use origins (scheme + host). Do not include paths like `/login`.
- Task privacy: API returns tasks where you are `createdBy` or `assignedTo`; others are hidden.
- Sockets: server emits task events to user rooms, not globally.
- Mobile UX: a bottom navigation is shown on small screens.
- Startup loader: full-screen loader displays while auth initializes.

## License
MIT
