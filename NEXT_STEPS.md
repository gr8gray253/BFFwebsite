# Bayou Family Fishing — Next Steps Roadmap

## ✅ Fixes Already Applied (Session 1)
1. **Form accessibility** — Added `for`/`id` pairs to every label/input across all three forms (Club, Volunteer, Donate).
2. **Calendar date bug** — Fixed hardcoded `April 2025`. Calendar now initializes to the current month/year automatically.
3. **Image lazy loading** — Added `loading="lazy"` to all 9 off-screen images (5 boat photos + 4 team photos).

---

## ✅ Completed (Session 2 — March 2026)

### Priority 1 — Forms
- ✅ **Formspree connected** — All three forms (Member, Volunteer, Donate) and the RSVP form POST to Formspree.
- ✅ **RSVP counter persistence** — Persists via `localStorage`. Shows live "X families registered" count. Increments on successful submission.
- ⏳ **Real payment processing** — Stripe Checkout / PayPal to be added by Eric.

### Priority 2 — Missing Content
- ✅ **Photo gallery section** — Full Gallery page with all 21 photos and lightbox (keyboard navigation, Escape to close).
- ✅ **"Who We Are" photo** — Added to About section above team grid.
- ✅ **Google Maps for INNISFREE** — Replaced with a live Leaflet.js multi-marker map (see Session 3 below).
- ⏳ **Membership pricing** — CSS written; needs HTML + real prices when decided.

### Priority 3 — SEO
- ✅ Meta description, Open Graph tags, updated page title, JSON-LD structured data — all added.

### Priority 4 — UX Polish
- ✅ Emoji icons replaced with inline SVGs on quick-links + opportunity cards.
- ✅ Mobile nav closes on outside click and Escape key.
- ✅ Scroll-to-top button (bottom-left, appears after 300px scroll).
- ✅ Footer year auto-updates via `new Date().getFullYear()`.
- ✅ `prefers-reduced-motion` media query added.

### Priority 5 — Infrastructure
- ✅ Favicon added (BFF logo). Upgrade to .ico before launch for best support.
- ✅ Honeypot `_gotcha` spam protection on all 4 forms.
- ✅ Deployed to Cloudflare Pages — connected to Git repo (auto-deploys on push to main).
- ⏳ DNS → Cloudflare Pages — Eric handling.
- ⏳ Member paywall — Optional / skipped.

---

## ✅ Completed (Session 3 — March 2026)

### INNISFREE Map
- ✅ **Leaflet.js multi-marker map** — Replaced placeholder Google Maps iframe with a real interactive map showing all three locations:
  - 🏠 **Home Base** — `29.595492887216214, -89.90665602961556` (Rodeo meeting point)
  - 🦆 **Duck Lease** — `29.576607472348563, -89.93509250792445`
  - 🌿 **INNISFREE Property** — `29.553418886646913, -89.95388981861294`
  - Map initializes lazily when the INNISFREE section is first opened (avoids hidden-container sizing issues).

### RSVP Updates
- ✅ **Removed capacity maximum** — No more "X of 200 spots filled" bar. Counter now just shows total families registered.
- ✅ **Location set** — Rodeo location updated from "TBD" to **"Meet at Home Base"** with a direct Google Maps link to the coordinates.
- ✅ **Fishing license notice** — Added amber notice to RSVP panel: *"All attendees are responsible for purchasing their own valid Louisiana fishing license before the event."*

### Video Backgrounds
- ✅ **Home** — Hero video removed; `skyline.jpg` is now the clean static background (already the CSS background image).
- ✅ **Boats page** — `bff video 2.mp4` plays as a subtle full-section background (12% opacity) behind all boat content.
- ✅ **Club / Join page** — `BFF club page header video.mp4` plays as a subtle full-section background behind the membership content.
- ✅ **Remaining video** — `bff video 2.mp4` removed from home hero (was added in Session 2, now reassigned to Boats).

### Boats Page
- ✅ **Full story scaffolding** — Each of the 5 boats now has an expandable "Full Story" section below the summary paragraph. Click the amber button to expand; arrow rotates as indicator. Each section contains a clearly marked placeholder comment (`<!-- WRITE-UP: [Boat Name] — add full story here -->`). Supports headings (`<h4>`) and paragraphs (`<p>`) inside the body.

---

## ✅ Completed (Session 4 — March 2026)

### Gear Toggle Bug Fix
- ✅ **Gear status buttons** — Family RSVP "Own Gear" / "Loaner Gear" toggle buttons were non-responsive. Fixed by removing inline `onclick` attributes and wiring via `addEventListener` instead, which resolves binding issues caused by adjacent external script tags.

### Boat Stories — All Five Filled In
- ✅ **Uncle John's Campagna Skiff** — "A Nod to Gulf Coast Boatbuilding Tradition" (Lafitte skiff heritage, Campagna builders, first-year bayou adventures)
- ✅ **The Ms. Carrol** — "Still Running, Still Fishing" (Gaudet family shrimping legacy, Port Sulphur, BFF partnership vision)
- ✅ **The Last Chance** — "A Morgan City Homemade Crawfish Skiff" (Leland's self-built aluminum boat, Mercury two-stroke refresh, father-son project)
- ✅ **The Check Twice** — "A Louisiana Legend: VIP Baystealth" (VIP Boats history, 2004 Bay Stealth hull, Suzuki 200hp repower, Minn Kota Terrova + Talons)
- ✅ **Bait-By-You** — "Classic Inshore Trawler" (Sam Ronquille's 35-ft fiberglass trawler, Wilkinson Bayou, live shrimp off the deck)

---

## ✅ Completed (Session 5 — March 2026, UI Polish)

- ✅ **Google Fonts preconnect** — Added `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` before the Fonts stylesheet. Reduces font render delay.
- ✅ **Gallery alt text** — All 21 gallery images now have accurate, descriptive alt text written from visual inspection of each photo (cooking, knot tying, club gatherings, dock scenes, Kids Fishing Club sessions).
- ✅ **Campagna Skiff crabbing trip photo** — `Uncle Johns Campagna Skiff First Crabbing Trip (boat).jpg` added to the Campagna Skiff boat story expand, displayed full-width below the section heading.
- ✅ **Branded 404 page** — `404.html` created matching the site's design tokens (dark green background, amber typography, Playfair/Caveat/Lora fonts, BFF logo). Includes "Lost on the bayou?" tagline, navigation buttons back to Home / Gallery / Rodeo, and the contact email.
- ✅ **Payment handles confirmed** — `$bayoucharity` (CashApp), `@bayoucharity` (Venmo/PayPal), `kyle.rockefeller@icloud.com` (Apple Cash) verified as correct and already live in the file.

---

## ✅ Completed (Session 6 — March 2026, Visual & Functional Overhaul)

### Scroll-Triggered Animations
- ✅ **Intersection Observer API** — Every major content block now fades/slides in on scroll using `data-scroll` attributes. Cards stagger with CSS `transition-delay`. Zero library dependencies — pure native API.
- ✅ **Staggered card animations** — Quick-links, opportunity cards, team cards, and boat stories animate in sequence (100ms offset per card) as they enter the viewport.

### Section Page Transitions
- ✅ **CSS fade transitions** — Sections now cross-fade when switching tabs instead of instant show/hide. Uses `opacity` + `transform` for GPU-accelerated 60fps transitions. `display:none` delayed via JS so the exit animation completes first.

### Animated Number Counters
- ✅ **Hero stats counter** — "5 Boats", "100% Community Built" numbers now count up from zero using `requestAnimationFrame` when the hero section enters the viewport. Triggers once per page load.
- ✅ **Donation impact numbers** — $25, $50, $100, $250, $500 amounts animate in the Donate section on scroll.

### Fishing Rodeo Countdown Timer
- ✅ **Live countdown** — Days / Hours / Minutes / Seconds countdown to April 25, 2026 sunrise (6:15 AM CDT). Displays in the Rodeo Spotlight section. Automatically switches to "Rodeo Day!" message when the timer hits zero.
- ✅ **Styled to match design system** — Dark green background, gold numbers, Playfair Display font, responsive grid layout.

### Parallax Hero
- ✅ **CSS scroll-driven parallax** — Hero background image shifts at 0.4x scroll speed for depth effect. Falls back gracefully on older browsers. Disabled when `prefers-reduced-motion` is active.

### Gallery Enhancements
- ✅ **Category filter tabs** — Gallery now has filter buttons: All, Cookouts, Fishing, Kids Club, Community. Photos tagged with `data-category` attributes. Smooth fade transition on filter change.
- ✅ **Masonry-style grid** — Photos use `grid-auto-rows` with `span 2` on featured images for visual variety.
- ✅ **Blur-up lazy loading** — Gallery thumbnails show a CSS blur placeholder that sharpens when the full image loads. Creates a polished progressive loading effect.

### Micro-Interactions & Button Effects
- ✅ **Ripple click effect** — All `.btn` elements now show a radial ripple animation on click (CSS `::after` pseudo-element + JS coordinate tracking). Subtle, fast (400ms), amber tinted.
- ✅ **Form submit button states** — Buttons show "Sending…" spinner on submit, green "Sent!" confirmation on success, and red "Error" flash on failure. Each state has a matching icon.
- ✅ **Card tilt on hover** — Quick-link cards apply a subtle 3D perspective tilt toward the cursor using `mousemove` + CSS `transform: perspective(600px) rotateX() rotateY()`.

### Page Preloader
- ✅ **BFF-branded loading screen** — A dark green overlay with the BFF logo pulse animation and "Loading the bayou…" text appears on initial page load. Fades out after `window.load` fires.

### Glassmorphism Accents
- ✅ **RSVP panel glass effect** — The RSVP form panel in the Rodeo Spotlight now uses `backdrop-filter: blur(12px)` for a frosted-glass look against the dark background.
- ✅ **Nav bar glass enhancement** — Navigation bar uses enhanced backdrop blur (16px) with a more transparent background for a premium floating feel.

### Dark Mode
- ✅ **Full dark mode toggle** — Moon/sun icon button in the nav bar. Toggles a `[data-theme="dark"]` attribute on `<html>`. All CSS variables swap to dark equivalents. Preference persists in `localStorage` and respects `prefers-color-scheme` system setting on first visit.
- ✅ **Dark mode color palette** — Deep charcoal backgrounds (`#0f1a14`, `#1a2d22`), muted cream text, amber accents preserved, gold highlights boosted for contrast. All images retain full color.

### Performance Optimizations
- ✅ **Critical CSS inlined** — Nav, hero, and above-fold styles load instantly. Remaining CSS deferred.
- ✅ **Font display: swap** — Google Fonts now use `&display=swap` to prevent invisible text during load.
- ✅ **Image srcset hints** — Hero and team photos include `sizes` attribute for responsive image selection.

---

## 🔲 Still To Do

| Task | Priority | Notes |
|------|----------|-------|
| **Membership pricing tiers** | Medium | CSS grid already written. Add HTML cards with real tier names and prices. |
| **Stripe Checkout / PayPal** | Medium | Eric handling. Nonprofit discount via Stripe. |
| ~~Deploy to Cloudflare Pages~~ | ~~High~~ | ✅ Done — connected to Git repo, auto-deploys on push to `main` |
| **Point DNS to Cloudflare Pages** | High — before launch | In Squarespace DNS, point to Cloudflare Pages domain. Domain paid through Jan 2029. |
| **Upgrade favicon to .ico** | Low | Better cross-browser support. |
| **Social media links** | Low | Add to footer/About when BFF Facebook or Instagram is ready. |
| **Print styles** | Optional | `@media print` for clean event info printouts. |
| **Member paywall** | Optional | MemberStack or Outseta if member-only content ever needed. |
| **Shop section merch store** | Optional | Add if BFF wants to sell branded gear (stickers, hats, shirts). |

---

## 🔐 Security Improvements

| Issue | Severity | Status |
|-------|----------|--------|
| **Security headers** | High | ✅ `netlify.toml` + `_headers` created — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, full CSP (works on Cloudflare Pages via `_headers`) |
| **Leaflet CDN — SRI hashes** | Medium | ✅ Switched from cdnjs → unpkg with official `integrity=` + `crossorigin=` attributes from leafletjs.com |
| **`og:image` absolute URL** | Medium | ✅ Fixed to `https://bayoucharity.org/Photos/skyline.jpg` |
| **`og:url` meta tag** | Low | ✅ Already present from Session 3 |
| **Lock Formspree to domain** | Low | ⬜ Manual step — Formspree dashboard → Settings → Allowed Origins → add `bayoucharity.org` |

---

## 🚀 Deployment Checklist

### Pre-deploy (✅ Done)
- [x] `index.html` is in the site root (Cloudflare Pages entry point) ✅
- [x] `404.html` is in the site root ✅
- [x] `_headers` file in root (security headers for Cloudflare Pages) ✅
- [x] `_redirects` file in root ✅
- [x] `netlify.toml` in root (kept for reference / fallback) ✅
- [x] All security fixes applied ✅
- [x] Deployed to Cloudflare Pages — connected to Git repo, auto-deploys on push to `main` ✅

### In Cloudflare Pages (after deploy)
- [ ] Go to **Custom Domains** → add `bayoucharity.org`
- [ ] Enable **HTTPS** (automatic with Cloudflare)

### In Squarespace DNS (after domain is connected to Cloudflare Pages)
- [ ] Remove any existing A records / CNAME for `bayoucharity.org`
- [ ] Add Cloudflare Pages DNS records per their dashboard instructions

### In Formspree (after site is live on bayoucharity.org)
- [ ] Go to Formspree dashboard → your form → Settings → **Allowed Origins**
- [ ] Add `https://bayoucharity.org` to lock the form endpoint to your domain only

---

## 🎨 Session 6 — Visual Enhancement Details

### Scroll Animation System
Every content block uses `data-scroll` attributes to trigger entrance animations:
- `data-scroll="fade-up"` — fade in + slide up 30px
- `data-scroll="fade-left"` — fade in + slide from left
- `data-scroll="fade-right"` — fade in + slide from right
- `data-scroll="scale-in"` — fade in + scale from 0.9 to 1.0
- `data-scroll="stagger"` — parent container, children animate with 100ms stagger delay

Intersection Observer triggers at 10% visibility with a -50px root margin for earlier activation. Each element animates once and is then unobserved for performance.

### Section Transition System
When `showSection(id)` is called:
1. Current section gets class `section-exit` (opacity 1→0, translateY 0→-10px, 250ms)
2. After 250ms, old section gets `display:none`, new section gets `display:block`
3. New section gets class `section-enter` (opacity 0→1, translateY 10px→0, 350ms)
4. Uses `requestAnimationFrame` to ensure paint before animation class is added

### Dark Mode Color Variables
```
Light Mode                  Dark Mode
--green-deep: #1a3a2a  →   --green-deep: #0f1a14
--cream: #f7edd8       →   --cream: #1a2d22
--white: #fdf8f0       →   --white: #0f1a14
--text-dark: #1e2a1e   →   --text-dark: #d4c8b0
--text-mid: #3d4f3a    →   --text-mid: #9aab8f
--cream-dark: #ede0c8  →   --cream-dark: #243828
```
Amber and gold accents stay consistent across both modes for brand recognition.

### Countdown Timer Format
```
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  47  │  │  08  │  │  23  │  │  41  │
│ Days │  │ Hrs  │  │ Min  │  │ Sec  │
└──────┘  └──────┘  └──────┘  └──────┘
```
Updates every second. Tabular-nums font variant for stable digit width. Countdown target: `2026-04-25T06:15:00-05:00` (Central Daylight Time).

---

*Last updated: March 9, 2026 — Session 6: Visual & Functional Overhaul*

---

## ✅ Completed (Session 7 — March 9, 2026, Deployment Prep)

- ✅ **`index.html` created** — Copied `bayou-family-fishing.html` → `index.html` so Cloudflare Pages serves the site at the root URL. Both files are identical; `index.html` is the live entry point.
- ✅ **Deployed to Cloudflare Pages** — Git repo connected; site auto-deploys on every push to `main`.
- ✅ **`.gitignore` added** — Excludes `.claude/` workspace settings from version control.
- ✅ **README.md rewritten** — Now reflects full deployed state: all media placed, all sections documented, all features listed through Session 6.
- ✅ **NEXT_STEPS.md** — Updated to match deployed state.
- ✅ **Git branch fixed** — Renamed `master` → `main`, force-pushed to align remote with correct branch name.
