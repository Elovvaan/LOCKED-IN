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
