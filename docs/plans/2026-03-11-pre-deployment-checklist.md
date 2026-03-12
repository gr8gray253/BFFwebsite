# Bayou Charity — Master Overhaul Deployment Checklist
**Date:** 2026-03-11 (updated 2026-03-12) | **Reviewed by:** Engineering + Design Accessibility + UI/UX Pro Max + Brainstorming
**Environment:** Cowork session (plan only — no code changes) | **Context:** Site is already live at `bayoucharity.org` with an older build. This is an overhaul deployment — pushing Sessions 9–12 work on top of a stable live site.

---

## 🔴 BLOCKER TIER — Must Fix Before Pushing the Overhaul

These items will cause production failures or expose sensitive information the moment the new build deploys.

---

### BLOCKER 1 — CSP Headers Missing Supabase Domains
**Files:** `_headers` (line 13) and `cfp.toml` (line 33) — **both must be updated identically**
**Impact:** Entire member portal crashes on production. `window.supabase` is undefined. Every API call blocked. Portal photos broken.

**Current `connect-src`:**
```
connect-src 'self' https://formspree.io
```
**Required:**
```
connect-src 'self' https://formspree.io https://*.supabase.co
```

**Current `script-src`:**
```
script-src 'self' https://unpkg.com 'unsafe-inline'
```
**Required:**
```
script-src 'self' https://unpkg.com https://cdn.jsdelivr.net 'unsafe-inline'
```

**Current `img-src`:**
```
img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com
```
**Required:**
```
img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com https://*.supabase.co
```

**CLI fix:** Edit both files identically. Run `diff _headers cfp.toml` to spot divergence after.

---

### BLOCKER 2 — Stale `.git/index.lock` Prevents All Commits
**File:** `.git/index.lock`
**Impact:** Every `git commit` and `git add` fails silently or with an error. Enormous amount of Sessions 9–12 work is uncommitted and unpushed — including the CSP fix.

**CLI fix:**
```bash
# Mac/Linux:
rm .git/index.lock

# Windows:
del .git\index.lock
```

Then commit all pending work. Do NOT push until BLOCKER 1 (CSP fix) is included in the same commit.

---

### BLOCKER 3 — Internal Docs Are Publicly Accessible
**Files:** `_redirects`, `_headers`
**Impact:** Anyone can navigate to:
- `bayoucharity.org/CLAUDE.md` — internal architecture, Supabase key, board member emails, all known vulnerabilities
- `bayoucharity.org/CODEBASE-REVIEW.md` — full security audit, what's fixed and what's open
- `bayoucharity.org/docs/plans/2026-03-11-pre-deployment-checklist.md` — this file and any future planning docs in `docs/`

Cloudflare Pages serves all files in the repo at their path. None of these are currently blocked.

**CLI fix — add to `_redirects` (before the `/*` catch-all):**
```
/CLAUDE.md            /404.html  404
/CODEBASE-REVIEW.md   /404.html  404
/docs/*               /404.html  404
```

**Also add to `_headers`:**
```
/CLAUDE.md
  X-Robots-Tag: noindex, nofollow
/CODEBASE-REVIEW.md
  X-Robots-Tag: noindex, nofollow
/docs/*
  X-Robots-Tag: noindex, nofollow
```

**Note:** CLAUDE.md and CODEBASE-REVIEW.md stay committed to git — they're internal docs — just blocked from public serving. The `docs/` directory stays committed for the same reason.

---

### BLOCKER 4 — `donate-preview.html` Is Publicly Accessible Dev File
**File:** `donate-preview.html` (untracked — `??` in `git status`)
**Impact:** A raw dev preview file is reachable at `bayoucharity.org/donate-preview.html`. Looks incomplete/broken to any visitor who stumbles on it.

**CLI fix — add to `_redirects`:**
```
/donate-preview.html  /404.html  404
```

Or delete the file entirely if it's no longer needed. Also add to `.gitignore`:
```
donate-preview.html
```

---

## 🟠 HIGH PRIORITY — Fix Before or Shortly After Launch

These don't break the site but hurt user experience, SEO, or accessibility compliance.

---

### HIGH 1 — Gallery Upload Form: Labels Not Associated with Inputs (WCAG 1.3.1 / 4.1.2)
**File:** `bayou-family-fishing.html` lines ~2919–2924
**Issue:** Two `<label>` elements in the gallery upload form have no `for` attribute, so screen readers cannot associate them with their inputs.

**Current (broken):**
```html
<label>File <span style="color:var(--orange);">*</span></label>
<input type="file" id="galleryUploadFile" accept="image/*,video/*">

<label>Caption <span>…</span></label>
<input type="text" id="galleryUploadCaption" placeholder="Tell us about this photo…">
```

**Fix:**
```html
<label for="galleryUploadFile">File <span style="color:var(--orange);">*</span></label>
<input type="file" id="galleryUploadFile" accept="image/*,video/*">

<label for="galleryUploadCaption">Caption <span>…</span></label>
<input type="text" id="galleryUploadCaption" placeholder="Tell us about this photo…">
```

---

### HIGH 2 — Gallery22–37: Alt Text Is Generic Placeholder (WCAG 1.1.1)
**File:** `bayou-family-fishing.html` lines 2879–2894
**Issue:** 16 images have boilerplate alt text like `"Bayou Family Fishing club on the water"` that doesn't describe the actual photo content. This fails WCAG 1.1.1 for screen reader users.

**Fix:** Open each `Photos/Gallery22.jpg` through `Photos/Gallery37.jpg` in a browser, write one specific sentence describing the actual subjects and action, and update the `alt=""` attribute. Also verify each `data-category` tag matches the actual photo content (some may be miscategorized).

Use `design:accessibility-review` skill in CLI session to audit each photo as a batch.

---

### HIGH 3 — Lightbox Alt Text Is Static (WCAG 1.1.1)
**File:** `bayou-family-fishing.html` line ~2934
**Issue:** The lightbox `<img>` element has a hardcoded alt attribute:
```html
<img class="lightbox-img" id="lightboxImg" src="" alt="Bayou Family Fishing &amp; Charity club photo">
```
When a user opens any lightbox image, the alt text is always the same generic string — not the actual photo's alt text.

**Fix:** In the `openLightbox(index)` JS function, dynamically set `lightboxImg.alt` from the source thumbnail's alt text. Something like:
```js
const thumbAlt = document.querySelectorAll('.gallery-thumb img')[index]?.alt || 'Bayou Family Fishing photo';
lightboxImg.alt = thumbAlt;
```

---

### HIGH 4 — Missing Twitter Card Meta Tags (SEO / Social Sharing)
**File:** `bayou-family-fishing.html` lines 8–12
**Issue:** OG tags exist but there are no `twitter:card`, `twitter:title`, `twitter:description`, or `twitter:image` tags. Twitter/X will display a bare link with no preview card when the URL is shared.

**Fix — add after the existing OG tags:**
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Bayou Family Fishing &amp; Charity — Louisiana's Nonprofit Fishing Club">
<meta name="twitter:description" content="We are a nonprofit dedicated to bringing families together through fishing, boat safety, and the preservation of Louisiana's bayou culture.">
<meta name="twitter:image" content="https://bayoucharity.org/Photos/skyline.jpg">
```

---

### HIGH 5 — Missing Canonical URL Tag (SEO)
**File:** `bayou-family-fishing.html` `<head>`
**Issue:** There is no `<link rel="canonical" href="https://bayoucharity.org">` tag. Without it, search engines may index both `http://` and `https://` versions, and may not know which URL is authoritative when Cloudflare serves the single-page app under multiple paths.

**Fix — add to `<head>`:**
```html
<link rel="canonical" href="https://bayoucharity.org">
```

---

### HIGH 6 — Fishing Rodeo Page Not Blocked from `_redirects` Catch-All
**File:** `_redirects`
**Current catch-all:**
```
/*  /404.html  404
```
**Concern:** Cloudflare Pages serves static files before evaluating redirects, so `fishing-rodeo.html` should work correctly. However, this should be verified on production after deployment. If any routing issue appears, add an explicit rule above the catch-all:
```
/fishing-rodeo.html  /fishing-rodeo.html  200
```

**Action:** Test `bayoucharity.org/fishing-rodeo` and `bayoucharity.org/fishing-rodeo.html` immediately after first deploy.

---

## 🟡 MEDIUM PRIORITY — Polish Before Launch If Time Allows

---

### MEDIUM 1 — Nav Font Size Below WCAG Recommendation
**File:** `bayou-family-fishing.html` line 116
**Issue:** `.nav-links a { font-size: 0.78rem; }` computes to ~12.5px. WCAG advisory guidance recommends 16px minimum for body text; 12.5px nav links are hard to read on small screens, especially with the uppercase letter-spacing applied.

**Fix options (pick one):** Bump to `0.85rem` (13.6px) — minimal visual change. Or `0.875rem` (14px) for better comfort. Touch targets (padding) are already fine, so this is purely a legibility improvement.

---

### MEDIUM 2 — `outline: none` on Form Inputs Without Verified Focus Style on All Forms
**File:** `bayou-family-fishing.html` lines 623, 1666, 1850, 1873, 1885
**Issue:** The main form group removes the browser's default focus ring (`outline: none`) and replaces it with a custom amber focus ring — this is correct and accessible ✅. However, there are 4 additional `outline: none` occurrences at lines 1666, 1850, 1873, 1885 that need verification that each one also has a visible custom `:focus` style paired with it.

**Action in CLI:** For each `outline: none` instance outside of `.form-group`, confirm the same element has a `:focus` rule with a visible border or box-shadow replacement.

---

### MEDIUM 3 — `focus-visible` Not Used (Keyboard vs. Mouse Distinction)
**File:** `bayou-family-fishing.html` globally
**Issue:** The site uses `:focus` throughout rather than `:focus-visible`. This means mouse users see focus rings on click (which looks like an error). Modern best practice is `:focus-visible` for keyboard users only.

**Fix:** Low urgency — browsers increasingly handle this with their own heuristics — but for polish, migrate `:focus` styles on buttons/nav to `:focus-visible:` in a future CSS sweep.

---

### MEDIUM 4 — Inline `onclick` Handlers Block Future CSP Tightening
**File:** `bayou-family-fishing.html` (member portal, admin panel)
**Issue:** Admin and comment buttons use `JSON.stringify(String(id))` in inline `onclick` attributes. This is safe (properly escaped) and functional, but requires keeping `'unsafe-inline'` in CSP `script-src` forever — preventing a future tightening to nonce-based CSP.

**Defer until post-Stripe integration.** Migrate to `data-*` attribute + `addEventListener` delegation when ready.

---

## 🔵 ADMIN / OPERATIONAL — Before Going Live

These are dashboard-level tasks, not code changes.

**Formspree note:** Google Workspace does not replace Formspree for a static site — there's no drop-in equivalent. Keep Formspree. What Google Workspace *does* give you is the `@bayoucharity.org` address to receive submissions professionally. A2 below is the only change needed.

| # | Task | Owner | Where |
|---|------|-------|-------|
| A1 | **Lock Formspree endpoint to `bayoucharity.org`** | Kyle | Formspree Dashboard → Settings → Allowed Origins |
| A2 | **Set Formspree notification email** to `kyle.rockefeller@bayoucharity.org` | Kyle | Formspree Dashboard → Notifications → Edit notification → change email |
| A3 | **Set Supabase Site URL** to `https://bayoucharity.org` | Eric | Supabase Dashboard → Auth → URL Configuration → Site URL |
| A4 | **Add production redirect URLs in Supabase** | Eric | Supabase Dashboard → Auth → URL Configuration → Additional Redirect URLs → add `https://bayoucharity.org` and `https://bayoucharity.org/**` |
| A5 | **Add Supabase callback URL to Facebook Login** — paste the Supabase callback URL into Valid OAuth Redirect URIs | Eric | developers.facebook.com → Facebook Login → Settings → Valid OAuth Redirect URIs |
| A5b | ~~Add Eric + Kyle as Facebook test users~~ | ~~Eric~~ | ⛔ Blocked — test user creation throws an error until Meta business verification is complete (Kyle's LLC documents). Deferred to Phase 2. |
| A6 | ~~Connect custom domain in Cloudflare Pages~~ | ~~Eric~~ | ✅ Already done — site is live at `bayoucharity.org` |
| A7 | **Test Google OAuth end-to-end** on live site after overhaul deploys | Eric | `https://bayoucharity.org` → Members tab |
| A8 | ~~Test Facebook OAuth with test users~~ | ~~Eric~~ | ⛔ Blocked — test user creation requires Meta business verification (Kyle's LLC). Deferred to Phase 2. |
| A9 | **Test all 5 Formspree forms** submit and email arrives in Kyle's Google Workspace inbox | Kyle | Live site + Gmail |
| A10 | **Stripe/PayPal integration** | Eric | Per nonprofit discount plan |

---

## ✅ CONFIRMED WORKING — Do Not Re-Fix

These items were audited and are correctly implemented. Do not touch.

| Item | Status | Evidence |
|------|--------|---------|
| XSS / `escapeHTML()` in portal | ✅ | 30+ innerHTML points covered; utility at line ~4636 |
| Supabase JS SRI hash | ✅ | `sha384-XEXe97…` pinned at line 2717 |
| `showSection()` VALID_SECTIONS guard | ✅ | Guard in place at line ~3748 |
| Skip-to-main-content link | ✅ | `.skip-link` at line 2269; `<a href="#home">` at line 2720 |
| iOS `background-attachment: scroll` | ✅ | `@media (max-width: 768px)` block confirmed — DO NOT ADD AGAIN |
| Donate sticky form layout | ✅ | `position: sticky; top: 5rem`; mobile override to `static` |
| `prefers-reduced-motion` | ✅ | Comprehensive at line 2256 — videos hidden, all transitions killed |
| Form `cursor: pointer` | ✅ | All interactive elements have correct cursor |
| `X-Frame-Options: DENY` | ✅ | In both `_headers` and `cfp.toml` |
| `X-Content-Type-Options: nosniff` | ✅ | In both config files |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` confirmed |
| Formspree honeypot `_gotcha` | ✅ | On all Formspree forms |
| Dark mode FOUC prevention | ✅ | Inline script in `<head>` reads `localStorage` before paint |
| Dark mode `localStorage` persistence | ✅ | Toggle persists across sessions |
| Photos 1yr immutable cache | ✅ | `Cache-Control: public, max-age=31536000, immutable` |
| HTML must-revalidate cache | ✅ | `Cache-Control: public, max-age=0, must-revalidate` |
| Main forms have associated labels | ✅ | Club, Volunteer, Donate forms all use `for`/`id` pairs |
| `frame-ancestors: none` in CSP | ✅ | Clickjacking protection in both config files |
| OG tags for social sharing | ✅ | `og:title`, `og:description`, `og:image`, `og:url` all set |
| Schema.org Organization markup | ✅ | JSON-LD in `<head>` |
| `rel="noopener noreferrer"` on external links | ✅ | Confirmed on external `<a target="_blank">` links |
| `aria-label` on icon-only buttons | ✅ | Theme toggle, lightbox, fullscreen buttons all labeled |
| `aria-expanded` on boat accordion | ✅ | Correct ARIA state management |
| Scroll-to-top button 44×44px touch target | ✅ | Exact size at line 2224–2225 |

---

## 📋 CLI Launch Sequence — Three Focused Sessions

The launch work is split across three sessions deliberately. Each one fits cleanly in a single context window and has a single clear exit condition. Do not combine them.

---

### CLI Session A — CRITICAL: Unblock Git + Fix CSP + Commit All Pending Work

**Purpose:** Remove the git lock, patch the production-blocking CSP, and get Sessions 9–12 committed and deployed.
**Exit condition:** Cloudflare Pages dashboard shows a green deploy from `main`. Member portal loads on the production URL.
**Touch only:** `_headers`, `cfp.toml`, git operations. No HTML changes in this session.

**Paste this as your opening prompt:**

> Read CLAUDE.md first. Then do the following in order, using `superpowers:verification-before-completion` before committing:
>
> **1. Remove the stale git lock:**
> `rm .git/index.lock`
>
> **2. Fix the CSP in `_headers` (line 13) — update the single Content-Security-Policy line:**
> - In `script-src`: add `https://cdn.jsdelivr.net` after `https://unpkg.com`
> - In `connect-src`: add `https://*.supabase.co` after `https://formspree.io`
> - In `img-src`: add `https://*.supabase.co` at the end
>
> **3. Make the identical CSP changes in `cfp.toml` (line 33).** Run `diff _headers cfp.toml | grep -A2 -B2 "script-src\|connect-src\|img-src"` to confirm both files match.
>
> **4. Stage all pending work from Sessions 9–12:**
> `git add -A`
> (The -A is intentional here — we want to capture all the Photos/, fishing-rodeo.html, and config files that have been accumulating since the index.lock blocked commits.)
>
> **5. Commit:**
> `git commit -m "feat: Sessions 9-12 — CSP Supabase fix, fishing rodeo, donate sticky, portal hardening, S11 security"`
>
> **6. Push:**
> `git push origin main`
>
> **7. Open the Cloudflare Pages dashboard and confirm the deploy goes green.**
>
> **8. Once deployed, open the production URL in a browser, navigate to the Members tab, and confirm the page does not show a blank white screen or JS console error about supabase being undefined.**
>
> Session A is complete when the Cloudflare deploy is green and the Members tab loads without a JS crash.

---

### CLI Session B — Security Hardening + Accessibility + SEO Meta

**Purpose:** Block sensitive internal docs from public access, fix the three WCAG failures, and add missing SEO tags.
**Exit condition:** All changes committed and pushed. `bayoucharity.org/CLAUDE.md` returns 404. `bayoucharity.org/docs/plans/2026-03-11-pre-deployment-checklist.md` returns 404. Gallery upload labels pass an accessibility scan.
**Touch:** `_redirects`, `_headers`, `.gitignore`, `bayou-family-fishing.html`, `index.html`.

**Paste this as your opening prompt:**

> Read CLAUDE.md first. This session has 6 focused changes to `bayou-family-fishing.html` and the config files. Use `grep -n` to verify line numbers before every edit. Use `superpowers:verification-before-completion` before committing.
>
> **1. Block sensitive internal docs — edit `_redirects`:**
> Add these four lines immediately before the `/*` catch-all at the bottom:
> ```
> /CLAUDE.md            /404.html  404
> /CODEBASE-REVIEW.md   /404.html  404
> /donate-preview.html  /404.html  404
> /docs/*               /404.html  404
> ```
>
> **2. Add X-Robots-Tag blocks to `_headers`:**
> After the existing `/cfp.toml` block, add:
> ```
> /CLAUDE.md
>   X-Robots-Tag: noindex, nofollow
> /CODEBASE-REVIEW.md
>   X-Robots-Tag: noindex, nofollow
> /donate-preview.html
>   X-Robots-Tag: noindex, nofollow
> /docs/*
>   X-Robots-Tag: noindex, nofollow
> ```
>
> **3. Add to `.gitignore`:**
> ```
> donate-preview.html
> ```
> (CLAUDE.md and CODEBASE-REVIEW.md should stay tracked — they're internal docs — just blocked from public serving.)
>
> **4. Fix gallery upload form labels — WCAG 1.3.1 (in `bayou-family-fishing.html`):**
> Find the two `<label>` elements near `id="galleryUploadFile"` and `id="galleryUploadCaption"` and add matching `for=` attributes:
> ```html
> <label for="galleryUploadFile">File …</label>
> <label for="galleryUploadCaption">Caption …</label>
> ```
>
> **5. Fix lightbox alt text — WCAG 1.1.1:**
> In the `openLightbox(index)` JavaScript function, after setting `lightboxImg.src`, also set the alt dynamically from the source thumbnail:
> ```js
> var thumbs = document.querySelectorAll('.gallery-thumb img');
> lightboxImg.alt = (thumbs[index] && thumbs[index].alt) ? thumbs[index].alt : 'Bayou Family Fishing photo';
> ```
>
> **6. Add Twitter card + canonical tags to `<head>` (after the existing OG tags):**
> ```html
> <meta name="twitter:card" content="summary_large_image">
> <meta name="twitter:title" content="Bayou Family Fishing &amp; Charity — Louisiana's Nonprofit Fishing Club">
> <meta name="twitter:description" content="We are a nonprofit dedicated to bringing families together through fishing, boat safety, and the preservation of Louisiana's bayou culture.">
> <meta name="twitter:image" content="https://bayoucharity.org/Photos/skyline.jpg">
> <link rel="canonical" href="https://bayoucharity.org">
> ```
>
> **7. Update Gallery22–37 alt text (WCAG 1.1.1):**
> Eric will provide specific alt text descriptions for Gallery22.jpg–Gallery37.jpg after reviewing them via Claude in Chrome on the live site post-Session-A. When those descriptions are ready, find each `<img src="Photos/Gallery22.jpg"` through `Gallery37.jpg"` in the gallery grid and update their `alt=""` attributes. Also verify each image's `data-category` matches what's actually in the photo.
>
> **8. Sync index.html:**
> `cp bayou-family-fishing.html index.html && diff bayou-family-fishing.html index.html && echo "Files match"`
>
> **9. Commit and push:**
> `git add bayou-family-fishing.html index.html _headers _redirects .gitignore`
> `git commit -m "fix: block internal docs from public access, WCAG label/lightbox/gallery alt text fixes, Twitter card + canonical"`
> `git push origin main`
>
> Session B is complete when the deploy is green, `/CLAUDE.md` returns 404, and `/docs/plans/2026-03-11-pre-deployment-checklist.md` returns 404.

---

### CLI Session C — Live Site Smoke Test After Overhaul

**Purpose:** Verify the overhaul is working correctly on the live site at `bayoucharity.org`. Testing only — no code changes. DNS is already live so every test hits the real site.
**Exit condition:** All items checked. Dashboard tasks confirmed by Kyle and Eric.

**Paste this as your opening prompt:**

> Read CLAUDE.md first. This is a verification-only session — do not edit any files. Open `https://bayoucharity.org` in a browser (hard-refresh with Cmd+Shift+R / Ctrl+Shift+R to clear cache) and work through this checklist. Report pass/fail for each item.
>
> **Security checks:**
> - [ ] `bayoucharity.org/CLAUDE.md` → returns 404 (not the actual file content)
> - [ ] `bayoucharity.org/CODEBASE-REVIEW.md` → returns 404
> - [ ] `bayoucharity.org/donate-preview.html` → returns 404
> - [ ] `bayoucharity.org/cfp.toml` → returns 404
>
> **Member portal / Supabase (this was broken before the overhaul — confirm it now works):**
> - [ ] Navigate to Members tab — no JS console error about `supabase is undefined`
> - [ ] "Sign in with Google" button appears and the OAuth flow completes without a CSP error in the browser console
> - [ ] After Google sign-in, profile shows "pending approval" state (not a blank screen)
>
> **Core sections:**
> - [ ] Home hero video loads and plays
> - [ ] Gallery filters (All / Cookouts / Fishing / Kids Club / Community / Boats) each return correct photos
> - [ ] Lightbox opens on any gallery photo, alt text in console matches the thumbnail (confirms Session B fix)
> - [ ] All 5 boat story cards expand and collapse correctly
> - [ ] INNISFREE Leaflet map loads with all 3 markers
> - [ ] Donate form is sticky as you scroll (form stays pinned, content scrolls behind it)
> - [ ] `bayoucharity.org/fishing-rodeo.html` loads correctly (not a 404)
>
> **Forms (use test data — these will actually submit and email Kyle):**
> - [ ] Join / Club form submits without error
> - [ ] Volunteer form submits without error
> - [ ] Donate form submits without error
>
> **Dark mode + responsive:**
> - [ ] Dark mode toggle switches theme and persists after tab reload
> - [ ] Site is usable at 375px viewport width (no horizontal scroll on any section)
>
> **Dashboard tasks — confirm complete before closing this session:**
> - [ ] Kyle: Formspree → Settings → Allowed Origins → `bayoucharity.org` locked
> - [ ] Kyle: Formspree → Notifications → email updated to `kyle.rockefeller@bayoucharity.org`
> - [ ] Eric: Supabase → Auth → URL Configuration → Site URL = `https://bayoucharity.org`
> - [ ] Eric: Supabase → Additional Redirect URLs includes `https://bayoucharity.org` and `https://bayoucharity.org/**`
> - [ ] Eric: Facebook Login → Settings → Valid OAuth Redirect URIs has Supabase callback URL saved
> - [ ] Note: Facebook end-to-end testing is deferred — test user creation blocked until Kyle completes Meta business verification with LLC documents
>
> Session C is complete when every item above is checked off.

---

## 🏁 Overhaul Deployment Verification Gate

The site is already live. This gate confirms the overhaul is fully healthy before considering the deployment complete.

- [ ] Session A deployed: CSP fix live, Members tab no longer crashes (Supabase JS loads)
- [ ] Session A deployed: All Sessions 9–12 work committed, pushed, and Cloudflare Pages shows green
- [ ] Session B deployed: `bayoucharity.org/CLAUDE.md` returns 404
- [ ] Session B deployed: `bayoucharity.org/CODEBASE-REVIEW.md` returns 404
- [ ] Session B deployed: `bayoucharity.org/donate-preview.html` returns 404
- [ ] Session B deployed: `bayoucharity.org/docs/plans/2026-03-11-pre-deployment-checklist.md` returns 404
- [ ] Eric: Supabase Site URL + redirect URLs updated to `https://bayoucharity.org`
- [ ] Eric: Google OAuth sign-in tested end-to-end on live site
- [ ] Kyle: Formspree domain locked + notification email updated to Google Workspace address
- [ ] Kyle: All 5 forms tested — emails arriving in `kyle.rockefeller@bayoucharity.org`
- [ ] Eric: Facebook Supabase callback URL added to Valid OAuth Redirect URIs
- [ ] Facebook testing + Phase 2 (public) — deferred pending Kyle's LLC business verification with Meta

---

## 🟡 Facebook OAuth — Two-Phase Rollout

**Charity Facebook Page:** https://www.facebook.com/profile.php?id=61586546376080
**Current status:** Facebook Login added via Quick Start. Business verification paused. App is in Development mode.

### Phase 1 — Callback URL (do now, 2 minutes)

The Quick Start flow has made the OAuth Redirect URIs field accessible. Do this now:

1. In **developers.facebook.com** → Left sidebar → **Products** → **Facebook Login** → **Settings**
2. Find **Valid OAuth Redirect URIs** → paste the Supabase callback URL (copied from Supabase Dashboard → Auth → Providers → Facebook) → **Save Changes**

> **Note:** Adding test users to verify the login flow is blocked — Meta throws an error when creating test users before business verification is complete. Facebook OAuth cannot be fully tested until Phase 2.

### Phase 2 — Do When Ready (opens Facebook login to the public)

Business verification requires Kyle's LLC documents. Steps when ready:

1. Go to **business.facebook.com** → Create a Business Portfolio named "Bayou Charity" using Kyle's LLC details
2. Complete Meta business verification using the LLC documents
3. Back in **developers.facebook.com** → App Settings → Basic → link the verified Business Portfolio
4. Work through any remaining Required Actions (all three URL fields already filled ✅)
5. Check **App Icon** — if blank, upload a square crop of `Photos/BFF+Logo.jpg` (1024×1024px recommended)
6. Check **Category** — if blank, select "Social" or "Utilities"
7. Flip app to **Live** mode — Facebook OAuth opens to all users, and test users can finally be added and verified

**Launch gate impact:** Phase 2 is entirely non-blocking. Google OAuth handles all real members at launch. Facebook follows whenever Kyle is ready with the LLC documents.

---

*Produced: 2026-03-11, updated 2026-03-12 | Engineering code review + WCAG accessibility audit + UI/UX Pro Max design system check + Brainstorming skill*
*Hand off to CLI session for implementation. Cowork session = plan only — no site files touched.*
