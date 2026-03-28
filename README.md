# AutoTrax — Car Maintenance Tracker

A mobile-friendly car maintenance tracker built as a single HTML file. No installation, no build tools — just open it in a browser.

**Live app:** [manualdr5.github.io/autotrax](https://manualdr5.github.io/autotrax/)

---

## Features

- **Maintenance schedule lookup** — OEM service intervals for Lexus LS 430 (2001–2006), sourced from vehicledatabases.com
- **Vehicle garage** — Add and manage multiple vehicles
- **Service log** — Record completed maintenance with dates and mileage
- **User accounts** — Sign in with email/password; your data syncs across devices via Firebase Firestore
- **2FA security** — TOTP-based two-factor authentication (Google Authenticator compatible)
- **Offline-first** — Works without an internet connection using local browser storage as fallback
- **Supabase integration** — Live vehicle maintenance database with local fallback when offline

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 (UMD, no build step) |
| Styling | Tailwind CSS (CDN) |
| Auth + sync | Firebase Authentication + Firestore |
| Vehicle DB | Supabase (PostgreSQL) |
| Hosting | GitHub Pages |

Everything runs in a single `index.html` file — no Node.js, no bundler, no dependencies to install.

---

## Vehicle Database

Maintenance schedules are sourced from **vehicledatabases.com** OEM data and stored in two places:

- **Supabase** (primary) — PostgreSQL database with 35 service intervals per vehicle year. Shows a green "Live from Supabase" banner when active.
- **Local embedded DB** (`LS430_DB`) — JavaScript constant bundled in the HTML file as a fallback. Shows a purple "local fallback" banner when Supabase is unavailable.

Currently supports:

- **Make:** Lexus
- **Model:** LS 430
- **Years:** 2001 – 2006
- **Trim:** Base 4dr Sedan Automatic

---

## Setup

### 1. Firebase (user accounts & sync)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
2. Add a Web app and copy the `firebaseConfig` values
3. Enable **Email/Password** under Authentication → Sign-in method
4. Create a **Firestore Database** (start in test mode)
5. Paste your config into `index.html` under `window.FIREBASE_CONFIG`

> Without Firebase, the app still works — data is stored in your browser's local storage.

### 2. Supabase (vehicle maintenance database)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `autotrax_schema.sql` in the Supabase SQL Editor to create the table and seed data
3. Update `SB_URL` and `SB_KEY` in `index.html` with your project's URL and publishable key

> Without Supabase, the app falls back to the embedded local database automatically.

---

## Deploying Updates

Since this is a single-file app hosted on GitHub Pages, updating is simple:

1. Edit `index.html`
2. Go to your GitHub repo → click `index.html` → click the pencil (edit) icon
3. Paste the updated file content and commit
4. GitHub Pages redeploys automatically within ~60 seconds

---

## File Structure

```
autotrax/
├── index.html          # The entire app (React + logic + styles)
├── index.backup.html   # Pre-Supabase backup (revert if needed)
├── autotrax_schema.sql # Supabase table schema + seed data
└── README.md           # This file
```

---

## License

Personal project — not licensed for redistribution.
