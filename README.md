# Bayou Family Fishing — Website Project

> Nonprofit website for Bayou Family Fishing & Charity
> Built with HTML, CSS, and vanilla JavaScript — single file, no dependencies.

---

## Project Files

| File | Description |
|------|-------------|
| `index.html` | Full website — Cloudflare Pages entry point (all pages, styles, and logic in one file) |
| `bayou-family-fishing.html` | Working copy — edit this, then copy to `index.html` before deploying |
| `Photos/` | All media assets (photos, videos) |
| `docs/plans/` | Session design docs and implementation plans |
| `404.html` | Branded 404 page matching site design |
| `privacy.html` | Privacy Policy — covers member portal, OAuth data, Supabase storage |
| `terms.html` | Terms of Service — member accounts, user content, events, liability |
| `data-deletion.html` | Data Deletion Request page — required for Facebook/Google OAuth compliance |
| `netlify.toml` | Security headers reference (CSP, X-Frame-Options, etc.) |
| `_headers` | Cloudflare Pages security headers |
| `_redirects` | Redirect rules |
| `README.md` | This file — reflects deployed state |
| `NEXT_STEPS.md` | Freeform session log — read this to catch up on what was built each session and what's still pending |

> **Workflow note:** `NEXT_STEPS.md` is the living session log. Read it at the start of any new work session to understand where things stand. Updates are appended per session.

---

## Site Structure

| Tab | Section ID | Description |
|-----|-----------|-------------|
| Home | `#home` | Hero (skyline photo + parallax), mission statement, quick-link cards with 3D tilt |
| Join | `#club` | Membership tiers, application form, `BFF club page header video.mp4` as section background |
| Volunteer | `#volunteer` | **Fishing Rodeo spotlight (April 25, 2026)** — countdown timer, RSVP form, LDWF license link |
| Boats | `#boats` | 5 real boats with photos + full written stories, `bff video 2.mp4` as section background |
| Gallery | `#gallery` | 21 photos with category filters (All / Cookouts / Fishing / Kids Club / Community), lightbox, masonry grid |
| INNISFREE | `#innisfree` | Land story, build phases, live Leaflet.js satellite map (Esri World Imagery, 3 markers) |
| Donate | `#donate` | Donation form (Formspree), Mom & Pops businesses, fishing guides, updated impact amounts |
| About | `#about` | "Who We Are" group photo, team bios + photos, contact info, partner/press cards |
| Members | `#members` | Private member portal — Google/Facebook sign-in, pending approval flow, satellite map with fishing pins, community feed, admin panel |

---

## Media Assets

| File | Used In |
|------|---------|
| `BFF+Logo.jpg` | Nav logo, favicon, 404 page, page preloader |
| `BFF-Logo-1024.jpg` | High-resolution logo (1024px) — for OG tags, social sharing, future use |
| `skyline.jpg` | Hero background (parallax) |
| `who we are.jpg` | About section — group photo above team grid |
| `Kyle Rockefeller, President and Secretary.jpg` | About — team card |
| `Doug Rockefeller, Big Papa.jpg` | About — team card |
| `Max Juge, Vice President.jpg` | About — team card |
| `Ashley Toshimitsu Oiterong, Treasurer.jpg` | About — team card |
| `Gallery5.jpg` | About — large founder photo |
| `Uncle Johns Campagna Skiff (boat).jpg` | Boats section |
| `The Ms Carrol (boat).jpg` | Boats section |
| `Last Chance (boat).jpg` | Boats section |
| `The Check Twice (boat).jpg` | Boats section |
| `Bait By You Hook it or Cook it (boat).jpg` | Boats section |
| `Uncle Johns Campagna Skiff First Crabbing Trip (boat).jpg` | Boats — Campagna Skiff full story expand |
| `Gallery1–21.jpg` | Gallery section — all 21 placed with descriptive alt text and category tags |
| `BFF club page header video.mp4` | Club/Join section — video background (30% opacity) |
| `bff video 2.mp4` | Boats section — video background (30% opacity) |

---

## Design System

| Font | Use |
|------|-----|
| `Playfair Display` | Headings, titles |
| `Caveat` | Handwritten accents, taglines |
| `Lora` | Body copy, navigation |

| Variable | Hex | Use |
|----------|-----|-----|
| `--green-deep` | `#0d2b3e` | Nav, primary dark (deep water / midnight gulf) |
| `--green-mid` | `#1a4a6b` | Hover states (open water blue) |
| `--green-water` | `#2980b9` | Available dates, success (midday bayou) |
| `--amber` | `#e8923a` | Primary CTA (golden hour sun) |
| `--gold` | `#f0c040` | Logo accents, impact numbers (horizon glow) |
| `--cream` | `#eef6fb` | Section backgrounds (sky haze / morning mist) |
| `--cream-dark` | `#d0e8f5` | Borders, card backgrounds (light water reflection) |
| `--white` | `#f5fbff` | Page background (open sky) |
| `--text-dark` | `#0d1f2d` | Primary body text |
| `--text-mid` | `#2c5364` | Secondary body text |

Dark mode swaps these variables via `[data-theme="dark"]` — toggle persists in `localStorage`.

---

## What's Built & Live

### Core Site
- Real BFF logo, favicon, and page preloader (BFF-branded loading screen)
- Hero — real bayou skyline photo with CSS parallax (0.4x scroll speed)
- Mission statement (full community-focused copy — military, first responders, educators, caregivers)
- Full dark mode toggle (moon/sun in nav) — respects system preference on first visit
- Water / sky / golden hour color palette throughout
- Scroll-to-top button (appears after 300px)
- Footer year auto-updates
- Branded 404 page matching site design tokens

### Navigation & Transitions
- Tab navigation — instant scroll to top, sections cross-fade on switch
- Mobile nav closes on outside click or Escape key

### Forms (all connected to Formspree)
- Member application form (`#club`)
- Volunteer signup form (`#volunteer`)
- Fishing Rodeo RSVP form with `localStorage` persistence — counter shows live family count
- Donation form (`#donate`)
- Honeypot spam protection (`_gotcha`) on all 4 forms

### Fishing Rodeo Spotlight (`#volunteer`)
- Live countdown timer to April 25, 2026 at 6:15 AM CDT
- Location: "Meet at Home Base" with Google Maps link to coordinates
- Fishing license notice for all attendees
- RSVP counter (no cap — shows total families registered)
- Pack Your Tackle interactive checklist
- Payment handles: `$bayoucharity` (CashApp), `@bayoucharity` (Venmo/PayPal), `kyle.rockefeller@icloud.com` (Apple Cash)

### Boats (`#boats`)
- 5 real boats with photos and full written stories (expandable per boat)
- `bff video 2.mp4` plays as subtle background behind all boat content
- Campagna Skiff crabbing trip photo in expanded story

### Gallery (`#gallery`)
- 21 photos with accurate descriptive alt text
- Category filter tabs: All, Cookouts, Fishing, Kids Club, Community
- Masonry-style grid with blur-up lazy loading
- Lightbox with keyboard navigation (arrow keys + Escape)

### INNISFREE (`#innisfree`)
- Live Leaflet.js interactive map — **Esri World Imagery satellite tiles** (no API key required)
  - Home Base: `29.5955, -89.9067`
  - Duck Lease: `29.5766, -89.9351`
  - INNISFREE Property: `29.5534, -89.9539`

### Visual Polish
- Scroll-triggered entrance animations (fade-up, fade-left, fade-right, scale-in) via Intersection Observer
- Staggered card animations (100ms offset per card)
- Ripple click effect on all buttons
- Card 3D tilt on hover (quick-link cards)
- RSVP panel glassmorphism (`backdrop-filter: blur`)
- Form submit button states: Sending… / Sent! / Error

### Member Portal (`#members`)
- **Authentication:** Google + Facebook OAuth via Supabase Auth
- **Approval flow:** New signups start as `pending` → Kyle approves via admin panel → user gets access
- **Pending screen:** "Your account is awaiting approval. We'll email you when you're in."
- **Satellite member map:** Esri World Imagery tiles; members drop fishing pins by uploading a photo (GPS auto-read or manual drag)
- **Pin post form:** Photo (up to 5MB), species caught, caption, optional location name
- **Community feed:** Newest pins first; card with photo, member name, date, species, caption; inline comment thread
- **Admin panel:** Approve/reject pending accounts; remove flagged pins; tab visible only to `role = admin`
- **Backend:** Supabase — `profiles`, `pins`, `comments` tables with Row-Level Security; `pin-photos` storage bucket
- **Roles:** `member` | `guide` | `admin` — set in `profiles.role` column

### Legal & Compliance Pages
- Privacy Policy (`/privacy.html`) — data collection, Supabase storage, Google/Facebook OAuth
- Terms of Service (`/terms.html`) — membership, user content, events, liability, Louisiana governing law
- Data Deletion Request (`/data-deletion.html`) — required for Facebook/Google OAuth app approval; 30-day deletion SLA via email

### Donation Page (`#donate`)
- Updated copy: funds fishing programs for military and community service families + Innisfree offshore hub
- **Mom & Pops businesses:** Operation Healing Waters / Reel O-Fishal Charters, Sam's Bait by You, Slow Down Park
- **Fishing guides:** Reel O-Fishal, Down South Fishing Charters, Bayou Paradise Fish Charters, Marsh Assassins BowFishing
- **Your Impact:** $50 (fuel for trips) / $100 (beginner class + dock day) / $250 (parent + child with guide) / $500 (family of 4 with guide)

### SEO & Performance
- Meta description, Open Graph tags, JSON-LD structured data
- Google Fonts `preconnect` + `display=swap`
- Image `loading="lazy"` on off-screen images
- `prefers-reduced-motion` respected throughout

### Infrastructure
- `netlify.toml` — security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Leaflet.js loaded from unpkg with SRI integrity hash
- `_headers`, `_redirects` in place for Netlify

---

## Still Needed

| Item | Priority | Notes |
|------|----------|-------|
| **Membership pricing tiers** | Medium | CSS grid already written — add HTML cards with real tier names and prices |
| **Stripe / PayPal** | Medium | Eric handling — nonprofit discount via Stripe |
| **Point DNS to Cloudflare Pages** | High | Squarespace DNS → point to Cloudflare Pages domain after deploy |
| **Formspree recipient email** | Medium | Formspree dashboard → Notifications → set to kyle.rockefeller@bayoucharity.org |
| **Lock Formspree to domain** | Medium | Formspree dashboard → Settings → Allowed Origins → add `bayoucharity.org` |
| **Member portal — Phase 2** | Future | Trip planning calendar, guide trip postings, historical fishing record / heatmap |
| **Upgrade favicon to .ico** | Low | Better cross-browser support |
| **Social media links** | Low | Add to footer/About when Facebook or Instagram is ready |
| **Shop section** | Optional | Merch/branded gear — add if desired |

---

## Hosting

- **Domain:** `bayoucharity.org` (Squarespace, paid through Jan 2029)
- **Host:** Cloudflare Pages (free) — connected to Git repo, deploys automatically on push to `main`
- **DNS:** Point Squarespace → Cloudflare Pages domain after deploy
- **Owner editing:** Open `bayou-family-fishing.html` in any text editor → make changes → copy to `index.html` → commit and push to `main` (Cloudflare auto-deploys)

---

## Contact Info

| Field | Value |
|-------|-------|
| Email | kyle.rockefeller@bayoucharity.org |
| Phone | 504-507-0560 |
| Org | Bayou Family Fishing & Charity |

---

## Key People

| Name | Role |
|------|------|
| Kyle Rockefeller | President & Secretary |
| Doug "Big Papa" Rockefeller | Co-founder, Kyle's father |
| Max Juge | Vice President |
| Ashley Toshimitsu Oiterong | Treasurer |

---

## Project Notes

- **Pro charter deferrals** — Captains donate boat slots/time to club members
- **Innislife** — Purchased Louisiana marshland, community hub in development
- **Confidence Course** — Boat training program; Louisiana license required to rent boats

---

*Last updated: March 11, 2026 — Session 8: water/sky color rebrand, mission statement, Esri satellite maps, volunteer/donation/bio updates, full member portal (Supabase auth + map + feed + admin)*
