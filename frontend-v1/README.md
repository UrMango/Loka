# Meet Loca Frontend v1

A minimal, clean React + TypeScript + MUI frontend layered alongside the existing (legacy) UI. Uses Vite and proxies all API calls to the existing Express backend on port 3001.

## Why this version?
- Rapid demo-ready UI
- Avoids previous global SVG/CSS issues
- Smaller dependency surface
- Clearly separated from the original frontend

## Tech Stack
- React 19 + TypeScript
- Vite
- MUI (Material UI) for components
- Axios for API calls
- React Router for navigation

## Directory Structure
```
frontend-v1/
  src/
    pages/ (Home, Trips, TripDetails, NewTrip)
    services/api.ts (Axios instance + trip helpers)
    theme/theme.ts (Basic theme)
    App.tsx, main.tsx, styles.css
  vite.config.ts (Proxy to backend)
```

## Backend Assumptions
Backend runs locally on `http://localhost:3001` and exposes:
- `GET /api/health`
- `GET /api/trips`
- `GET /api/trips/:id`
- `POST /api/trips`

## Setup
```bash
cd frontend-v1
npm install
npm run dev
```
Then open: http://localhost:5180

## API Proxy
All `/api/*` requests are forwarded to the backend via Vite proxy (`vite.config.ts`).

## Adding Features
Extend by creating new pages or components. Keep global CSS minimal and avoid styling `svg` globally.

## Troubleshooting
- If icons look wrong: ensure you did not add global `svg {}` rules.
- If API fails: verify backend is running and health endpoint responds.
- If port 5180 is busy: change `server.port` in `vite.config.ts`.

## License
Internal/demo use.
