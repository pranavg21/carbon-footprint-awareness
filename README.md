# 🌿 CarbonTrack — Gamified Carbon Footprint Tracker

A gamified carbon footprint tracking platform — **"Strava for the environment"** — built with React, TypeScript, and Google Cloud services. Track eco-actions, build streaks, and reduce your environmental impact with interactive visualizations and AI-powered insights.

**Live Demo:** [https://carbon-footprint-470990187193.asia-south1.run.app](https://carbon-footprint-470990187193.asia-south1.run.app)

---

## ✨ Features

- **Eco Score Dashboard** — Real-time animated score with letter grades (A+ to F) and a full-width progress bar
- **Quick Action Logging** — One-click logging for Plant-Based Meals, Public Transit, Renewable Energy, and Zero Waste actions
- **Custom Action Logger** — Zod-validated form for logging custom eco-actions with category, points, and description
- **Category Breakdown Chart** — Custom SVG donut chart with interactive hover states and keyboard accessibility
- **Activity Heatmap** — GitHub-style 30-day streak visualization with intensity levels
- **AI-Powered Insights** — Google Gemini generates personalized carbon reduction tips based on your emission data
- **Data Export** — Download your full tracking history as JSON
- **Offline Support** — Progressive Web App with service worker caching and dedicated offline fallback page
- **Cloud Persistence** — Firebase Firestore for cloud data sync
- **Analytics** — Firebase Analytics for event tracking

## 🏗️ Architecture

```
src/
├── lib/                    # Foundation layer
│   ├── logger.ts           # Structured JSON logging (Cloud Logging compatible)
│   ├── schemas.ts          # Zod validation schemas for all data shapes
│   ├── constants.ts        # Named constants (zero magic numbers)
│   ├── utils.ts            # Pure utility functions
│   ├── sanitize.ts         # Input sanitization (XSS prevention)
│   ├── firebase.ts         # Firebase: Firestore + Analytics + Auth
│   ├── gemini.ts           # Google Gemini AI insights generation
│   ├── category-icons.tsx  # Shared icon map (DRY)
│   ├── seed-data.ts        # Realistic 30-day seed data generator
│   └── registerServiceWorker.ts
├── store/
│   └── carbon-store.ts     # Zustand global store with Zod-validated rehydration
├── hooks/
│   ├── useReducedMotion.ts # Accessibility: prefers-reduced-motion
│   └── useToast.ts         # Toast notification store
├── components/
│   ├── layout/             # SkipLink, Header, Sidebar
│   ├── dashboard/          # HeroScore, CategoryDonut, StatsRow
│   ├── actions/            # ActionDock (quick + custom logging)
│   ├── heatmap/            # StreakHeatmap
│   ├── nudges/             # NudgeFeed (Gemini AI integration)
│   ├── shared/             # GlassCard, AnimatedCounter
│   └── feedback/           # ToastContainer
└── __tests__/              # 7 test suites, 124+ tests
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict mode) |
| State | Zustand with localStorage persistence + Zod rehydration |
| Styling | Tailwind CSS 4 + custom glassmorphism design system |
| Validation | Zod 4 — all data boundaries validated, zero `as` casts |
| AI | Google Gemini 2.0 Flash (personalized eco-insights) |
| Database | Firebase Firestore (cloud persistence) |
| Analytics | Firebase Analytics (typed event tracking) |
| Auth | Firebase Auth (Google sign-in) |
| Logging | Structured JSON stdout (Google Cloud Logging compatible) |
| Deployment | Docker → Google Cloud Run |
| Testing | Vitest + React Testing Library |
| Security | CSP, HSTS, X-Frame-Options, input sanitization |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Production build
npm run build
```

### Environment Variables (optional)

Create a `.env` file for Google Cloud integrations:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GEMINI_API_KEY=your-gemini-api-key
```

The app gracefully degrades without these — all Google services are optional.

## 📊 Code Quality

- **Zero `any` types** — `@typescript-eslint/no-explicit-any: "error"`
- **Zero `as` casts** — only `as const` used; Zod `.parse()` for all runtime validation
- **Zero `console.*` outside logger** — structured logging via `logger.ts`
- **Zero code duplication** — shared helpers (`applyActionToState`, `CATEGORY_ICONS_SM`)
- **100% JSDoc coverage** — every export has `@module`, `@param`, `@returns`
- **Strict ESLint** — `no-console`, `explicit-function-return-type`, `eqeqeq`, `consistent-type-imports`
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess`, `noImplicitReturns`

## ♿ Accessibility

- Skip-to-content link
- Single `<h1>` per page with proper heading hierarchy
- `aria-label` on all interactive elements
- `role="grid"` / `role="gridcell"` on heatmap
- Keyboard-accessible donut chart segments
- `prefers-reduced-motion` in CSS AND JavaScript
- `focus-visible` outlines on all interactive elements

## 🔒 Security

- Content Security Policy (CSP) via Nginx headers
- HSTS, X-Frame-Options, X-Content-Type-Options
- Permissions-Policy header
- Input sanitization (HTML stripping, URI scheme blocking)
- Zod validation on all data boundaries (including localStorage rehydration)
- No raw error stack traces exposed

## 📦 Deployment

Deployed to **Google Cloud Run** via Docker multi-stage build:

```bash
gcloud run deploy carbon-footprint \
  --source . \
  --project venueflow-80ead \
  --region asia-south1 \
  --allow-unauthenticated
```

## 📄 License

MIT
