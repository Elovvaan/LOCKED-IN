# LOCKED-IN
REAL CHALLENGE GAME

## Current Status

### V1 Backend — In Progress
- ✅ Express + TypeScript + Sequelize + SQLite3 server
- ✅ JWT authentication (register / login)
- ✅ Events API (create, join, vote, media upload)
- ✅ Users API (profile)
- ✅ Skills API (posts, responses, votes)
- ✅ Rate limiting (100 req / 15 min per IP)
- ✅ Jest + Supertest test suite (in-memory SQLite)
- ⬜ File/media storage (S3 or equivalent)
- ⬜ Push notifications

### V1 Mobile — In Progress
- ✅ Expo (React Native) app with TypeScript
- ✅ Auth flow (login / register screen)
- ✅ Bottom-tab navigation (Feed, Profile, Battle Mode)
- ✅ Event detail screen
- ✅ Skill posts screen (create, view, vote)
- ✅ Auth context + AsyncStorage token persistence
- ✅ Axios API client wired to `EXPO_PUBLIC_API_URL`
- ⬜ Real-time updates / sockets
- ⬜ Video playback for challenge submissions

---

## Environment Setup

### Backend — `.env.example`
```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```
Copy to `.env` in the project root before starting the server.

### Mobile — `.env.example` (inside `mobile/`)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```
Copy to `mobile/.env` before starting the Expo app.

---

## Core Gameplay Loop

```
1. User registers / logs in
        ↓
2. User browses the Feed (active events & skill posts)
        ↓
3. User creates or joins a Challenge Event
        ↓
4. User submits a video/photo as proof of completion
        ↓
5. Other participants vote on the submission
        ↓
6. Event closes → results calculated → winner decided
        ↓
7. User shares or responds to Skill Posts in the skills feed
```

---

## Known Limitations / Not Yet Implemented

- **Media storage**: `EventMedia` model exists but binary files are not persisted to disk or cloud storage yet.
- **Real-time**: No WebSocket or push-notification layer; clients must poll for updates.
- **Database**: SQLite is used for development/testing; not suitable for multi-instance production deployments.
- **Image/video playback**: The mobile UI does not yet render submitted media inside event or skill screens.
- **User profiles**: Profile screen exists but editing (avatar, bio) is not wired to the API.
- **Authorization**: Basic JWT auth is in place; per-resource ownership checks are minimal.

---

## Next Milestones / Build Roadmap

| Milestone | Description |
|-----------|-------------|
| M1 | Replace SQLite with PostgreSQL; add migrations |
| M2 | Wire media upload to S3-compatible storage |
| M3 | Add WebSocket layer for live vote counts |
| M4 | Complete profile edit flow (avatar + bio) |
| M5 | Push notifications for event results |
| M6 | Public TestFlight / Play Store beta |

---

## Local Development Notes

### Starting the Backend
```bash
# From the project root
cp .env.example .env          # set PORT, JWT_SECRET, NODE_ENV
npm install
npm run dev                   # ts-node src/index.ts — hot reload via ts-node
```
The server starts on `http://localhost:3000` by default.  
Run tests with `npm test` (uses in-memory SQLite; no `.env` required).

### Starting the Mobile App
```bash
# From the mobile/ directory
cp .env.example .env          # set EXPO_PUBLIC_API_URL
npm install
npx expo start                # opens Expo DevTools / QR code
```

### API Base URL Behavior
- The mobile app reads `EXPO_PUBLIC_API_URL` at build time via Expo's public env system.
- Default value in `mobile/.env.example` is `http://localhost:3000`.
- **Physical device**: replace `localhost` with your machine's LAN IP (e.g. `http://192.168.1.x:3000`).
- **Android emulator**: use `http://10.0.2.2:3000`.
- **Expo Go on same Wi-Fi**: use your machine's LAN IP.

### How Mobile Connects to the Backend
The Axios client in `mobile/src/lib/` picks up `process.env.EXPO_PUBLIC_API_URL` and prefixes every request with it. Make sure the backend is running and reachable from the device/emulator before launching the app.
