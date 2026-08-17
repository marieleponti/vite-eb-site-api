# EB Vue/Vite App — Architecture & Security Documentation

**Last updated:** August 2026
**Status:** Frontend live on the production domain via Cloudflare Pages. Backend domain cutover blocked on a Pantheon plan upgrade (Sandbox → paid) — see section 8.

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

| Component | Current | Target (after full cutover) |
|---|---|---|
| Legacy WP site | Still live, serving legacy content | Decommissioned |
| New frontend (Vue) | **`yourdomain.com` — LIVE** (Cloudflare Pages) | Same, no change needed |
| New WP backend | `dev-eb-vue.pantheonsite.io` (Pantheon Sandbox plan) | `admin.yourdomain.com` |

**⚠️ Blocker:** The new WP backend is on Pantheon's free Sandbox plan, which does not support custom domains. An upgrade purchase is pending Pantheon's approval (multi-day process). Until it clears, `admin.yourdomain.com` cannot be configured, `WP_API`/`VITE_WP_API` must keep pointing at the raw `dev-eb-vue.pantheonsite.io` URL, and PDFs/uploads served from that origin show Pantheon's Sandbox interstitial warning page to visitors (see section 8).

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
| `netlify/functions/filters.js` | `functions/api/filters.js` | `/api/filters` |
| *(none — used Netlify Forms)* | `functions/api/contact.js` | `/api/contact` |

**Important naming note:** Cloudflare Pages Functions are routed by file path. Early in the migration, functions lived directly under `functions/` (e.g. `functions/resources.js` → `/resources`), which **collided with the Vue Router page of the same name**. All functions were moved under `functions/api/` to avoid this. `VITE_API_BASE` is set to `/api` in the Cloudflare Pages project (and to `/.netlify/functions` in the Netlify project) to match.

### Function responsibilities

- **`auth.js`** — accepts `POST` with `{ username, password }`, forwards to WP's `jwt-auth/v1/token` endpoint, returns `{ token, user }` or a generic error.
- **`me.js`** — accepts a Bearer token, forwards it to a custom WP endpoint (`ebinforepo/v1/me`), returns the current user's `id`, `roles`, `caps`.
- **`posts.js`** — read-only (`GET`). Write functionality (create/update posts) was removed as unused; all content is managed via wp-admin by the internal team.
- **`resources.js`** — read-only (`GET`). Determines whether to include `private` status resources based on the requesting user's role (validated server-side against WordPress via `me.js`'s underlying check).
- **`filters.js`** — read-only (`GET`), no authentication required. Returns the hierarchical taxonomy tree (topics, sources, formats, countries, languages) used to populate the resource library filter UI.
- **`contact.js`** — accepts `POST` with `{ name, email, message, website }` from the About page contact form. Replaces **Netlify Forms**, a Netlify-native feature with no Cloudflare Pages equivalent. Sends the message via the [Resend](https://resend.com) API (`RESEND_API_KEY`, `CONTACT_FORM_RECIPIENT` env vars). Includes server-side honeypot validation (the `website` field) in addition to the existing frontend check, since a bot could bypass the frontend entirely.

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
- [x] CORS restricted to specific origins (see below; needs final tightening at domain cutover).
- [x] Cloudflare's Free Managed Ruleset confirmed active by default on the frontend zone (no configuration needed on the Free plan).
- [x] Rate limiting rule deployed on `/api/auth` (5 requests, currently limited to a 10-second window/block duration — the dashboard's rate-limiting rule editor would not accept longer values in this account; revisit via the Cloudflare API if a longer window is needed).
- [x] Cloudflare SSL/TLS mode confirmed set to `Full (strict)`.
- [ ] **Pending:** Configure Cloudflare WAF custom rule restricting `/wp-admin` and `/wp-login.php` — blocked until `admin.yourdomain.com` is proxied through Cloudflare.

### 🟡 Medium
- [x] Applied `encodeURIComponent()` to all query parameters passed to WordPress from `posts.js`.
- [x] Fixed `accessRules.js` — was checking `user?.role` (singular) while the rest of the codebase uses `roles` (array), which meant `canViewResource()` always evaluated to `false`. Not a security hole (failed closed), but a functional bug. Now checks `user?.roles?.includes('ebteam')` / `user?.roles?.includes('administrator')`.
- [x] Removed duplicate/dead code: the legacy `inforepo/v1` route registration (`inforepo_api_get_resources()`) in `functions.php`, and the large commented-out legacy version of the resources formatter helper.
- [ ] **Pending:** Add security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS) via Cloudflare Pages headers configuration.
- [ ] **Pending:** Restrict `Access-Control-Allow-Origin: *` in `resources.js`/`posts.js` responses to the production domain only, once finalized.
- [ ] **Pending:** Evaluate moving the JWT from `localStorage` to an `httpOnly` cookie (architectural change, not urgent given other mitigations in place).

### 🟢 Low
- [x] Deleted unused WordPress "Page" content type entries (not consumed by the headless frontend).
- [x] Deleted `useAuth.bak` from the repository.
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
- [x] All five functions (`auth`, `me`, `posts`, `resources`, `filters`) converted from Netlify's `exports.handler` format to Cloudflare's `onRequestGet`/`onRequestPost` format using the standard Fetch API (`Request`/`Response`).
- [x] Environment variables (`WP_API`, `VITE_API_BASE`) configured for the Cloudflare Pages project.
- [x] Route collision between Vue Router pages and API functions resolved by moving all functions under `functions/api/` and setting `VITE_API_BASE=/api`.
- [x] CORS updated in WordPress to allow the `*.pages.dev` origin during testing.
- [x] Fixed `authService.js`, which had the Netlify function path (`/.netlify/functions/auth`) hardcoded instead of using `VITE_API_BASE` like the rest of the API layer — this caused login to fail silently on Cloudflare until corrected.
- [x] End-to-end verification complete: posts, resources, filters, login, resource/post detail pages (by slug), and search all confirmed working in the UI on Cloudflare Pages.
- [x] Contact form migrated from Netlify Forms (no Cloudflare equivalent) to a custom function using the Resend email API.

### Remaining
- [ ] Point `admin.yourdomain.com` DNS (via Cloudflare, proxied) to the new Pantheon WP environment — **blocked on Pantheon Sandbox → paid plan approval** (see section 8).
- [ ] Update `WP_API` / `VITE_WP_API` to use `admin.yourdomain.com` instead of the raw Pantheon URL.
- [ ] Tighten the WordPress CORS filter to the final production domain only.
- [ ] Add the Cloudflare WAF custom rule restricting `/wp-admin` and `/wp-login.php` (depends on `admin.yourdomain.com` being proxied).
- [ ] Decommission the legacy WordPress site.
- [ ] Remove `netlify/functions/` and related Netlify configuration once Cloudflare is confirmed stable in production.

---

## 8. Domain Cutover Status

### Frontend — done
`yourdomain.com` now points to the Cloudflare Pages project and is confirmed live and working (login, posts, resources, filters, detail pages, search, and the contact form all verified in production).

### Backend — blocked on Pantheon
The new WordPress environment is still on Pantheon's **Sandbox** (free) plan. Pantheon does not support custom domains on Sandbox, so `admin.yourdomain.com` cannot be added yet. An upgrade purchase has been submitted and is pending Pantheon's approval (expected to take a few days).

**Side effects while on Sandbox:**
- Pantheon shows an interstitial "Sandbox environment" warning page to visitors before serving any asset from the raw Pantheon URL (e.g. PDFs under `wp-content/uploads/`). This is a deliberate anti-abuse measure on Pantheon's side (intended to discourage spam/phishing use of sandbox sites), not a vulnerability or misconfiguration on our end — confirmed no security impact, cosmetic only.
- **Known bug (Pantheon's side, not ours):** the "Continue" button on that interstitial does not respond to taps on mobile (confirmed on both iOS Safari and Chrome Android; ruled out small tap-target and cookie-blocking causes). No fix available until the site leaves Sandbox — reported to Pantheon support.

**Once the Pantheon upgrade is approved:**
1. Add `admin.yourdomain.com` as a custom domain in Pantheon → Domains/HTTPS (Live environment).
2. Create the corresponding `CNAME` in Cloudflare DNS (proxied — orange cloud).
3. Update `WP_API` / `VITE_WP_API` in Cloudflare Pages from the raw Pantheon URL to `https://admin.yourdomain.com`.
4. Tighten the WordPress CORS filter to the production frontend domain only (remove the `netlify.app` / `pages.dev` fallbacks).
5. Add the Cloudflare WAF custom rule restricting `/wp-admin` and `/wp-login.php`.
6. Decommission the legacy WordPress site.

---

## 9. Bug Fixes Found During Migration Testing

- **Broken "Read More" link on the last item of the homepage featured content slider.** The link used WordPress's `permalink` field directly as the `href`, which `get_permalink()` always returns as an absolute URL on WordPress's own domain (the raw Pantheon URL) — not a relative path. Most items appeared to work because of how their data happened to pass through the mappers, but this wasn't reliable. Fixed by building the link from `item.slug` via Vue Router instead:
  ```vue
  <router-link
    :to="item.type === 'post' ? `/blog/${item.slug}` : `/resources/${item.slug}`"
    class="featured-link"
  >
  ```
  **Takeaway:** never use a raw WordPress `permalink` field as a frontend link — it will always point at whatever domain WordPress itself is configured with, which may not match the frontend's domain in a headless setup. Build internal links from `slug` instead.

---

## 10. Open Items

- [ ] **Map does not render** on the resource library / detail pages. Worked on the legacy site; not yet diagnosed on the new stack. (Frontend map component, library used, and any console errors still need to be gathered.)
- [ ] Domain cutover for the backend (see section 8) — blocked on Pantheon plan approval.

---

## 11. Known Issues / Gotchas for Future Reference

- **Cloudflare Pages Functions routing is filename/folder-based** — any function placed directly under `functions/` will intercept a matching frontend route if one exists with the same name (e.g. `/resources`). Always check for collisions with Vue Router paths before adding new functions.
- **`VITE_*` environment variables are baked in at build time**, not read at runtime. Changing them in the Cloudflare Pages dashboard requires a fresh build (not just a redeploy of a previous build) to take effect.
- **Cloudflare Pages vs. Cloudflare Workers are different products** in the dashboard despite sharing infrastructure — creating a project under the wrong one produces confusing build errors (e.g. `wrangler` trying to parse `vite.config.js` as a Worker entry point).
- **A leading `/` in `VITE_API_BASE`** combined with an endpoint starting with `/` produces a protocol-relative URL (`//posts`), which browsers interpret as `https://posts/` — an easy mistake when trying to represent "no base path."
- **Not every API call goes through the shared `netlifyFetch` wrapper.** `authService.js`'s `login()` function had the Netlify function path hardcoded (`/.netlify/functions/auth`) instead of using `VITE_API_BASE`, so it was missed during the initial `VITE_API_BASE` migration and kept failing (405, then a literal `${API}` in the URL from an unescaped template-literal typo) until caught by manual testing. When auditing for platform-specific paths, grep the whole `src/` tree for `/.netlify/` or similar literals, not just the central client file.