# Bayou Family Fishing — Post-Deployment Overhaul Design
**Date:** 2026-03-10
**Session:** 8
**Status:** Approved — ready for implementation

---

## Overview

Following the first live deployment (Session 7), owners returned with two categories of change: (1) a set of copy, UX, and aesthetic edits, and (2) a major new feature — a member portal with social fishing map, feed, and community tools. This document captures the full approved design.

---

## Part 1 — Simple Edits

All of these are straightforward text, copy, label, or behavior changes with no architectural impact.

### Formspree
- No code change needed. Fix is a Formspree dashboard setting: Notifications → set recipient to Kyle's `@bayoucharity` email.

### Navigation & Branding
- Remove "Bayou Family Fishing Club" subtitle under the logo in the top-left nav
- Rename nav tab "Club/Join" → "Join"

### Home Page
- Remove the three stat chips from the hero: "5 Boats", "🌿 INNISFREE Land", "100% Community Built"
- Replace mission statement with:
  > "Coastal living is hard work, but the rewards are plenty. Our mission is to share our way of life with those who serve our nation and our communities. We're military families—we've been there, stretched thin, missing birthdays, missing dinner; and we see you. We are here for our military heroes, our cops and fire fighters, our first responders, educators, and caregivers. You're the ones who show up because others can't. We are all in this together—now let get out on the water!"

### Footer
- All footer links route to `#home` only (no deep-linking from footer)

### Volunteer Page
- Add LDWF fishing license link: [https://louisianaoutdoors.com/licenses-and-permits?utm_source=Rec_Fishing_Licensing_Page&utm_medium=Web&utm_campaign=LDWF_Website](https://louisianaoutdoors.com/licenses-and-permits)
- Liability checkbox: must confirm age 18+ before checkbox becomes active
- Photo consent copy: "I give Bayou Charity permission to take photos and videos of me and my children" → "I give Bayou Charity permission to take photos and videos of my family and me."

### Donation Page
**Main description:**
> "Your donation directly funds our fishing programs for military and other community service families. Your generosity also helps us build the charity's offshore hub, Innisfree, where members have access to the full Louisiana experience."

**Dropdown label changes:**
| Old | New |
|-----|-----|
| INNISFREE Land and construction | Innisfree construction |
| Boat Maintenance | Boating for Vets |
| Local business support | Community support |

**Section header:** "Support Local Businesses" → "Support Mom & Pops"

**Business listings (replace existing):**

| Business | Contact |
|----------|---------|
| Operation Healing Waters / Reel O-Fishal Charters | TikTok: @reelofishal · Capt. Derrious Austin · 850-319-8909 |
| Sam's Bait by You & Alligator Hunts | Capt. Sam Ronquille · 504-906-5812 |
| Slow Down Park: Fishing Camp and RV Park (Airbnb & VRBO) | Kyle Rockefeller · 504-541-1838 |

**Your Impact (replace existing):**
| Amount | Impact |
|--------|--------|
| $50 | Covers fuel for member-supported fishing trips |
| $100 | Covers a beginner's class and a day of dock fishing for a BFF family |
| $250 | Covers a parent and child fishing trip with a licensed guide |
| $500 | Covers a family of 4 fishing trip with a licensed guide |

**Add Guides section to donation page:**

| Guide | Contact |
|-------|---------|
| Reel O-Fishal — Capt. Derrious Austin | TikTok: @reelofishal · 850-319-8909 |
| Down South Fishing Charters — Capt. Kevin Hezeau | [downsouthfishingchartersnola.com](https://www.downsouthfishingchartersnola.com/) · 985-768-1656 |
| Bayou Paradise Fish Charters — Capt. Mitchel Haydel | [geauxfishneworleans.com](https://www.geauxfishneworleans.com/) · 504-345-0865 |
| Marsh Assassins BowFishing — Capt. Kenny Bergman | [marshassassinsbowfishing.com](https://www.marshassassinsbowfishing.com/) |

### About Page — Max Juge Bio
Replace existing bio with:
> "A full-time commercial real estate professional with a deep-rooted passion for the outdoors and the unique culture of South Louisiana. Having grown up fishing and hunting the salt marshes of Plaquemines Parish, Max brings a local's perspective and appreciation for the region to his work and life."

---

## Part 2 — Visual Redesign: Water / Sky / Golden Hour

Replace the existing earthy green palette with a water, sky, and golden hour palette. All changes are CSS variable swaps in the single `<style>` block.

| Token | Current | New | Feel |
|-------|---------|-----|------|
| `--green-deep` | `#1a3a2a` | `#0d2b3e` | Deep water / midnight gulf |
| `--green-mid` | `#2d5c40` | `#1a4a6b` | Open water blue |
| `--green-water` | `#2d6b5e` | `#2980b9` | Midday bayou |
| `--amber` | `#c8793a` | `#e8923a` | Golden hour sun (warm, preserved) |
| `--gold` | `#d4a855` | `#f0c040` | Horizon glow |
| `--cream` | `#f7edd8` | `#eef6fb` | Sky haze / morning mist |
| `--cream-dark` | `#ede0c8` | `#d0e8f5` | Light water reflection |
| `--white` | `#fdf8f0` | `#f5fbff` | Open sky |
| `--text-dark` | `#1e2a1e` | `#0d1f2d` | Deep water text |
| `--text-mid` | `#3d4f3a` | `#2c5364` | Mid-water text |

Dark mode variables update in parallel to maintain contrast ratios.

---

## Part 3 — INNISFREE Map: Satellite Imagery

Replace the current OpenStreetMap tile layer with **Esri World Imagery** satellite tiles via Leaflet.js (free, no API key required).

**Tile URL:**
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
```
**Attribution:** `Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics`

All three existing markers (Home Base, Duck Lease, INNISFREE Property) and their popups remain unchanged. Only the tile layer changes.

---

## Part 4 — Member Portal (Phase 1)

### Architecture
- **Backend:** Supabase (auth, PostgreSQL database, file storage, real-time)
- **Auth:** Social login via Google and Apple (Supabase Auth)
- **Hosting:** Site remains on Cloudflare Pages (static HTML + Supabase JS SDK via CDN)
- **Admin access:** Eric owns Supabase project, Kyle invited as Developer role via Organization → Members

### Account Roles & Approval Flow

| Role | How obtained | Post behavior |
|------|-------------|---------------|
| `member` | Signs up → Kyle approves → active | Posts go live immediately |
| `guide` | Signs up → Kyle approves → active | Posts live immediately + guide badge; can post trip discounts |
| `admin` | Set manually in DB | Full access; sees admin panel tab |

- On signup, all accounts start as `status = 'pending'`
- Kyle receives an email notification (Supabase Auth webhook → email) for every new signup
- Pending users see a holding screen: "Your account is awaiting approval. We'll email you when you're in."
- Kyle starts as sole admin; two additional admin slots added by updating `role` in `profiles` table

### Navigation
- New "Members" tab added to the nav bar (8 tabs → 9 tabs)
- If logged out: shows sign-in screen with Google + Apple buttons
- If logged in + pending: shows holding screen
- If logged in + approved: shows member area (map + feed)
- If logged in + admin: shows member area + "Admin" tab in member nav

### Member Map
- **Tiles:** Esri satellite (same as INNISFREE map update)
- **Pin placement:** Reads GPS metadata from uploaded photo if present; member can drag pin to correct location or place manually if GPS absent
- **Post form fields:** Photo (up to 5MB), caption, species caught (text), location name (optional override)
- **Pin cards (on click):** Photo, member display name, date/time, location name, species caught, comment thread

### Feed
- Scrollable list below the map, newest pins first
- Each card: photo thumbnail, member name, date, species, caption, comment count
- Tap/click to expand full card with comment thread
- Members can post comments; comments appear in real-time

### Admin Panel
- Accessible via "Admin" tab, visible only to `role = 'admin'`
- **Pending Accounts queue:** Name, email, role requested, signup date → Approve / Reject buttons
- **Flagged Posts queue:** Any post flagged by a member → Review / Remove buttons
- Future: promote member to guide, promote member to admin

### Supabase Data Model

```sql
-- User profiles (extends Supabase auth.users)
profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users,
  display_name text,
  avatar_url  text,
  role        text DEFAULT 'member',   -- member | guide | admin
  status      text DEFAULT 'pending',  -- pending | approved | rejected
  joined_at   timestamptz DEFAULT now()
)

-- Fishing pins
pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id),
  photo_url   text NOT NULL,
  lat         float8 NOT NULL,
  lng         float8 NOT NULL,
  location_name text,
  caption     text,
  species     text,
  created_at  timestamptz DEFAULT now(),
  flagged     boolean DEFAULT false
)

-- Comments on pins
comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id      uuid REFERENCES pins(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES profiles(id),
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now()
)
```

### Row-Level Security (RLS)
- `profiles`: users can read all approved profiles; only admins can update `role` / `status`
- `pins`: approved members can read all pins; only pin owner can delete their own pin; admins can delete any
- `comments`: approved members can read/write; owners can delete their own

---

## Part 5 — Member Portal (Phase 2, Future Session)

Deferred to follow-up session once Phase 1 is live and members are active.

- **Trip Planning Calendar** — members post future trips (date, location, max participants); others join; calendar view + list view
- **Guide Trip Postings** — approved guides post last-minute discounted trips with booking link or contact info
- **Historical Fishing Record** — filter pins by month, location, species; heatmap overlay on member map

---

## Implementation Order

1. All simple copy/UX edits (Part 1)
2. CSS color token swap (Part 2)
3. INNISFREE satellite tiles (Part 3)
4. Supabase project setup + schema migration
5. Member portal UI — auth screens, holding screen, member map, feed
6. Admin panel
7. Sync `bayou-family-fishing.html` → `index.html`, push to `main`

---

*Design approved: 2026-03-10 — Eric Gray + BFF owners*
