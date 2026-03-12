# Bayou Family Fishing — Full Codebase Review
**Date:** 2026-03-11 (updated after Sessions 11–12 review) | **Reviewed by:** Engineering + Design + UI/UX Pro Max + Accessibility
**Source file:** `bayou-family-fishing.html` (~5,200 lines as of Session 11) | **Stack:** Vanilla HTML/CSS/JS · Supabase · Formspree · Leaflet · Cloudflare Pages

---

## Executive Summary

The site is visually polished and functionally complete. All critical Session 11 security fixes have been confirmed in the source file. One new critical issue was identified in this review: **the Content Security Policy is missing Supabase domains**, which will block the entire member portal on production. This must be fixed before DNS cutover.

| Dimension | Rating | Headline |
|-----------|--------|---------|
| Security | 4/5 | S11 XSS fixes confirmed ✅ · SRI hash confirmed ✅ · **CSP missing Supabase domains — login blocker** 🔴 |
| Performance | 3.5/5 | iOS fixed-bg fix confirmed ✅ · 54/64 images lazy-loaded · No video IntersectionObserver yet |
| Correctness | 4.5/5 | VALID_SECTIONS guard ✅ · Donate sticky layout ✅ · index.html in sync ✅ |
| Accessibility | 3.5/5 | Skip link ✅ · aria-labels ✅ · Gallery22–37 alt text still generic |
| Design / UX | 4/5 | Excellent palette + typography · Donate reordered (Your Impact first) |
| Maintainability | 3.5/5 | Mixed ES5/ES6 · Inline onclick pattern (safe but noted) · All S11 fixes committed pending index.lock removal |

---

## 🔴 CRITICAL — Fix Before DNS Cutover / Login Testing

### 1. CSP Headers Missing Supabase Domains

**Severity: CRITICAL — Will break member portal on production**
**Files:** `_headers` (line 13) and `cfp.toml` (line 33)

The Content Security Policy in both config files was written before the Supabase member portal was added. It is missing three required domains:

**Current `connect-src`:**
```
connect-src 'self' https://formspree.io
```
**Needed:**
```
connect-src 'self' https://formspree.io https://*.supabase.co
```

**Current `script-src`:**
```
script-src 'self' https://unpkg.com 'unsafe-inline'
```
**Needed** (Supabase JS loads from jsdelivr, not unpkg):
```
script-src 'self' https://unpkg.com https://cdn.jsdelivr.net 'unsafe-inline'
```

**Current `img-src`:**
```
img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com
```
**Needed** (member portal photos from Supabase storage):
```
img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com https://*.supabase.co
```

**Impact without fix:**
- Supabase JS library (`cdn.jsdelivr.net`) blocked → `window.supabase` is undefined → entire portal crashes on page load
- All Supabase REST/auth API calls blocked → sign-in, profile load, pins, feed, admin panel all fail
- Member portal photos from Supabase Storage blocked → broken images everywhere in portal

**Fix in CLI session — both files must be updated identically.**

---

## ✅ All Session 11 Issues — Confirmed Fixed

The following items from the previous CODEBASE-REVIEW were all confirmed present in the source file during this review session:

### XSS / escapeHTML() in Member Portal ✅
- `escapeHTML()` defined at global scope (~line 4636)
- Applied at 30+ innerHTML concat points throughout portal (exceeds original 18 target)
- Covers: map popups, feed cards, comment bodies, admin panel, gallery submission approvals
- Pattern: `if (str == null) return ''; d.textContent = String(str); return d.innerHTML;`

### Supabase JS SRI Hash ✅
- Pinned to `@supabase/supabase-js@2.99.0`
- `integrity="sha384-XEXe97+HNh6W7E6opXLb8siV2SnDVO4xnfBIm77tH+Tl6xMs9mY3zBIl5t2QFwf2"` at line ~2717

### `showSection()` VALID_SECTIONS Guard ✅
- `if (!VALID_SECTIONS.includes(id)) { id = 'home'; }` at line ~3748
- Both direct calls and `popstate` handler guarded

### Skip-to-Main-Content Link ✅
- `.skip-link` CSS at lines ~2269, 2282
- `<a href="#home" class="skip-link">` at line ~2720

### iOS `background-attachment: scroll` Fallback ✅
- `@media (max-width: 768px)` block with `background-attachment: scroll !important` confirmed
- All 9 sections covered

### Donate Sticky Form Layout ✅
- `.donate-form-sticky { position: sticky; top: 5rem; }` at line ~1183
- `.donate-layout` → `grid-template-columns: 420px 1fr` at line ~1178
- Mobile override: `.donate-form-sticky { position: static; }` at line ~1470
- HTML wrapper div in place at line ~3369
- "Your Impact" reordered to top of right column (before "Support Mom & Pops")

---

## 🟠 Open — Fix Soon

### 2. Gallery22–37 Alt Text Still Generic

**Severity: Accessibility · WCAG 1.1.1**

16 gallery images (Gallery22–Gallery37) still have placeholder alt text like `"Bayou Family Fishing club on the water"` and `"Club members out on a bayou boat trip"`. These do not describe what's actually in each photo.

**Fix:** Open each photo in a browser, write a specific 1-sentence description of the actual subjects/action, update the `alt=""` attribute for each. Use `design:accessibility-review` in next CLI session.

### 3. Inline onclick Handlers in Dynamically Generated HTML

**Severity: Important (safe for now, blocks future CSP)**

Admin and comment buttons use the `JSON.stringify(String(id))` pattern — this is correctly escaped per napkin.md and does not create injection risk. However, it blocks tightening the CSP to remove `'unsafe-inline'` in the future.

**Defer until after launch.** Migrate to `data-*` + `addEventListener` when inline onclick → event delegation is prioritized.

### 4. 10 Images Without `loading="lazy"`

54 of 64 `<img>` tags have `loading="lazy"`. The 10 without it include the preloader logo (correct — it's above the fold) and hero-section images (correct). Worth auditing the remaining to confirm all above-the-fold images intentionally skip lazy loading.

---

## 🟡 Minor

### 5. Mixed ES5/ES6 JavaScript

File mixes `var` with `const/let` and `function(){}` with arrow functions. No runtime impact. Standardize new code on ES6 going forward.

### 6. Only One Responsive Breakpoint (768px)

Single `@media (max-width: 768px)` breakpoint. Works but no 480px small-phone or 1024px tablet optimization. Fine for launch.

### 7. Nav Link Font Size at 0.78rem (~12.5px)

Below the 16px minimum body text recommendation. Touch targets are fine due to padding. Minor legibility concern on small screens.

### 8. No WebP / srcset

All 60 images are JPG. WebP would reduce file sizes 20–35%. Not urgent; Cloudflare Image Resizing can handle this at the CDN layer if needed.

### 9. Formspree Domain Lock + Notification Email Pending

Admin tasks: lock endpoint to `bayoucharity.org` in Formspree dashboard; set notification email to `kyle.rockefeller@bayoucharity.org`.

---

## ✅ What's Working Well

**Security**
- `escapeHTML()` applied comprehensively — XSS risk eliminated in portal
- Supabase JS locked to exact version with SRI integrity hash
- Honeypot `_gotcha` on all Formspree forms
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` all set in `_headers`
- `frame-ancestors: none` in CSP blocks clickjacking

**Auth & Portal Architecture**
- `onAuthStateChange` pattern — no polling, instant state sync
- `getSB()` lazy singleton at global scope — shared correctly by gallery and portal IIFE
- Member approval flow (pending → Kyle approves → access granted) is correct and complete
- `redirectTo: window.location.origin` handles both local and production OAuth correctly
- Profile status check (`approved` / `pending`) gates the right views

**Design & Branding**
- Color palette (`--green-deep` / `--amber` / `--gold`) is cohesive and distinctively Louisiana
- Font trio (Playfair Display / Lora / Caveat) is well-calibrated
- Skyline overlays use `rgba(13,43,62,…)` at 0.36–0.62 opacity — no near-black trap
- Dark mode with `localStorage` persistence and no FOUC

**Accessibility**
- `prefers-reduced-motion` implemented comprehensively (line ~2222)
- `aria-label` on all icon-only buttons
- `aria-expanded` on boat accordion
- Skip link present and functional

**Infrastructure**
- Cloudflare Pages auto-deploy on push to `main`
- `_headers` covers caching correctly: Photos = 1yr immutable, HTML = must-revalidate
- `index.html` confirmed in sync with `bayou-family-fishing.html` (diff = clean)

---

## Git State — Action Required Before Launch

```
Branch: main
Ahead of origin/main: 1 commit
Uncommitted changes: bayou-family-fishing.html, index.html, _headers, _redirects,
                     README.md, cfp.toml, fishing-rodeo.html, donate-preview.html,
                     CLAUDE.md, CODEBASE-REVIEW.md, + many new Photos/
BLOCKER: .git/index.lock exists — delete before committing
```

**Steps to unblock:**
```bash
# Windows:
del .git\index.lock

# Mac/Linux:
rm .git/index.lock

# Then commit everything:
git add -A
git commit -m "feat: Sessions 9-11 — fishing rodeo, donate sticky, portal fixes, S11 security hardening"
git push origin main
```

**⚠️ Do NOT push until the CSP fix (#1 above) is also included in the same commit.**

---

## Local Testing Guide — Member Portal / OAuth

### Method 1: Simple Local Server (Recommended)

```bash
cd "first draft website"
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

**The CSP in `_headers` is NOT applied locally** — only Cloudflare Pages enforces it. So locally, Supabase calls work fine. This is the right place to test the portal UI.

### Enabling OAuth Locally

Both Google and Facebook OAuth need the callback URL whitelisted in Supabase:

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:8000` (or keep production URL and add a redirect)
3. Add `http://localhost:8000` to **Additional Redirect URLs**
4. Save

> **Note:** Facebook OAuth requires HTTPS even for local testing. For Facebook, either test on the live site or use a tunnel.

### Method 2: ngrok / Cloudflare Tunnel (for Facebook OAuth)

```bash
# Install cloudflared (or ngrok) then:
cloudflared tunnel --url http://localhost:8000
```

This gives you a public HTTPS URL (e.g. `https://abc123.trycloudflare.com`). Add it to Supabase Redirect URLs. Facebook OAuth works with this.

### Things to Test Locally

- [ ] Google Sign-in → redirects back → profile created → pending state shows
- [ ] Dark mode toggle persists across tab navigation
- [ ] Gallery filter buttons (All/Cookouts/Fishing/Kids Club/Community/Boats)
- [ ] Lightbox opens, arrow keys navigate, Escape closes
- [ ] Fishing Rodeo countdown is running and links to `/fishing-rodeo.html`
- [ ] All 5 boat story cards expand/collapse
- [ ] INNISFREE map loads with 3 markers
- [ ] Donate form sticky behavior (form stays pinned as you scroll)

### Things That Require Live Production to Test

- Facebook OAuth (requires HTTPS + whitelisted domain)
- Formspree form submissions (works locally but sends test emails)
- Cloudflare CDN caching behavior
- CSP enforcement (only on Cloudflare Pages, not local server)

---

## Priority Checklist — Pre-Launch Gate

### 🔴 Must-Fix Before DNS Cutover
- [ ] Fix CSP in `_headers` and `cfp.toml` — add Supabase domains
- [ ] Delete `.git/index.lock` and commit all uncommitted work
- [ ] Push to `main` → Cloudflare Pages deploys → test on production URL before cutting DNS

### 🟠 Fix Soon (Post-Launch OK if Needed)
- [ ] Gallery22–37 alt text — visual review + specific descriptions
- [ ] Inline onclick → event delegation (after Stripe integration, before adding CSP `nonce`)

### 🟡 Ongoing / Admin
- [ ] Formspree domain lock
- [ ] Formspree notification email
- [ ] DNS: confirm Squarespace → Cloudflare Pages pointing correctly
- [ ] Test Facebook OAuth end-to-end on production

---

*Review completed: 2026-03-11 | Engineering · Design · UI/UX Pro Max · Accessibility Review · Superpowers*
*Previous review: 2026-03-11 (pre-Session 11) — all critical items from that review confirmed resolved*
