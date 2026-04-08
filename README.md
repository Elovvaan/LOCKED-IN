# LOCKED-IN
REAL CHALLENGE GAME

---

## Run mobile app

> **No coding experience needed.** Follow these steps exactly.

**What you need first:**
- [Node.js](https://nodejs.org/) installed (download the "LTS" version)
- [Expo Go](https://expo.dev/go) app installed on your phone (free, from the App Store or Google Play)

**Steps:**

1. **Download the repo** — click the green "Code" button on GitHub and choose "Download ZIP", then unzip it. Or if you have Git: `git clone https://github.com/Elovvaan/LOCKED-IN.git`

2. **Open a terminal in the `mobile` folder**
   - On Mac: open Terminal, type `cd ` (with a space), then drag the `mobile` folder into the Terminal window and press Enter.
   - On Windows: open the `mobile` folder in File Explorer, click the address bar, type `cmd`, and press Enter.

3. **Set up the backend URL** — in the `mobile` folder, copy the file `.env.example` and rename the copy to `.env`. Open `.env` in any text editor (Notepad is fine) and paste this line exactly:
   ```
   EXPO_PUBLIC_API_URL=https://locked-in-production.up.railway.app
   ```
   Save and close the file.

4. **Install dependencies** (run once):
   ```
   npm install
   ```

5. **Start the app:**
   ```
   npm start
   ```
   A QR code will appear in the terminal. Scan it with the Expo Go app on your phone. The app will open.

---

**Quick reference**

| | |
|---|---|
| Mobile folder | `mobile/` |
| Install command | `npm install` |
| Start command | `npm start` |
| Env file to edit | `mobile/.env` |
| Text to paste into `mobile/.env` | `EXPO_PUBLIC_API_URL=https://locked-in-production.up.railway.app` |

---

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

---

## Mobile Release (EAS Build + Store Submission)

From `mobile/`:

1. Configure env values in `.env` (copy from `.env.example`).
2. Log into Expo: `npx eas login`
3. Link project and set credentials:
   - `npx eas project:init` (if not already linked)
   - `npx eas credentials`
4. Build production binaries:
   - iOS: `npx eas build --platform ios --profile production`
   - Android: `npx eas build --platform android --profile production`
5. Submit to stores:
   - iOS: `npx eas submit --platform ios --profile production`
   - Android: `npx eas submit --platform android --profile production`

Required secrets/vars:
- `EXPO_PUBLIC_API_URL`
- `EXPO_OWNER`
- `EAS_PROJECT_ID`
- `IOS_BUNDLE_IDENTIFIER`
- `ANDROID_PACKAGE`
- `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` (iOS submit)
- `google-play-service-account.json` at `mobile/google-play-service-account.json` (Android submit)
