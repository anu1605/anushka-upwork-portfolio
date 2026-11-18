# Portfolio — Anushka Tyagi

A server-rendered React portfolio for Anushka Tyagi, a software engineer specialising in
e-commerce systems and payment integrations.

The site keeps the original content and admin workflow but replaces PHP + a database with
**React 18, Express and plain JSON files**. There is no database, no ORM and no migration step:
content lives in `data/*.json` and is written atomically.

---

## Highlights

| | |
|---|---|
| **Front end** | React 18, React Router 6, Vite 6 |
| **Rendering** | SSR per request, hydrated on the client |
| **Back end** | Express 4, file-backed JSON store |
| **Admin** | Session auth, CSRF protection, project CRUD, contact inbox |
| **Extras** | Dark/light theme, JSON API, `sitemap.xml`, `robots.txt`, JSON-LD Person schema |
| **Tests** | Vitest + Supertest (validator + API end-to-end) |

---

## Quick start

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run seed                # creates the admin account
npm run dev                 # http://localhost:5173
```

> **Admin sign in** → <http://localhost:5173/admin/login>
> Default: `admin` / `ChangeMe!2026` — change `ADMIN_USERNAME` and `ADMIN_PASSWORD`
> in `.env`, then run `npm run seed -- --force-user` to update the password.

### Production

```bash
npm run build               # dist/client (static) + dist/server (SSR bundle)
npm start                   # http://localhost:5173 (APP_ENV=production)
```

`npm run build` also prerenders every public route to real HTML in `dist/client`
(`/`, `/about`, `/projects`, each `/projects/<slug>`, `404.html`, `sitemap.xml`,
`robots.txt`). That folder is deployable to any static host.

---

## Deploy to Netlify

The repo is ready for Netlify's Git integration — push to GitHub and point the
site at the repository. `netlify.toml` sets the build command and publish dir:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist/client` |
| Node version | 20 (`.nvmrc` + `netlify.toml`) |

Notes:

- **Do not upload `node_modules`** — Netlify installs dependencies from
  `package-lock.json`. `dist/` is gitignored and rebuilt on every deploy.
- Set `APP_URL` in **Site settings → Environment variables** (e.g.
  `https://your-site.netlify.app`). If omitted, the build falls back to
  Netlify's `URL` / `DEPLOY_PRIME_URL`, so canonical tags and the sitemap stay
  correct.
- Netlify serves static HTML only, so the **admin panel and JSON API are not
  deployed**. Edit content in `data/*.json` and push to redeploy; run
  `npm run dev` locally when you need the admin UI.
- No database or server is required at runtime.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Express + Vite middleware with HMR |
| `npm run build` | Build the client, SSR bundle and prerendered static pages |
| `npm start` | Run the production server |
| `npm run preview` | Build, then start |
| `npm run seed` | Create the admin user; `--force-user` resets its password |
| `npm test` | Run the Vitest suite |
| `npm run lint` | ESLint (flat config) |

> On Windows, if `npm` is blocked by the PowerShell execution policy, use `npm.cmd`.

---

## Project layout

```
portfolio/
├── data/                  # the "database" — JSON content files
│   ├── profile.json       # bio, skills, experience, education, certifications
│   ├── projects.json      # case studies
│   ├── settings.json      # site name, SEO defaults
│   ├── messages.json      # contact submissions (gitignored)
│   └── users.json         # admin accounts (gitignored, created by seed)
├── public/
│   └── assets/            # favicon and OG image
├── scripts/
│   ├── dev.js             # development entry point
│   ├── start.js           # production entry point
│   └── seed.js            # idempotent admin seed
├── server/
│   ├── index.js           # Express app + SSR wiring
│   ├── ssr.js             # renderer, head markup, initial state
│   ├── config.js          # env + paths
│   ├── store.js           # atomic JSON persistence with per-file locks
│   ├── secret.js          # APP_KEY or generated data/.session-key
│   ├── auth.js            # signed sessions, CSRF, login guard
│   ├── validate.js        # pipe-based validator
│   ├── models/            # profile, projects, messages, users, seo
│   └── routes/            # api, admin, seo
├── src/
│   ├── App.jsx            # route table
│   ├── entry-client.jsx   # hydrate
│   ├── entry-server.jsx   # renderToString
│   ├── components/        # layout, header, footer, cards, icons
│   ├── context/           # data, auth, flash, head
│   ├── hooks/             # theme, reveal
│   ├── lib/               # api client + formatters
│   ├── pages/             # public pages
│   │   └── admin/         # login, dashboard, projects, messages
│   └── styles/main.css    # design system
└── tests/                 # Vitest + Supertest
```

---

## Data model

Everything is a JSON array or object inside `data/`.

**`profile.json`** — `name`, `role`, `headline`, `summary[]`, `highlights{}`, `skills{}`,
`stats[]`, `experience[]`, `education[]`, `certifications[]`, `location`, `github`.

**`projects.json`** — each project has `id`, `slug`, `title`, `summary`, `description`,
`category`, `tech_stack` (comma separated), `highlights` (newline separated), `client`, `role`,
`year`, `demo_url`, `repo_url`, `featured` (0/1), `status` (`published`/`draft`),
`sort_order`, `created_at`, `updated_at`.

**`settings.json`** — `name`, `url`, `seo{}`.

Files are written with a temp file + rename so a crash never leaves a half-written file. Writes to
the same file are serialised with an in-process lock.

> `data/users.json`, `data/messages.json` and `data/.session-key` are runtime state and are
> gitignored. The content files (`profile`, `projects`, `settings`) are tracked.

---

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `APP_NAME` | `Anushka Tyagi` | Site name |
| `APP_ENV` | `local` | `production` enables static file serving |
| `APP_DEBUG` | `true` locally | Verbose SSR errors |
| `APP_URL` | `http://localhost:5173` | Canonical URL / sitemap |
| `APP_TIMEZONE` | `Asia/Kolkata` | Timestamp timezone |
| `PORT` | `5173` | HTTP port |
| `APP_KEY` | — | Session/CSRF signing key. If empty, generated into `data/.session-key` |
| `SESSION_NAME` | `portfolio_session` | Cookie name |
| `SESSION_LIFETIME` | `7200` | Session lifetime in seconds |
| `SESSION_SECURE` | `false` | Set `true` behind HTTPS |
| `ADMIN_NAME` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `Admin` / `admin` / `ChangeMe!2026` | Seeded admin |
| `DATA_DIR` | `./data` | Override the data folder (used by tests) |

---

## API

Public:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/profile` | Profile + settings |
| `GET` | `/api/projects?category=&q=` | Published projects |
| `GET` | `/api/projects/:slug` | Single project |
| `POST` | `/api/contact` | Contact form (CSRF required) |

Admin (session + CSRF):

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/api/login` · `/logout` | Sign in / out |
| `GET` | `/admin/api/me` | Current user |
| `GET` | `/admin/api/stats` | Counts for the dashboard |
| `GET/POST` | `/admin/api/projects` | List / create |
| `GET/PUT/DELETE` | `/admin/api/projects/:id` | Read / update / delete |
| `GET` | `/admin/api/messages` | Inbox |
| `GET` | `/admin/api/messages/:id` | Read (marks as read) |
| `POST` | `/admin/api/messages/:id/read` · `/unread` | Toggle read |
| `DELETE` | `/admin/api/messages/:id` | Delete |

Mutating requests need the `X-CSRF-Token` header, read from the
`portfolio_session_csrf` cookie.

---

## Security notes

- Sessions are signed, `httpOnly`, `SameSite=Lax` cookies containing `{sid, uid, exp}`.
- The session id is regenerated on sign in to prevent fixation.
- CSRF uses a double-submit token derived from the session id with HMAC-SHA256.
- Passwords are hashed with `scrypt` (`scrypt$<salt>$<hash>`).
- Set `APP_KEY` and `SESSION_SECURE=true` in production.
- The JSON store is not a multi-process database; run a single Node instance, or move to a real
  database if you need horizontal scaling.

---

## Migration notes

This replaces the original PHP application. The PHP code, SQLite schema, Composer setup and
`php tests/run.php` were removed; the content was preserved in `data/*.json` and the UI was ported
to React components. A full copy of the PHP project is available in the backup made during the
migration.

Resume, phone number and email were subsequently removed. Admin sign-in now uses a username from
`ADMIN_USERNAME`, and contact submissions are stored without a sender address in
`data/messages.json`.
