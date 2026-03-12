# Bayou Family Fishing — Website

> Public-facing site for Bayou Family Fishing & Charity (`bayoucharity.org`)
> Single-file · Vanilla HTML/CSS/JS · No build step · No dependencies

---

## Editing Workflow

1. Open `bayou-family-fishing.html` in any text editor and make changes
2. Copy it to `index.html`:
   ```bash
   cp bayou-family-fishing.html index.html
   ```
3. Commit and push to `main` — Cloudflare Pages auto-deploys

> **Rule:** Never edit `index.html` directly. It is always a copy of `bayou-family-fishing.html`.

---

## Project Files

| File | Description |
|------|-------------|
| `bayou-family-fishing.html` | Source of truth — edit this |
| `index.html` | Cloudflare Pages entry point — always a copy of the above (**both files required**) |
| `fishing-rodeo.html` | Standalone Fishing Rodeo event page — linked from Volunteer tab |
| `404.html` | Branded error page |
| `privacy.html` | Privacy Policy (OAuth, Supabase, member data) |
| `terms.html` | Terms of Service |
| `data-deletion.html` | Data deletion request page (required for Facebook OAuth) |
| `_headers` | Cloudflare Pages security headers |
| `_redirects` | Redirect rules |
| `cfp.toml` | CFP security headers + cache rules |
| `CLAUDE.md` | AI session instructions — read at the start of every work session |
| `Photos/` | All media assets (photos + videos) |

---

## Site Sections

All navigation is tab-based (no page reloads). Each section has a full-bleed skyline photo background with a blue gradient overlay.

| Tab | Section ID | Description |
|-----|-----------|-------------|
| Home | `#home` | Hero (skyline parallax + video), mission strip, quick-link cards, INNISFREE land story teaser |
| Join | `#club` | Membership tiers, application form (Formspree), `BFF club page header video.mp4` background |
| Volunteer | `#volunteer` | 6 opportunity cards; featured event intro with CTA linking to `/fishing-rodeo.html`; general sign-up form |
| Boats | `#boats` | 5 real boats with photos and expandable stories; Check Twice has video background |
| INNISFREE | `#innisfree` | Louisiana marshland story, 4-phase build plan, live satellite map with 3 location markers |
| Gallery | `#gallery` | 39 static photos + 2 inline videos (filter tabs: All/Cookouts/Fishing/Kids Club/Community/Boats); dynamic event tabs from Supabase `gallery_events`; member photo upload per event |
| Donate | `#donate` | Donation form (Formspree); Mom & Pops businesses; fishing guides; impact tiers |
| About | `#about` | Founder bio, board photos, contact card, partner/press cards, team grid |
| Members | `#members` | Private portal — Google/Facebook sign-in, satellite fishing map, community feed, admin panel |

---

## Design System

### Fonts

| Font | Use |
|------|-----|
| `Lora` | Base serif — body text, headings default |
| `Playfair Display` | Section titles, boat names, display |
| `Caveat` | Handwritten accents, taglines |

> Note: `Inter` is **not** used in this project. `Lora` is the body font.

### Color Tokens

| Variable | Hex | Use |
|----------|-----|-----|
| `--green-deep` | `#0d2b3e` | Nav, darkest bg, overlays |
| `--green-water` | `#1a4a6b` | Mid blue-green |
| `--amber` | `#e8923a` | Links, accents, CTAs |
| `--gold` | `#c9a84c` | Section eyebrows, headings on dark |
| `--cream` | `#eef6fb` | Light section backgrounds |
| `--white` | `#ffffff` | Base white |
| `--text-dark` | `#0d1f2d` | Body text (light bg) |
| `--text-mid` | `#4a6070` | Secondary text (light bg) |

Dark mode uses `[data-theme="dark"]` on `<html>`. All skyline-background sections use `filter: brightness(0.82)` in dark mode (not a background override). Toggle persists in `localStorage`.

### Section Backgrounds

Each section uses a layered CSS background — a directional blue gradient (`rgba(13,43,62,…)`) over a skyline photo:

| Section | Photo |
|---------|-------|
| Home | `skyline.jpg` |
| Join | `Skyline astetic 1.jpg` |
| Volunteer | `Skyline astetic 1.jpg` |
| Boats | `Skyline golden 2.jpg` |
| INNISFREE | `header image for INNISFREE tab.jpg` |
| Gallery | `Skyline astetic 1.jpg` |
| Donate | `Skyline Marsh golden hue.jpg` |
| About | `Skyline Marsh golden hue.jpg` |
| Members | `skyline.jpg` |

---

## Media Assets

### Photos (key files)

| File | Used In |
|------|---------|
| `BFF+Logo.jpg` | Nav logo, favicon, 404 page, preloader |
| `BFF-Logo-1024.jpg` | OG tags, social sharing |
| `skyline.jpg` | Hero bg, Home section bg, Members section bg |
| `Skyline astetic 1.jpg` | Join / Volunteer / Gallery section bg |
| `Skyline golden 2.jpg` | Boats section bg |
| `Skyline Marsh golden hue.jpg` | Donate / About section bg |
| `Skyline golden hue .jpg` | Gallery (photo + lightbox) |
| `header image for INNISFREE tab.jpg` | INNISFREE section bg (photo of person on dock) |
| `who we are.jpg` | About section — group photo |
| `Kyle Rockefeller, President and Secretary.jpg` | About — team card |
| `Doug Rockefeller, Big Papa.jpg` | About — team card |
| `Max Juge, Vice President.jpg` | About — team card |
| `Ashley Toshimitsu Oiterong, Treasurer.jpg` | About — team card |
| `Uncle Johns Campagna Skiff (boat).jpg` | Boats — card 01 |
| `The Ms Carrol (boat).jpg` | Boats — card 02 (display text: "Ms. Carol") |
| `Ms Carol pic 2 (boat).jpg` | Boats — Ms. Carol expanded story, 2nd photo |
| `Last Chance (boat).jpg` | Boats — card 03 |
| `The Check Twice (boat).jpg` | Boats — card 04 |
| `Check twice Kyle (president Posing) (boat).jpg` | Boats — Check Twice expanded story |
| `Bait By You Hook it or Cook it (boat).jpg` | Boats — card 05 |
| `Uncle Johns Campagna Skiff First Crabbing Trip (boat).jpg` | Boats — Campagna Skiff expanded story |
| `Gallery1.jpg – Gallery37.jpg` | Gallery — 37 photos |

### Videos

| File | Used In |
|------|---------|
| `BFF club page header video.mp4` | Join/Club section — hero background |
| `bff video 2.mp4` | Boats section — full-section background |
| `check twice video (boat).mp4` | Boats — Check Twice card background |
| `club member casting video (gallery).mp4` | Gallery — inline video thumbnail |
| `fishing knots class video (gallery).mp4` | Gallery — inline video thumbnail |

> **Note:** `Skyline golden hue .jpg` has a trailing space before the extension — this is intentional. The filename and all `src` references match.

---

## Features

### Navigation
- Tab-based routing with `showSection()` — instant scroll-to-top, cross-fade transitions
- `VALID_SECTIONS` array guards against invalid routes
- Mobile nav closes on outside click or Escape
- All footer links navigate to correct sections

### Forms (Formspree)
- Member application (`#club`)
- Volunteer signup (`#volunteer`)
- Donation form (`#donate`)
- Fishing Rodeo RSVP — `localStorage` persistence, live family counter
- Honeypot `_gotcha` spam protection on all forms

### Fishing Rodeo Spotlight
- Live countdown to April 25, 2026 at sunrise
- Location with Google Maps link
- RSVP counter (no cap)
- Pack Your Tackle checklist
- Payment handles: CashApp `$bayoucharity`, Apple Cash `kyle.rockefeller@icloud.com`

### Gallery
- 39 photo thumbnails + 2 inline video thumbnails
- Filter buttons: All · Cookouts · Fishing · Kids Club · Community · Boats
- Lightbox: arrow key nav, Escape to close, dynamic `1/N` counter
- Video fullscreen: `requestFullscreen()` + iOS `webkitEnterFullscreen()` fallback
- `filterGallery()` handles both `.gallery-thumb` and `.gallery-video-thumb`

### INNISFREE Map
- Leaflet.js with Esri World Imagery satellite tiles (no API key)
- Markers: Home Base (`29.5955, -89.9067`), Duck Lease (`29.5766, -89.9351`), INNISFREE Property (`29.5534, -89.9539`)

### Member Portal
- **Auth:** Google + Facebook OAuth via Supabase
- **Approval flow:** pending → Kyle approves in admin panel → member gets access
- **Satellite map:** Esri tiles; members drop fishing pins with photo upload
- **Pin form:** photo (≤5MB), species, caption, optional location name
- **Community feed:** newest pins first; inline comment threads per pin
- **Admin panel:** approve/reject pending accounts; remove pins; `role = admin` only
- **Backend:** Supabase — `profiles`, `pins`, `comments`, `gallery_events`, `gallery_submissions` tables with RLS; buckets: `pin-photos`, `gallery-pending`, `gallery-public`
- **Roles:** `member` | `guide` | `admin`
- **Security:** `escapeHTML()` applied at all 18 innerHTML concat points — XSS protection in place

### Dark Mode
- Toggle in nav (moon/sun icon), persists in `localStorage`
- All skyline sections: `filter: brightness(0.82)` in dark mode
- Cards/forms have individual dark overrides
- System preference respected on first visit

### Performance
- All skyline photos compressed to 1920px max width, 82% quality
- Images use `loading="lazy"` (off-screen)
- Google Fonts with `preconnect` + `display=swap`
- `prefers-reduced-motion` respected throughout
- Scroll-triggered entrance animations via IntersectionObserver

### Visual Polish
- Scroll-to-top button (appears after 300px)
- Footer year auto-updates
- Ripple click effect on all buttons
- Card 3D tilt on hover (quick-link cards)
- Form button states: idle → Sending… → Sent! / Error
- Staggered card entrance animations (100ms offset per card)

---

## Still To Do

| Item | Priority | Notes |
|------|----------|-------|
| **Gallery22–37 alt text + categories** | High | Need visual review — currently placeholder values |
| **Commit Session 11 fixes** | High | Stale `.git/index.lock` — user must delete it and run provided git commands |
| **Formspree recipient email** | Medium | Dashboard → Notifications → `kyle.rockefeller@bayoucharity.org` |
| **Lock Formspree to domain** | Medium | Dashboard → Settings → Allowed Origins → `bayoucharity.org` |
| **Stripe / PayPal integration** | Medium | Eric handling — nonprofit discount via Stripe |
| **Inline onclick → event delegation** | Medium | Admin/comment buttons in portal; needed before adding CSP headers |
| **Gallery Phase 2** | Future | Admin approval UI for `gallery_submissions` in portal |
| **Member portal Phase 2** | Future | Trip calendar, guide postings, fishing heatmap |
| **DNS: Squarespace → Cloudflare Pages** | Low | Confirm `bayoucharity.org` is pointed correctly |
| **IntersectionObserver for videos** | Low | 6 autoplay videos — add pause-when-offscreen if performance degrades |
| **Upgrade favicon to .ico** | Low | Better cross-browser support |
| **Social media links** | Low | Footer/About when Facebook or Instagram ready |

### ✅ Completed (Sessions 1–11)
- iOS `background-attachment: fixed` → scroll fallback added
- XSS / `escapeHTML()` — 18 usages covering all portal innerHTML points
- Supabase JS pinned to v2.99.0 with SRI hash
- `showSection()` VALID_SECTIONS guard added
- Skip-to-main-content link added (WCAG 2.4.1)

---

## Hosting & Infrastructure

| | |
|--|--|
| **Domain** | `bayoucharity.org` (Squarespace, paid through Jan 2029) |
| **Host** | Cloudflare Pages (free) — auto-deploys on push to `main` |
| **Security headers** | `_headers` · `cfp.toml` |
| **Redirects** | `_redirects` |
| **Legal pages** | `/privacy.html` · `/terms.html` · `/data-deletion.html` |

---

## Key People

| Name | Role |
|------|------|
| Kyle Rockefeller | President & Secretary |
| Doug "Big Papa" Rockefeller | Co-founder |
| Max Juge | Vice President |
| Ashley Toshimitsu Oiterong | Treasurer |
| Eric Gray | Site owner (`ericgray928@live.com`) |

---

*Last updated: March 11, 2026 — Sessions 1–11*
