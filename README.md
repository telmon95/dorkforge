# DorkForge Pro

A terminal-style Google dork builder for bug bounty recon, OSINT, and authorized penetration testing. Enter a target domain, select from 55+ pre-built dork queries across 11 categories, and launch Google searches in bulk — with optional AI strategy help and a findings notebook.

**Live demo:** https://dorkforge-three.vercel.app  
**Repository:** https://github.com/telmon95/dorkforge

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Dork Library](#dork-library)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Usage Guide](#usage-guide)
- [Legal & Ethical Use](#legal--ethical-use)
- [Limitations](#limitations)
- [Contributing](#contributing)

---

## Overview

DorkForge is a single-page React application that helps security researchers build and execute Google dork queries against authorized targets. It does **not** automate searches, scrape results, or crawl targets. Instead, it:

1. Generates parameterized dork strings from your target domain
2. Lets you filter, select, and queue queries
3. Opens selected dorks as Google search tabs in your browser
4. Optionally assists with strategy via an AI chat panel
5. Lets you log and export findings manually

The UI uses a fullscreen dark terminal aesthetic — monospace fonts, green-on-black, scanline overlay — designed for long recon sessions.

---

## Features

### Dork Builder
- **55+ pre-built dorks** across 30 categories, grouped into 11 recon domains
- **Target injection** — enter `example.com` and all `{domain}` / `{target}` placeholders are replaced automatically
- **Group filters** — toggle Infrastructure, Files, Recon, Secrets, Errors, Vulns, Cloud, CMS, 3rd Party, OSINT
- **Search filter** — narrow the dork list by keyword
- **Custom dorks** — add your own queries at runtime
- **Bulk open** — launch all selected dorks as new Google tabs with one click
- **Per-dork actions** — copy query to clipboard or open individually

### Query Queue
- Right-panel builder tab shows all selected dorks before launch
- Session summary: target, queued count, findings logged, active groups
- Direct Google search links for each queued query

### AI Assistant (optional)
- Claude-powered chat panel for recon strategy
- Context-aware: knows your target and selected dorks
- Suggests prioritization, explains findings, proposes additional patterns
- Requires `ANTHROPIC_API_KEY` on the backend (never exposed to the browser)

### Findings Notebook
- Manual logging of discoveries with severity levels (critical → info)
- Fields: query used, notes, finding description
- Export findings to `.txt`
- Export full session to `.json` (target, queries, URLs, findings)

### Export
- **JSON export** — target, timestamp, all selected queries with Google URLs, findings
- **Findings export** — plain-text report for bug bounty submissions

---

## How It Works

```
TARGET → select dorks → OPEN → Google tabs → review manually → log findings
```

DorkForge is a **redirect-based launcher**, not an automated scanner:

| Action | What happens |
|--------|--------------|
| Click **OPEN** | `window.open()` to `google.com/search?q=...` |
| Click **OPEN** on a row | Same — single tab |
| AI tab | `POST /api/chat` → Anthropic API (server-side) |
| Findings tab | Local state only — no backend persistence |
| Export | Client-side file download |

There is no headless browser, no search API integration, and no result parsing. You review Google results yourself and document what you find.

---

## Dork Library

All dorks are defined in `src/components/DorkForge.jsx` inside `buildDorkLibrary(domain, target)`.

### Groups & Categories

| Group | Categories | Example dorks |
|-------|------------|---------------|
| **Infrastructure** | .git Folders | `inurl:"/.git" example.com -github` |
| **Files & Docs** | Backup Files, Exposed Documents, Confidential Docs, Other Interesting Files | `site:example.com ext:pdf`, `filetype:env` |
| **Config & DB** | Config Files, Database Files | `site:example.com ext:xml \| ext:conf \| ext:env` |
| **Secrets & Keys** | Private Keys & Secrets, Sensitive File Types | `intext:"api_key" "example.com"`, `inurl:.env` |
| **Error Leaks** | SQL Errors, PHP Errors, Generic Error Leaks | `site:example.com "stack trace"`, `"PHP Warning"` |
| **Recon** | Surface Mapping, API Surface, Frontend/JS Intel, Dev & Staging, API Documentation, Login & Admin Pages | `site:*.example.com`, `inurl:api`, `inurl:graphql`, `filetype:js` |
| **Vulnerabilities** | Open Redirects, Directory Listings, Apache Struts RCE | `inurl:redirect`, `intitle:"index of"` |
| **CMS** | WordPress Files | `inurl:wp-content`, `inurl:wp-includes` |
| **Cloud & DevOps** | Cloud Buckets, Traefik Dashboard, Jenkins | `site:.s3.amazonaws.com "example.com"` |
| **3rd Party Intel** | Code Repos, Pastebin, Trello, GitHub leaks, Stack Overflow | `site:pastebin.com "example.com"` |
| **OSINT** | LinkedIn Employees | `site:linkedin.com employees example.com` |

### Generic Recon Pack (high-value additions)

These categories were added for safe, high-signal bug bounty recon:

- **Surface Mapping** — `site:target`, `site:target -www`, wildcard subdomains
- **API Surface** — `/api`, `/api/v1`, GraphQL, REST endpoints
- **Frontend / JS Intel** — `.js` files, `static/js`, `window.__`, config leaks
- **Dev & Staging** — `dev`, `test`, `staging`, `sandbox` environments
- **API Documentation** — Swagger, OpenAPI, docs, developer portals
- **Generic Error Leaks** — broad error, stack trace, exception, warning signals

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 6 |
| Styling | Inline styles, Google Fonts (JetBrains Mono, Share Tech Mono) |
| Local API | Express 4 (dev only) |
| Production API | Vercel Serverless Functions |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Hosting | Vercel |

---

## Project Structure

```
dorkforge/
├── api/
│   └── chat.js              # Vercel serverless + shared chat handler
├── server/
│   └── index.js             # Local Express dev server (port 3001)
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root component
│   └── components/
│       └── DorkForge.jsx    # Main app (dork library, UI, state)
├── index.html               # HTML shell
├── vite.config.js           # Vite config + API proxy
├── vercel.json              # Vercel build + SPA rewrites
├── package.json
├── .env.example
└── .gitignore
```

### Key files

- **`DorkForge.jsx`** — entire frontend: dork library, UI components, state management
- **`api/chat.js`** — proxies chat requests to Anthropic; API key stays server-side
- **`server/index.js`** — local dev only; mirrors the Vercel API route
- **`vite.config.js`** — proxies `/api/*` to `localhost:3001` during development

---

## Getting Started

### Prerequisites

- Node.js 18+ (22 recommended)
- npm

### Install

```bash
git clone https://github.com/telmon95/dorkforge.git
cd dorkforge
npm install
```

### Run locally (frontend + backend)

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |

### Run frontend only

```bash
npm run dev:client
```

The AI tab will fail without the backend running.

### Production build

```bash
npm run build
npm run preview
```

---

## Environment Variables

Copy the example file and add your key:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For AI tab only | Anthropic API key for `/api/chat` |
| `PORT` | No | Local Express port (default: `3001`) |

The dork builder, OPEN, findings, and export work **without** any environment variables. Only the AI assistant needs `ANTHROPIC_API_KEY`.

---

## Deployment

### Vercel (recommended)

The project is configured for Vercel out of the box.

```bash
npx vercel
npx vercel --prod
```

Or connect the GitHub repo in the [Vercel dashboard](https://vercel.com) for automatic deploys on push.

**Required for AI tab in production:**

1. Vercel → Project → Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY`
3. Redeploy

### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- Static frontend served from `dist/`
- `/api/chat` handled by serverless function in `api/chat.js`
- All other routes fall through to `index.html` (SPA)

---

## API Reference

### `POST /api/chat`

Proxies messages to Anthropic Claude. Used by the AI tab.

**Request:**

```json
{
  "system": "You are DorkForge AI...",
  "messages": [
    { "role": "user", "content": "What categories should I prioritize?" }
  ]
}
```

**Response (200):**

```json
{
  "reply": "For a typical web app bug bounty, start with..."
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| `400` | Missing `messages` array |
| `405` | Non-POST request |
| `500` | Missing `ANTHROPIC_API_KEY` or Anthropic API error |

### `GET /api/health` (local dev only)

```json
{ "status": "ok", "service": "dorkforge-api" }
```

---

## Usage Guide

### Basic workflow

1. Enter a target domain (e.g. `example.com`) in the **TARGET** field
2. Use group filters to enable relevant categories (Infrastructure, Recon, Secrets, etc.)
3. Expand categories on the left and check the dorks you want
4. Review your selection in the **QUEUE** tab on the right
5. Click **OPEN** to launch Google searches in new tabs
6. Review results manually in your browser
7. Log discoveries in the **FINDINGS** tab (optional)
8. **EXPORT JSON** or export findings when done

### Tips

- Start with **Recon** and **Secrets** groups for most bug bounty programs
- Use the search filter to find specific patterns (e.g. `api`, `env`, `admin`)
- Add custom dorks for program-specific queries
- Use **ALL** / **CLEAR** to quickly select or deselect everything visible
- The AI tab can suggest prioritization if you're unsure where to start

### Custom dorks

The input at the bottom of the left panel accepts raw dork strings. Examples:

```
intext:"api_key" "example.com"
filetype:env site:example.com
inurl:admin site:staging.example.com
```

Custom dorks are session-only (not persisted across page reloads).

---

## Legal & Ethical Use

**Only use DorkForge on targets you are authorized to test.**

This includes:

- Bug bounty programs with explicit scope (HackerOne, Bugcrowd, etc.)
- Penetration tests with written authorization
- Your own infrastructure and applications
- CTF / lab environments

Do **not** use this tool for:

- Unauthorized scanning of third-party systems
- Harassment, doxxing, or non-security OSINT
- Mass automated querying that violates Google Terms of Service
- Testing accounts, systems, or data you do not own or have permission to access

DorkForge generates search queries and opens them in **your** browser. You are responsible for how those queries are used and for complying with program rules, local laws, and platform terms of service.

---

## Limitations

| Limitation | Detail |
|------------|--------|
| No automation | Does not run searches or parse results |
| Google dependency | Subject to CAPTCHAs, rate limits, and regional restrictions |
| No persistence | Findings and custom dorks are lost on page reload |
| AI requires API key | AI tab is optional and needs backend configuration |
| No auth | No user accounts or multi-session support |
| Client-side only | All state lives in browser memory |

### Planned improvements (not yet implemented)

- Backend persistence for findings and sessions
- Program-specific preset packs (e.g. HackerOne scope targets)
- Export to recon tool formats
- Subdomain enumeration API integrations

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-dork-pack`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

When adding dorks, place them in the appropriate group inside `buildDorkLibrary()` in `src/components/DorkForge.jsx`. Keep queries focused and avoid duplicates.

---

## License

Private project. All rights reserved.

---

## Acknowledgments

Dork library sourced from real bug bounty recon methodology and [BugBountyHunter](https://www.bugbountyhunter.com/) reference patterns. Generic recon pack additions follow safe, high-value OSINT practices for authorized security research.
