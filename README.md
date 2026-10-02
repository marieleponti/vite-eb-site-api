# EB Vue/Vite App — Technical Documentation

**Last updated:** October 2026
**Scope:** Architecture, structure, and development reference. Security status and pending hardening items are tracked in a separate internal document (not kept in this repository) — ask the project maintainer for access.

---

## 1. Architecture Overview

This is a headless application: a Vue 3 / Vite frontend consuming a WordPress backend via the REST API.

```
Frontend (Vue 3 + Vite + Vuetify)
        │
        │  fetch() with JWT Bearer token
        ▼
Cloudflare Pages Functions (proxy layer)
        │
        │  server-to-server fetch, WP_API env var
        ▼
WordPress REST API (Pantheon)
        │
        ▼
MySQL database (Pantheon)
```

The Functions layer exists so the frontend never talks to WordPress directly — it hides the backend URL structure, centralizes CORS handling, and allows for logic (rate limiting, response shaping) without touching WordPress code.

### Domain map

| Component | URL |
|---|---|
| Frontend (production) | Cloudflare Pages — see environment settings for the live domain |
| WordPress backend | Pantheon — see environment settings for the live domain |

---

## 2. Frontend Structure (relevant files)

```
src/
├── api/
│   ├── clients/
│   │   └── netlifyClient.js      # central fetch wrapper (netlifyFetch)
│   ├── mappers/
│   │   ├── cleanHtml.js
│   │   ├── postMapper.js
│   │   └── resourceMapper.js
│   └── services/
│       ├── authService.js        # login() — calls /api/auth
│       └── wp.service.js         # fetchPosts, fetchResources, etc.
├── composables/
│   └── useAuth.js                # global auth state (token, roles, user)
├── services/
│   ├── accessRules.js            # UI-level visibility helper (not a security boundary — real enforcement is server-side)
│   └── contentTypes.js           # content type constants
```

**Note:** `netlifyClient.js` and its function name (`netlifyFetch`) are historical, kept from an earlier hosting provider. All API calls should go through it (or `wp.service.js`, which wraps it) rather than using `fetch()` directly, so that `VITE_API_BASE` and error handling stay consistent.

---

## 3. Backend Functions (Cloudflare Pages Functions)

All live under `functions/api/`, routed by filename (e.g. `functions/api/posts.js` → `/api/posts`). `VITE_API_BASE` is set to `/api` so the frontend's relative paths resolve correctly.

| File | Route | Method | Notes |
|---|---|---|---|
| `auth.js` | `/api/auth` | POST | Login — forwards credentials to WP's JWT endpoint |
| `me.js` | `/api/me` | GET | Returns the current user's id/roles/capabilities for a given token |
| `posts.js` | `/api/posts` | GET | Read-only; write functionality intentionally removed |
| `resources.js` | `/api/resources` | GET | Read-only; includes `private`-status items only for authorized roles |
| `filters.js` | `/api/filters` | GET | Public; returns taxonomy tree for the resource library filter UI |
| `contact.js` | `/api/contact` | POST | Sends the contact form via the Resend email API |

**Environment variables required** (set in Cloudflare Pages → Settings → Environment variables, and in a local `.dev.vars` file for local dev — never commit this file):
- `WP_API` — WordPress base URL (server-side only, not exposed to the browser)
- `RESEND_API_KEY` — for the contact form
- `CONTACT_FORM_RECIPIENT` — where contact form submissions are sent
- `VITE_API_BASE` — set to `/api` (client-side, baked into the build)

**Routing gotcha:** Cloudflare Pages Functions are routed by file path. A function placed directly under `functions/` (not `functions/api/`) will intercept any Vue Router page with the same path name — keep all API functions under `functions/api/`.

---

## 4. Backend (WordPress)

### Custom code locations
- **Theme `functions.php`** — role/capability setup, REST API CORS filter.
- **`ebinforepo.php`** (mu-plugin/theme include) — active REST route registrations under the `ebinforepo/v1` namespace: `/resources`, `/me`, `/filters`.
- **`helpers.php`** (or equivalent) — `get_resources_handler()`, response formatting, taxonomy tree builder.

### Custom roles

| Role | Capabilities |
|---|---|
| `eb_team` | `read_private_posts`, `edit_posts`, `edit_published_posts`, `publish_posts` |
| `eb_community_member` | `read_private_posts` |

### Authorization pattern

Content visibility (`publish` vs `private`) is enforced **server-side in PHP** via `user_can($current_user, 'read_private_posts')` — not just hidden in the UI.

### Authentication

JWT via the **JWT Authentication for WP-API** plugin (Tmeister / `wp-api-jwt-auth`). Token expiration is set to 4 hours via the `jwt_auth_expire` filter. Login is for internal team use only — there's no public registration flow.

---

## 5. Local Development

### Prerequisites
- Node.js `22.16.0` / npm `10.9.2` (or check `NODE_VERSION` in the Cloudflare Pages project settings for the version used in production builds)
- A Cloudflare account with access to this project

### Clone and install
```bash
git clone <repo-url>
cd <project-folder>
npm install
```

### Running the frontend only (no API calls)
```bash
npm run dev
```
Pages that don't depend on API data will work, but anything calling `/api/*` will fail.

### Running the full stack locally (frontend + API functions)
```bash
npx wrangler pages dev -- npm run dev
```
Create a `.dev.vars` file in the project root (never commit it):
```
WP_API=<dev or staging WordPress URL — ask the maintainer>
RESEND_API_KEY=<ask the maintainer>
CONTACT_FORM_RECIPIENT=<your team's inbox>
```

### Building for production
```bash
npm run build
```
Output goes to `dist/`. Cloudflare Pages runs this automatically on every push to the connected branch.

---

## 6. Known Issues / Gotchas for Future Reference

- **`VITE_*` environment variables are baked in at build time**, not read at runtime. Changing them in the Cloudflare Pages dashboard requires a fresh build (not just a redeploy of a previous build) to take effect.
- **Cloudflare Pages vs. Cloudflare Workers are different products** in the dashboard despite sharing infrastructure — creating a project under the wrong one produces confusing build errors (e.g. `wrangler` trying to parse `vite.config.js` as a Worker entry point).
- **A leading `/` in `VITE_API_BASE`** combined with an endpoint starting with `/` produces a protocol-relative URL (`//posts`), which browsers interpret as `https://posts/` — an easy mistake when trying to represent "no base path." Keep `VITE_API_BASE` as `/api` (no trailing slash).
- **Not every API call goes through the shared `netlifyFetch` wrapper** — when auditing for platform-specific paths or inconsistencies, grep the whole `src/` tree, not just the central client file.
- **Never use a raw WordPress `permalink` field as a frontend link** — it always returns an absolute URL on WordPress's own domain, not a relative path. Build internal links from `slug` via Vue Router instead.

---

## 7. Open Functional Items

- **Map does not render** on the resource library / detail pages. Worked on a previous stack; not yet diagnosed on the current one. (Frontend map component, library used, and any console errors still need to be gathered.)