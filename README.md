# Que Toca Hoy

<p align="center">
  <img src="./frontend/public/welcome-page.png" alt="Project Screenshot" width="600"/>
</p>

## Table of Contents

1. [Description](#description)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Local Development](#local-development)
   - [Prerequisites](#prerequisites)
   - [Repo structure](#repo-structure)
   - [Environment variables](#environment-variables)
   - [Install and run](#install-and-run)
6. [Database](#database)
   - [Sequelize CLI layout](#sequelize-cli-layout)
   - [DB config](#db-config)
   - [Model tweaks for Postgres](#model-tweaks-for-postgres)
   - [Migrations and Seeders](#migrations-and-seeders)
7. [Real-Time Updates](#real-time-updates)
8. [Deployments](#deployments)
   - [Backend on Render](#backend-on-render)
   - [Frontend on Vercel](#frontend-on-vercel)
9. [Scripts](#scripts)
10. [Troubleshooting](#troubleshooting)
11. [Roadmap](#roadmap)
12. [License](#license)
13. [Authors](#authors)

## Description

**Que Toca Hoy** _("What’s Today?")_ is a collaborative planner for families and small groups that centralizes everything needed to manage daily life – from cleaning duties and shared shopping lists to cooking inspiration.

Each member can view their own list of responsibilities, see what’s already done, and communicate updates in real time.
The system automatically rotates recurring tasks between members, ensuring fairness and balance.

The app also integrates recipes imported from [Recipe Compass](https://the-recipe-compass.web.app/), letting users easily plan meals and add missing ingredients directly to the shared shopping list.

## Tech Stack

- React + Vite, React Router, Context API
- Tailwind CSS, React Big Calendar
- Node.js, Express, Sequelize ORM
- PostgreSQL (Neon.tech)
- Socket.IO (real-time updates)
- JWT Authentication with bcrypt and httpOnly cookies
- Firebase (integration for recipe imports)
- Render (backend), Vercel (frontend)

## Features

- **Home "Brief" panel:** personal summary of To-Do and Done tasks.
- **Tasks & Templates:** rotating tasks, template editor, due dates, per-user assignments.
- **Recipes:** import from Recipe Compass, unified view & parsing.
- **Shopping list:** grouped buy items, activity log.
- **Real-time:** instant updates across devices via Socket.IO.
- **Landing page:** feature highlights, auth entry points.
- **Auth:** JWT access + httpOnly refresh cookie (short-lived access, rotating refresh).
- **Multi-env:** Dev (local), Prod (Render/Vercel).
- **PostgreSQL (Neon):** migrations/seeders, pooled SSL connection.

## Architecture

```bash
quetocahoy/
├── backend/                        # Node.js + Express + Sequelize
│   ├── config/
│   │   ├── database.js             # Runtime Sequelize connection (Postgres / MySQL fallback)
│   │   └── config.cjs              # Sequelize CLI config (used for migrations & seeders)
│   ├── crud_tests/                 # Manual CRUD test scripts or API experiments
│   ├── src/
│   │   ├── assets/                 # Static or auxiliary backend files
│   │   ├── config/
│   │   │   └── config.json         # MySQL config
│   │   ├── controllers/            # Express route controllers (business logic for API endpoints)
│   │   ├── cronjobs/               # Scheduled jobs (e.g., task rotation, reminders) [In progress]
│   │   ├── middlewares/            # Middleware functions (auth, validation, logging, etc.)
│   │   ├── migrations/             # Database schema definitions for Sequelize
│   │   ├── models/                 # Sequelize models (tables, associations, hooks)
│   │   ├── routes/                 # Express routers (HTTP endpoints mapping)
│   │   ├── seeders/                # Demo or initial seed data for the database
│   │   └── utils/
│   │       └── units.js            # Helper utility (unit conversion)
│   ├── app.js                      # Main Express entry point (CORS, Socket.IO, health check)
│   ├── .env.example                # Example environment variables file
│   ├── .sequelizerc                # Path mapping for Sequelize CLI (src/migrations, src/seeders)
│   └── package.json                # Backend dependencies & scripts (start, dev, migrate, seed)
└── frontend/                       # React + Vite + TailwindCSS
    ├── public/                     # Static assets
    ├── src/
    │   ├── api/
    │   │   └── apiFetch.js         # API layer (fetch wrapper, base URL, interceptors)
    │   ├── assets/                 # Images, fonts, and local static resources
    │   ├── components/             # App components
    │   │   ├── alerts/
    │   │   ├── auth/
    │   │   └── ...
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Global auth context (user data, JWT handling)
    │   │   └── GroupContext.jsx    # Context for managing shared group state
    │   ├── external/
    │   │   ├── compassMapper.js    # Data parser for importing recipes (Recipe Compass to local format)
    │   │   └── compassService.js   # API service for fetching data from Recipe Compass
    │   ├── hooks/                  # Custom React hooks
    │   ├── layouts/                # Reusable layouts
    │   ├── pages/
    │   │   ├── aboutUs/            # "About Us" page
    │   │   ├── auth/               # Authentication pages (login/register)
    │   │   ├── group/              # Group-related pages (BuyListPage, CalendarPage, etc.)
    │   │   ├── notFound/           # 404 page
    │   │   ├── public/             # Landing page (welcome page)
    │   │   └── Home.jsx            # Home dashboard (daily brief: to-do / done)
    │   ├── realtime/
    │   │   ├── RealiteProvider.jsx # Global Socket.IO provider for real-time updates
    │   │   ├── socket.io           # Socket.IO client instance (connects to backend)
    │   │   └── ...
    │   ├── services/               # API service modules (authService, groupsService, taskTemplateService, etc.)
    │   ├── state/
    │   │   └── AppStore.jsx        # Global app state
    │   ├── utils/                  # Small utility functions (formatters, validators, helpers)
    │   └── main.jsx                # React entry point (Router + global providers)
    ├── styles/
    │   ├── calendar.scss           # Specific styles for react big calendar
    │   └── main.css                # Global styles (Tailwind base/utilities)
    ├── .env
    ├── index.html
    ├── package.json                # Frontend dependencies & scripts (dev, build, preview)
    ├── vercel.json                 # Deployment config for Vercel (redirects, headers, etc.)
    └── vite.config.js              # Vite configuration (plugins, aliases, environment setup)
```

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+
- PostgreSQL (remote Neon is recommended for dev too)
- (Optional) MySQL local fallback is still supported, but Postgres is the default.

### Repo structure

Monorepo with frontend/ and backend/ projects. Run them independently.

### Environment variables

Create **backend/.env:**

```bash
# --- Postgres via Neon (recommended) ---

DATABASE_URL=postgres://USER:PASSWORD@ep-xxxxxx-pooler.eu-central-1.aws.neon.tech/DBNAME?sslmode=require

# Server

PORT=3000
NODE_ENV=development

# CORS

CLIENT_ORIGIN=http://localhost:5173

# JWT / Refresh token

JWT_SECRET=<long-random-hex>
JWT_EXPIRATION=5m
REFRESH_TOKEN_WORD=<another-long-random>
REFRESH_TOKEN_LENGTH=100
REFRESH_TOKEN_EXPIRATION=7d

# (Optional) MySQL local fallback (only used if DATABASE_URL is absent)

DB_HOST=localhost
DB_PORT=3306
DB_NAME=que_toca_hoy
DB_USER=root
DB_PASS=yourpassword
DB_USE_PWD=true
```

Create frontend/.env (Vite):

```bash
VITE_API_URL=http://localhost:3000
```

### Install and run

Backend

```bash
cd backend
npm i

# If first time on a new DB:

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm start
```

Frontend

```bash
cd frontend
npm i
npm run dev
```

Open: `http://localhost:5173`

## Database
**Migration from MySQL to PostgreSQL (Neon)**

### Sequelize CLI layout

Install CLI & drivers:

```bash
npm i pg pg-hstore
npm i -D sequelize-cli
npx sequelize-cli init
```

Map CLI paths to `src/` via `.sequelizerc`:

```js
// backend/.sequelizerc

const path = require("path");

module.exports = {
  config: path.resolve(__dirname, "config", "config.cjs"),
  "models-path": path.resolve(__dirname, "src", "models"),
  "seeders-path": path.resolve(__dirname, "src", "seeders"),
  "migrations-path": path.resolve(__dirname, "src", "migrations"),
};
```

Note: CLI expects CommonJS. Use `*.cjs` and `module.exports = { up, down }`.

### DB config

backend/config/config.cjs

```js
require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
    logging: console.log,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
    logging: false,
  },
};
```

Runtime connection: backend/config/database.js

```js
import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

// If there is DATABASE_URL -> work with Postgres (Neon). If not -> with MySQL.
const usePg = !!process.env.DATABASE_URL;

export const sequelize = usePg
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      // Neon needs TLS
      dialectOptions: { ssl: { require: true } },
      logging: process.env.NODE_ENV !== "production" ? console.log : false,
      pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_USE_PWD !== "false" ? process.env.DB_PASS : undefined,
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        port: process.env.DB_PORT || 3306,
        logging: process.env.NODE_ENV !== "production" ? console.log : false,
        pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
      }
    );
```

### Model tweaks for Postgres

- Replaced MySQL-specific UNSIGNED, TEXT('long') with Postgres-friendly INTEGER, TEXT.

- Some models with timestamps: false (e.g., TaskTemplate) to match schema.

### Migrations and Seeders

- Migrations order (10):
  users -> groups -> materials -> tasktemplates -> tasksdated -> usergroups -> usertasks -> materialtasktemplates -> buylists -> userrefresh.

- Seeders:
  users, groups, materials, tasktemplates, usergroups, tasksdated, materialtasktemplates, buylists, usertasks.

- User seed default color to avoid NOT NULL:

```js
color: x.color ?? "#ffffff";
```

- `tasksdated` uses fixed ISO dates so foreign seeds can reference them.

Commands:

```bash

# run all migrations

npx sequelize-cli db:migrate

# run all seeders

npx sequelize-cli db:seed:all

# full reset

npm run reset:db
```

## Real-Time Updates

- **Backend:** Socket.IO server integrated into Express (namespaces/rooms per group).
- **Frontend:** `RealtimeProvider.jsx` wraps the app and handles connection lifecycle.
- **Hooks:** `useCalendarRealtime.js` and `useGroupRealtime.js` subscribe to server events and update UI instantly.
- **Client:** `realtime/socket.js` initializes client with `withCredentials: true` and optional auth token if needed.

If you recently migrated to Postgres and real-time stopped working, ensure the Socket.IO server is bound to the same HTTP server instance used by Express and that CORS origins include the deployed frontend.

## Deployments

### Backend on Render

`app.js` (production CORS/proxy + health)

```js
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

const allow = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allow.includes(origin);
}

app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});
```

Render service setup:

- Runtime: Node
- Region: match Neon region (e.g., EU Frankfurt if Neon is EU Central).
- Build Command: `npm ci`
- Start Command: `npm start`

Environment variables (Render):

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://... # URL from Neon
CLIENT_ORIGIN=https://localhost:5173 # OR https://your-frontend.vercel.app
JWT_SECRET=<long-random-hex>
JWT_EXPIRATION=5m
REFRESH_TOKEN_WORD=<another-long-random>
REFRESH_TOKEN_LENGTH=100
REFRESH_TOKEN_EXPIRATION=7d
```

Health check:

`https://<your-backend>.onrender.com/health`

Should be `{"ok":true}`

### Frontend on Vercel

- Set `VITE_API_URL` to your Render backend URL.
- Ensure CORS `CLIENT_ORIGIN` in backend includes your `https://<project>.vercel.app.`
- Typical Vercel build settings:
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Add Environment Variables in Vercel:
  - `VITE_API_URL=https://<your-backend>.onrender.com`

## Scripts

backend/package.json

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "reset:db": "sequelize-cli db:seed:undo:all && sequelize-cli db:migrate:undo:all && sequelize-cli db:migrate && sequelize-cli db:seed:all"
  }
}
```

## Troubleshooting

CORS blocked (browser network errors)

- Confirm `CLIENT_ORIGIN` includes your current origin(s).
- In dev, set `CLIENT_ORIGIN=http://localhost:5173`.
- In prod, include Vercel domain(s). Multiple origins are comma-separated.

Render 502 / app not booting

- Check `DATABASE_URL` correct & pooled connection string from Neon with `?sslmode=require`.
- Ensure `PORT=3000` and Start Command is `npm start`.
- Verify that `app.set('trust proxy', 1)` is only in production.
- Review logs: Render -> Events.

Socket.IO not connecting in prod

- Ensure the backend exposes the same origin (`onrender.com`) and CORS allows the Vercel domain.
- Use `withCredentials: true` only if you are actually sending cookies across origins and have CORS + cookies configured (sameSite=None; secure).
- Make sure the client uses the correct base URL in socket.js.

Sequelize errors after migration

- Recreate schema with `npm run reset:db`.
- Verify model attribute types are Postgres-compatible (`INTEGER`, `TEXT` vs MySQL-specific types).

### Appendix: Recipe Import (from Recipe Compass)

- Config: `.env` vars for import endpoints (local dev) — in production, configure via Vercel.
- UI: Modal in `RecipePage` to trigger import flow.
- Parser: `ingredientParser.js` normalizes ingredient lines to app schema.

## Roadmap

- [ ] Optimistic UI for tasks & shopping list.
- [ ] Role-based permissions per group (owners, members).
- [ ] Calendar view enhancements (drag to reschedule).
- [ ] Recipe import wizard v2 (images, nutrition).
- [ ] E2E tests (Playwright) + CI.
- [ ] i18n (EN/ES/UA/CA).

## License

AGPL-3.0-or-later

## Authors

This project was built collaboratively during the **Fundación Esplai Bootcamp**.

| Name               | Role                 | GitHub                                                       |
| ------------------ | -------------------- | ------------------------------------------------------------ |
| **Ivan** | Frontend Developer   | [@ivanbodnarash](https://github.com/ivanbodnarash)           |
| **Antonny**        | Backend Developer    | [@hgaxel](https://github.com/hgaxel)                         |
| **Gerard**         | Backend Developer    | [@GerardLopezParedes](https://github.com/GerardLopezParedes) |
| **Elena**          | Full-Stack Developer | [@eeleeml](https://github.com/eeleeml)                       |
