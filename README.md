# EB Vue/Vite App — Architecture & Security Documentation

**Last updated:** July 2026
**Status:** Migration from Netlify to Cloudflare Pages in progress

---

## 1. Architecture Overview

This is a headless application: a Vue 3 / Vite frontend consuming a WordPress backend via the REST API.

```
Frontend (Vue 3 + Vite + Vuetify)
        │
        │  fetch() with JWT Bearer token
        ▼
Serverless Functions (proxy layer)
        │
        │  server-to-server fetch, WP_API env var
        ▼
WordPress REST API (Pantheon)
        │
        ▼
MySQL database (Pantheon)
```

The serverless functions layer exists so the frontend never talks to WordPress directly — it hides the backend URL structure, centralizes CORS handling, and allows for future logic (rate limiting, response shaping) without touching WordPress code.

### Current / target domain map

| Component | Current (during migration) | Target (after cutover) |
|---|---|---|
| Legacy WP site | `yourdomain.com` | Decommissioned |
| New frontend (Vue) | `random-hash.netlify.app` / `random-hash.pages.dev` | `yourdomain.com` |
| New WP backend | `dev-eb-vue.pantheonsite.io` | `admin.yourdomain.com` |

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
│   ├── accessRules.js            # UI-level visibility helper (not a security boundary)
│   └── contentTypes.js           # content type constants
```

**Note:** `netlifyClient.js` and its function name (`netlifyFetch`) are historical — the file now serves both Netlify and Cloudflare Pages deployments, since both expose the same relative API routes.

---

## 3. Backend Functions (proxy layer)

Two parallel implementations exist during the migration:

| Netlify (legacy) | Cloudflare Pages (current) | Route |
|---|---|---|
| `netlify/functions/auth.js` | `functions/api/auth.js` | `/api/auth` |
| `netlify/functions/me.js` | `functions/api/me.js` | `/api/me` |
| `netlify/functions/posts.js` | `functions/api/posts.js` | `/api/posts` |
| `netlify/functions/resources.js` | `functions/api/resources.js` | `/api/resources` |
| `netlify/functions/filters.js` | *(pending conversion)* | `/api/filters` |

**Important naming note:** Cloudflare Pages Functions are routed by file path. Early in the migration, functions lived directly under `functions/` (e.g. `functions/resources.js` → `/resources`), which **collided with the Vue Router page of the same name**. All functions were moved under `functions/api/` to avoid this. `VITE_API_BASE` is set to `/api` in the Cloudflare Pages project (and to `/.netlify/functions` in the Netlify project) to match.

### Function responsibilities

- **`auth.js`** — accepts `POST` with `{ username, password }`, forwards to WP's `jwt-auth/v1/token` endpoint, returns `{ token, user }` or a generic error.
- **`me.js`** — accepts a Bearer token, forwards it to a custom WP endpoint (`ebinforepo/v1/me`), returns the current user's `id`, `roles`, `caps`.
- **`posts.js`** — read-only (`GET`). Write functionality (create/update posts) was removed as unused; all content is managed via wp-admin by the internal team.
- **`resources.js`** — read-only (`GET`). Determines whether to include `private` status resources based on the requesting user's role (validated server-side against WordPress via `me.js`'s underlying check).
- **`filters.js`** — *(pending)* returns taxonomy filter options for the resource library UI.

---

## 4. Backend (WordPress / Pantheon)

### Custom code locations
- **Theme `functions.php`** — role/capability setup, CORS filter for the REST API, legacy/duplicate route registration (`inforepo/v1`, unused).
- **`ebinforepo.php` (mu-plugin or theme include)** — active REST route registrations under `ebinforepo/v1`: `/resources`, `/me`, `/filters`.
- **`helpers.php` (or similar)** — `get_resources_handler()`, `inforepo_format_resources_response()`, taxonomy tree builder for filters.

### Custom roles

| Role | Capabilities |
|---|---|
| `eb_team` | `read_private_posts`, `edit_posts`, `edit_published_posts`, `publish_posts` |
| `eb_community_member` | `read_private_posts` |

### Authorization pattern (confirmed working)

Content visibility is enforced **server-side in PHP**, not just in the frontend:

```php
$can_see_private = !empty($current_user->ID) && user_can($current_user, 'read_private_posts');
$post_status = $can_see_private ? ['publish', 'private'] : ['publish'];
```

This was verified empirically: a low-privilege test user (`subscriber`/`contributor` role) received `403 Forbidden` when attempting to create content via `POST /api/posts`, and did not see `private`-status resources when querying `/api/resources`.

### CORS configuration

`functions.php` overrides WordPress's default REST CORS handling to allow only specific origins:

```php
$allowed =
  $origin === 'http://127.0.0.1:8080' ||
  $origin === 'http://127.0.0.1:5173' ||
  str_contains($origin, 'netlify.app') ||
  str_contains($origin, 'pages.dev');
```

**⚠️ Temporary / to revisit at cutover:** `str_contains()` matches the string anywhere in the origin, not just as a domain suffix — broader than ideal. Once the final domain is live, this should be replaced with an exact match (or `str_ends_with()`) against the production frontend domain only, and the `netlify.app` / `pages.dev` fallbacks removed.

### JWT authentication

- Plugin: **JWT Authentication for WP-API** (Tmeister / `wp-api-jwt-auth`).
- `JWT_AUTH_SECRET_KEY` — confirmed to be a long, random string (not a placeholder).
- Token expiration — set to **4 hours** via:
  ```php
  add_filter('jwt_auth_expire', function ($expire, $issuedAt) {
      return $issuedAt + (4 * HOUR_IN_SECONDS);
  }, 10, 2);
  ```

---

## 5. Security Review — Summary of Findings & Fixes

All items below were identified and resolved during a manual security review of the codebase.

### 🔴 Critical (all resolved)
- [x] Removed all `console.log` statements exposing JWTs, auth headers, or full request headers (frontend and backend, including a PHP `error_log(wp_get_current_user())` call).
- [x] Verified server-side permission enforcement on write endpoints via live testing with a low-privilege account.
- [x] Removed unused post create/update functionality (`createPost`, `updatePost`, and the corresponding `POST`/`PUT` branches in `posts.js`) — content is managed exclusively via wp-admin.
- [x] Confirmed `JWT_AUTH_SECRET_KEY` is strong and random.
- [x] Set JWT expiration to 4 hours (previously unset / plugin default).
- [x] Removed the public `submit-resource` form and its associated `acf_form_head()` hook — content submission is no longer publicly accessible.

### 🟠 High (mostly resolved)
- [x] Replaced raw `error.message` responses with generic client-facing messages across all functions; real errors are logged server-side only.
- [x] `netlifyFetch` now checks `res.ok` and throws a typed error (`.status`, `.data`) instead of silently returning error bodies as if they were successful responses.
- [x] `checkCurrentUser()` now forces logout on `401`/`403` responses instead of treating all errors as transient network issues.
- [x] CORS restricted to specific origins (see above; needs final tightening at domain cutover).
- [ ] **Pending:** Configure Cloudflare rate limiting on `/api/auth`.
- [ ] **Pending:** Configure Cloudflare WAF (managed rules + custom rule restricting `/wp-admin` and `/wp-login.php`).
- [ ] **Pending:** Set Cloudflare SSL/TLS mode to "Full (strict)" once `admin.yourdomain.com` is proxied through Cloudflare.

### 🟡 Medium
- [x] Applied `encodeURIComponent()` to all query parameters passed to WordPress from `posts.js`.
- [ ] **Pending:** Add security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS) via `netlify.toml` / Cloudflare Pages headers configuration.
- [ ] **Pending:** Restrict `Access-Control-Allow-Origin: *` in `resources.js`/`posts.js` responses to the production domain only, once finalized.
- [ ] **Pending:** Evaluate moving the JWT from `localStorage` to an `httpOnly` cookie (architectural change, not urgent given other mitigations in place).
- [ ] **Pending:** Fix `accessRules.js` — currently checks `user?.role` (singular) but the rest of the codebase uses `roles` (array); this likely means `canViewResource()` always evaluates to `false`. Not a security hole (fails closed), but a functional bug.
- [ ] **Pending:** Remove duplicate/dead code: the legacy `inforepo/v1` route registration in `functions.php`, and a large commented-out block in the resources formatter helper.

### 🟢 Low
- [x] Deleted unused WordPress "Page" content type entries (not consumed by the headless frontend).
- [ ] **Pending:** Delete `useAuth.bak` from the repository.
- [ ] **Pending:** Monitor the JWT plugin's maintenance status long-term; consider alternatives if it becomes unmaintained.

### Noted but not yet actioned
- **Stored XSS via post `content`:** `get_resources_handler()` returns `apply_filters('the_content', $post->post_content)` unescaped. Since the public submission form has been removed, all content is authored by the trusted internal `eb_team`, making this a low/acceptable risk today. If `content` or `description` is ever rendered via `v-html` in the frontend, sanitization (e.g. DOMPurify) should be added as defense-in-depth.

---

## 6. Migration Status: Netlify → Cloudflare Pages

**Reason for migration:** Consolidating frontend and backend security tooling (WAF, DNS, rate limiting) under a single provider (Cloudflare), and reducing bandwidth costs at scale.

**Strategy:** Same Git repository, separate branch (`cloudflare`) connected to a new Cloudflare Pages project, allowing parallel testing without affecting the live Netlify deployment. Cutover to the real domain happens only after full verification.

### Completed
- [x] Cloudflare Pages project created and correctly configured as **Pages** (not Workers — an early misconfiguration caused build failures where `wrangler` attempted to parse `vite.config.js`).
- [x] `NODE_VERSION` environment variable set to match the Netlify build environment.
- [x] All four core functions (`auth`, `me`, `posts`, `resources`) converted from Netlify's `exports.handler` format to Cloudflare's `onRequestGet`/`onRequestPost` format using the standard Fetch API (`Request`/`Response`).
- [x] Environment variables (`WP_API`, `VITE_API_BASE`) configured for the Cloudflare Pages project.
- [x] Route collision between Vue Router pages and API functions resolved by moving all functions under `functions/api/` and setting `VITE_API_BASE=/api`.
- [x] CORS updated in WordPress to allow the `*.pages.dev` origin during testing.
- [x] End-to-end verification: posts and resources load correctly in the UI when navigated via the app.

### Remaining
- [ ] Convert `filters.js` (in progress).
- [ ] Verify remaining flows: resource/post detail pages by slug, login flow, search.
- [ ] Point `admin.yourdomain.com` DNS (via Cloudflare, proxied) to the new Pantheon WP environment.
- [ ] Point the root domain to Cloudflare Pages.
- [ ] Update `WP_API` / `VITE_WP_API` to use `admin.yourdomain.com` instead of the raw Pantheon URL.
- [ ] Tighten the WordPress CORS filter to the final production domain only.
- [ ] Apply Cloudflare WAF, rate limiting, and SSL "Full (strict)" configuration.
- [ ] Decommission the legacy WordPress site.
- [ ] Remove `netlify/functions/` and related Netlify configuration once Cloudflare is confirmed stable in production.

---

## 7. Known Issues / Gotchas for Future Reference

- **Cloudflare Pages Functions routing is filename/folder-based** — any function placed directly under `functions/` will intercept a matching frontend route if one exists with the same name (e.g. `/resources`). Always check for collisions with Vue Router paths before adding new functions.
- **`VITE_*` environment variables are baked in at build time**, not read at runtime. Changing them in the Cloudflare Pages dashboard requires a fresh build (not just a redeploy of a previous build) to take effect.
- **Cloudflare Pages vs. Cloudflare Workers are different products** in the dashboard despite sharing infrastructure — creating a project under the wrong one produces confusing build errors (e.g. `wrangler` trying to parse `vite.config.js` as a Worker entry point).
- **A leading `/` in `VITE_API_BASE`** combined with an endpoint starting with `/` produces a protocol-relative URL (`//posts`), which browsers interpret as `https://posts/` — an easy mistake when trying to represent "no base path."
