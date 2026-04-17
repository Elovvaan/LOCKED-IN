# LOCKED-IN

**REAL CHALLENGE GAME** — A social skill-challenge platform where users post video challenges, battle head-to-head in side-by-side comparisons, vote for winners, and "pull up" to real-world events spawned directly from online threads.

---

## What is LOCKED-IN?

LOCKED-IN bridges the gap between online skill videos and real-world competition. Users post short video challenges to a vertical feed, respond to each other's challenges, and the community votes on who wins. When a skill thread heats up enough, anyone can escalate it into a live "Pull Up" event at a real-world location — and the best performers earn a permanent record on their profile.

---

## Key Features

- **Skill Feed** — A TikTok-style vertical feed of skill challenge videos, ranked by engagement (responses + votes) and recency. Supports real-time polling for new posts.
- **Challenge & Response** — Users can post skill videos and respond to challenges with their own videos. Each user is limited to 3 responses per challenge to keep threads competitive.
- **Battle Mode** — When a challenge thread has at least 2 responses, it enters Battle Mode: the top two responders are shown side-by-side and the audience votes for a winner. Competitors cannot vote in their own battles.
- **Voting** — Community members vote for the best skill performer in both online battles and real-world events. A majority-vote threshold determines the official winner.
- **Rematch** — Once a battle ends, either participant can request a rematch, spawning a new challenge thread from the original.
- **Pull Up Events** — Any skill post can be escalated into a scheduled real-world event with a location, player cap, and time window. Players join, check in on the day, upload media, and spectators vote for the winner.
- **Profile & Stats** — Each user profile tracks events joined, events won, and location-specific wins.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo), TypeScript |
| Backend API | Node.js, Express, TypeScript |
| Database | Sequelize ORM + SQLite3 |
| Auth | JWT (7-day tokens), bcrypt password hashing |
| Rate Limiting | express-rate-limit (100 requests / 15 min per IP) |
| Testing | Jest + Supertest |

---

## Project Structure

```
LOCKED-IN/
├── src/                        # Backend API (Node.js / Express)
│   ├── app.ts                  # Express app with rate limiting
│   ├── index.ts                # Server entry point
│   ├── database.ts             # Sequelize + SQLite connection
│   ├── config.ts               # JWT secret and app config
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── models/                 # Sequelize models
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   ├── EventParticipant.ts
│   │   ├── EventMedia.ts
│   │   ├── EventResult.ts
│   │   ├── EventVote.ts
│   │   ├── SkillPost.ts
│   │   ├── SkillResponse.ts
│   │   └── SkillVote.ts
│   └── routes/
│       ├── auth.ts             # POST /auth/register, /auth/login
│       ├── events.ts           # CRUD + join / check-in / media / vote
│       ├── users.ts            # User profiles
│       └── skills.ts           # Feed, challenge, battle, vote, rematch, create-event
├── tests/                      # Jest + Supertest integration tests
├── mobile/                     # React Native (Expo) mobile app
│   └── src/
│       ├── screens/            # AuthScreen, FeedScreen, BattleModeScreen, etc.
│       ├── components/         # BattlePane, FeedCard, BattleSplit, etc.
│       ├── hooks/              # useFeed, useBattle, etc.
│       ├── lib/                # API client helpers
│       ├── context/            # Auth context
│       └── navigation/         # React Navigation stack
└── package.json
```

---

## API Overview

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive a JWT |

### Skills
| Method | Route | Description |
|---|---|---|
| POST | `/skills` | Publish a skill video challenge |
| GET | `/skills/feed` | Vertical feed sorted by engagement |
| GET | `/skills/:id` | Skill post detail with responses and vote stats |
| POST | `/skills/:id/respond` | Upload a response video (max 3 per user) |
| GET | `/skills/:id/battle` | Battle Mode — top 2 responses + leader |
| POST | `/skills/:id/responses/:responseId/vote` | Vote for a response in battle mode |
| POST | `/skills/:id/vote` | Vote for the thread winner |
| POST | `/skills/:id/create-event` | Spawn a Pull Up event from a skill post |
| POST | `/skills/:id/rematch` | Request a rematch of an ended battle |

### Events
| Method | Route | Description |
|---|---|---|
| POST | `/events` | Create a Pull Up event |
| GET | `/events` | Feed split into upcoming / live / past |
| GET | `/events/:id` | Full event detail with players, media, and vote results |
| POST | `/events/:id/join` | Join as a player or spectator |
| POST | `/events/:id/checkin` | Check in on event day |
| POST | `/events/:id/media` | Upload event media |
| POST | `/events/:id/vote` | Vote for the event winner |

---

## Getting Started

### Environment Variables

**Backend** — create a `.env` file in the project root (optional for development; required in production):

```
JWT_SECRET=your-secret-key   # required in production; defaults to 'locked-in-secret-key' in dev
PORT=3000                    # optional, defaults to 3000
```

**Mobile** — copy `mobile/.env.example` to `mobile/.env` and set the backend URL:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Backend

```bash
npm install
npm run dev        # start dev server with ts-node
npm test           # run Jest integration tests
npm run build      # compile TypeScript to dist/
```

### Mobile

```bash
cd mobile
npm install
npx expo start     # start Expo dev server
```
REAL CHALLENGE GAME

---

## Try the app — no terminal needed

> **Open the link below in any browser. That's it.**

🔗 **[https://elovvaan.github.io/LOCKED-IN](https://elovvaan.github.io/LOCKED-IN)**

No installs, no terminal, no setup. The app loads in your browser and connects to the live backend automatically.

---

**How it works**

| | |
|---|---|
| Frontend | Expo web app — deployed to GitHub Pages automatically on every push to `main` |
| Backend | Express API — already running on Railway at `https://locked-in-production.up.railway.app` |
| Trigger | Push to `main` → GitHub Actions builds the web app → goes live at the URL above |

> The deployment workflow configures GitHub Pages automatically, so pushes to `main` can deploy without manual Pages source setup.

---

## Web App on Railway

The backend serves the real LOCKED-IN frontend (Expo web export from `mobile/`) at `/`.

- **Frontend root**: `/`
- **API manifest**: `/api`
- **SPA routes**: fallback to frontend `index.html`
- **Health check**: `/health`
- **Build pipeline**: `npm run build` runs both `npm run build:backend` (backend TypeScript build to `dist/`) and `npm run build:frontend` (Expo web export to `mobile/dist/`). This is the same behavior to expect for local/dev builds as well.

---

## Current Status

### V1 Backend — In Progress
- ✅ Express + TypeScript + Sequelize + SQLite3 server
- ✅ JWT authentication (register / login)
- ✅ Events API (create, join, vote, media upload)
- ✅ Users API (profile)
- ✅ Skills API (posts, responses, votes)
- ✅ Creator Revenue Chain Layer API (creator registry, asset registry, split routing, licensing, royalties, entitlements, vault payouts)
- ✅ Sweepstakes Campaign Layer API (campaign rules, free-entry sources, winner logging, fulfillment tracking, audit logs)
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

## Creator Revenue Chain Layer

The app keeps media/content **off-chain** and mirrors rights + settlement state in the API database to represent the on-chain layer for fast UI/analytics.

- Off-chain concerns: content storage, analytics, feeds/ranking, private context, app business logic
- On-chain mirrored state: creator registry, asset registry, split routing, license state, royalty rules, treasury vaults, entitlement records
- Settlement defaults: **USDC** on **Base** with embedded-wallet-style UX

Key endpoints (auth required):

- `GET /revenue/config`
- `POST /revenue/creators/register`
- `POST /revenue/assets`
- `POST /revenue/tips`
- `POST /revenue/subscriptions`
- `POST /revenue/unlock`
- `POST /revenue/licenses`
- `POST /revenue/royalties/resale`
- `POST /revenue/payouts`
- `GET /revenue/vaults/me`
- `GET /revenue/entitlements/me`

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
- Default is `https://locked-in-production.up.railway.app` (the live Railway backend).
- **Physical device / Expo Go**: if you want to point at a local server, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (e.g. `http://192.168.1.x:3000`).
- **Android emulator**: use `http://10.0.2.2:3000`.

### How Mobile Connects to the Backend
### How Mobile Connects to the Backend
The Axios client in `mobile/src/lib/api.ts` picks up `process.env.EXPO_PUBLIC_API_URL` and prefixes every request with it. The GitHub Actions deployment sets this to the Railway URL automatically — no `.env` file needed.

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
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (raw JSON for Android submit service account)
- Generate `mobile/google-play-service-account.json` with `npm run prepare:google-play-key` from `mobile/` before `eas submit --platform android`
