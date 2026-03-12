# CLAUDE.md — Bayou Family Fishing / Bayou Charity

> Read this file at the start of every session before touching any code.

---

## Quick Orientation (read first)

| | |
|--|--|
| **Owner** | Eric Gray · `ericgray928@live.com` |
| **Org** | Bayou Family Fishing → rebranding to "Bayou Charity" |
| **Domain** | `bayoucharity.org` (Squarespace DNS, paid Jan 2029) |
| **Host** | Cloudflare Pages — auto-deploys on push to `main` |
| **Source file** | `bayou-family-fishing.html` — **5,122 lines**, single-file, no build step |
| **Entry point** | `index.html` — always an **identical copy** of the above |
| **Stack** | Vanilla HTML · CSS custom properties · Vanilla JS · No dependencies |

**The one rule:** Edit `bayou-family-fishing.html` only. At session end, sync:
```bash
cp bayou-family-fishing.html index.html
diff bayou-family-fishing.html index.html && echo "Files match" || echo "MISMATCH"
```

---

## File Structure

```
first draft website/
├── bayou-family-fishing.html   ← SOURCE OF TRUTH
├── index.html                  ← CFP entry point (copy of above — BOTH required)
├── fishing-rodeo.html          ← Standalone Fishing Rodeo page (linked from /volunteer)
├── 404.html
├── privacy.html                ← Required for Supabase OAuth
├── terms.html
├── data-deletion.html          ← Required for Facebook OAuth
├── _redirects · _headers · cfp.toml
├── README.md                   ← Human-readable project summary
├── CLAUDE.md                   ← This file
└── Photos/                     ← All media (photos + videos)
```

> **Both `bayou-family-fishing.html` and `index.html` are required.** Cloudflare Pages serves `index.html` for the root URL `/`; `bayou-family-fishing.html` is the named source for editing clarity. Always sync with `cp bayou-family-fishing.html index.html` at session end.

---

## Section Map (with line numbers)

| Tab | Section ID | Line | Notes |
|-----|-----------|------|-------|
| Home | `#home` | 2740 | Hero video bg + parallax skyline |
| Gallery | `#gallery` | 2806 | 39 photos + 2 video thumbs; event tabs + upload; filter + lightbox |
| Join / Club | `#club` | 2930 | Membership form (Formspree); video bg |
| Volunteer | `#volunteer` | 2979 | 6 opp-cards; featured event intro + /fishing-rodeo CTA; general sign-up form |
| Boats | `#boats` | 3129 | 5 expandable boat story cards |
| INNISFREE | `#innisfree` | 3254 | Marshland story; Leaflet satellite map |
| Donate | `#donate` | 3322 | Donation form (Formspree); impact tiers; in-kind donations section |
| About | `#about` | 3469 | Founder bio; board cards; partner/press |
| Members | `#members` | 3559 | Private portal — Google/FB OAuth via Supabase |

Navigation is tab-based (`showSection()`). `VALID_SECTIONS` array guards routes.

---

## Design Tokens

### Colors

```css
--green-deep:  #0d2b3e   /* nav, overlay base, darkest bg */
--green-water: #1a4a6b   /* mid blue-green */
--amber:       #e8923a   /* links, accents, CTAs */
--gold:        #c9a84c   /* section eyebrows, headings on dark bg */
--cream:       #eef6fb   /* light section backgrounds */
--white:       #ffffff
--text-dark:   #0d1f2d   /* body text on light bg */
--text-mid:    #4a6070   /* secondary body text */
```

Dark mode: `[data-theme="dark"]` on `<html>`. Skyline sections use `filter: brightness(0.82)` — no background override. Toggle persists in `localStorage`.

**Skyline overlay rule:** Use `rgba(13,43,62,…)` / `rgba(26,74,107,…)` at 0.36–0.62 opacity. Never `rgba(5,18,28,…)` (near-black). Fix contrast with `text-shadow` on headings, not by raising overlay opacity.

### Fonts (Google Fonts)

| Family | Use |
|--------|-----|
| `Lora` | Base serif — body, headings default |
| `Playfair Display` | Section titles, boat names, display |
| `Caveat` | Handwritten accents, taglines |

*(Note: no Inter — Lora is the body font.)*

---

## Section Backgrounds

| Section | Photo file |
|---------|-----------|
| Home | `Photos/skyline.jpg` |
| Join / Club | `Photos/Skyline astetic 1.jpg` |
| Volunteer | `Photos/Skyline astetic 1.jpg` |
| Boats | `Photos/Skyline golden 2.jpg` |
| INNISFREE | `Photos/header image for INNISFREE tab.jpg` |
| Gallery | `Photos/Skyline astetic 1.jpg` |
| Donate | `Photos/Skyline Marsh golden hue.jpg` |
| About | `Photos/Skyline Marsh golden hue.jpg` |
| Members | `Photos/skyline.jpg` |

**iOS caveat:** ✅ FIXED — `@media (max-width: 768px)` block with `background-attachment: scroll !important` on all sections is already in place (Session 11). Do not add again.

---

## Photos / Media Manifest

### Key photos

| File | Used in |
|------|---------|
| `BFF+Logo.jpg` | Nav logo, favicon, 404, preloader |
| `BFF-Logo-1024.jpg` | OG/social meta tags |
| `skyline.jpg` | Home + Members section bg, OG image |
| `Skyline astetic 1.jpg` | Join / Volunteer / Gallery bg |
| `Skyline golden 2.jpg` | Boats section bg; also Gallery thumb (lightbox index 37) |
| `Skyline Marsh golden hue.jpg` | Donate / About bg |
| `Skyline golden hue .jpg` | **Trailing space before `.jpg`** — intentional; used in gallery |
| `header image for INNISFREE tab.jpg` | INNISFREE section bg |
| `who we are.jpg` | About — community group photo |
| `Kyle Rockefeller, President and Secretary.jpg` | About team card |
| `Doug Rockefeller, Big Papa.jpg` | About team card |
| `Max Juge, Vice President.jpg` | About team card |
| `Ashley Toshimitsu Oiterong, Treasurer.jpg` | About team card |
| `Gallery1.jpg – Gallery37.jpg` | Gallery (37 photos) |

### Boats photo map

| data-boat | Name | Photo file | Line |
|-----------|------|-----------|------|
| `01` | Uncle John's Campagna Skiff | `Uncle Johns Campagna Skiff (boat).jpg` | 3248 |
| `02` | The Ms. Carol | `The Ms Carrol (boat).jpg` ← **2 r's in filename**; display = "Ms. Carol" | 3268 |
| `03` | The Last Chance | `Last Chance (boat).jpg` | 3289 |
| `04` | The Check Twice | `The Check Twice (boat).jpg` | 3308 |
| `05` | Bait By You | `Bait By You Hook it or Cook it (boat).jpg` | 3332 |

Expand bodies are inside `.boat-story-body` divs.

### Videos

| File | Used in |
|------|---------|
| `BFF club page header video.mp4` | Join/Club section bg |
| `bff video 2.mp4` | Boats section full-width bg |
| `check twice video (boat).mp4` | Check Twice boat card bg |
| `club member casting video (gallery).mp4` | Gallery inline video thumb |
| `fishing knots class video (gallery).mp4` | Gallery inline video thumb |

**6 autoplay videos total.** If performance degrades, add `IntersectionObserver` to pause off-screen videos.

> **Never rename files in `Photos/`.** Filenames are embedded in `src` attributes. Spaces → `%20` in HTML.

---

## Integrations

| Service | Detail |
|---------|--------|
| **Formspree** | Endpoint: `https://formspree.io/f/mdawanzg` — used for Club/Join, Volunteer, Donate, Fishing Rodeo RSVP. Honeypot: `_gotcha` on all forms |
| **Supabase URL** | `https://osiramhnynhwmlfyuqcp.supabase.co` |
| **Supabase Key** | `sb_publishable_yS9pPiw1F7QuxGcWVAyLXw_oZMI9HCI` |
| **Supabase Auth** | Google + Facebook OAuth. `redirectTo: window.location.origin`. Approval flow: pending → Kyle approves in admin panel |
| **Supabase DB** | Tables: `profiles`, `pins`, `comments`, `gallery_events`, `gallery_submissions` (RLS enabled). Buckets: `pin-photos` (≤5MB), `gallery-pending`, `gallery-public` |
| **Supabase Roles** | `member` · `guide` · `admin` |
| **Leaflet.js** | INNISFREE map — Esri World Imagery tiles (no API key). Markers: Home Base `29.5955, -89.9067` · Duck Lease `29.5766, -89.9351` · INNISFREE `29.5534, -89.9539` |

---

## Gallery State

### Static gallery (HTML, built-in)
- **39 photo thumbnails** (Gallery1–37 + 2 skyline photos)
- **2 inline video thumbnails** (`.gallery-video-thumb`) between Gallery21 and Gallery22
- **Filter buttons:** All · Cookouts · Fishing · Kids Club · Community · Boats
- **Lightbox:** `const galleryImages` array must stay in sync with grid HTML. Counter is dynamic (`galleryImages.length`).
- **Video fullscreen:** `requestFullscreen()` + iOS `webkitEnterFullscreen()` fallback. Named handler `onFullscreenChange` removes itself on exit.
- **`filterGallery()`** queries both `.gallery-thumb` and `.gallery-video-thumb`.
- ⚠️ **Gallery22–37 alt text + `data-category` values are placeholders** — need visual review.

### Dynamic gallery (Supabase, added Session 11)
- **Event tabs:** Loaded from `gallery_events` table. First tab always = hardcoded `BFF_FIRST_EVENT_ID = 'c9fb742c-6785-41f8-9598-687cb49554de'`.
- **Submissions:** Members can upload photos per event → stored in `gallery-pending` bucket → admin approves → moved to `gallery-public`.
- **Table:** `gallery_submissions` — columns: `id`, `event_id`, `uploader_id`, `storage_path`, `caption`, `approved`, `created_at`.
- **Key functions:** `loadGalleryTabs()`, `loadEventSubmissions()`, `submitGalleryUpload()`, `updateGalleryUploadButton()`.
- **`getSB()` is global** (line ~3701) — shared between gallery functions and members portal IIFE. Do not re-declare inside the IIFE.

---

## Key People

| Name | Role |
|------|------|
| Kyle Rockefeller | President & Secretary (`kyle.rockefeller@icloud.com`) |
| Doug "Big Papa" Rockefeller | Co-founder |
| Max Juge | Vice President |
| Ashley Toshimitsu Oiterong | Treasurer |
| Capt. Sam Ronquille | "Bait By You" captain, featured in copy |
| Eric Gray | Site owner (`ericgray928@live.com`) |

---

## Voice & Copy Rules

- Authentic Louisiana voice — colloquial, warm, first person OK
- "Keep 'em running", "my baby", "plenty of these boats in Acadiana" = correct voice, not errors
- Real names: Capt. Sam Ronquille, Minn Kota, Suzuki, Plaquemines, Acadiana
- Run `humanizer` after any copy edits to catch AI-pattern phrasing before committing
- Org name: "Bayou Family Fishing" (full) or "BFF" (informal); "Bayou Charity" in footer/branding — both correct

---

## Known Technical Issues

| Issue | Status | Detail |
|-------|--------|--------|
| iOS `background-attachment: fixed` | ✅ FIXED (S11) | `@media (max-width: 768px)` scroll fallback added — do not add again |
| XSS / `escapeHTML()` in portal | ✅ FIXED (S11) | 18+ usages; utility at line ~4596; covers all portal innerHTML concat points including gallery submission approval |
| Supabase SRI hash | ✅ FIXED (S11) | `sha384-XEXe97+HNh6W7E6opXLb8siV2SnDVO4xnfBIm77tH+Tl6xMs9mY3zBIl5t2QFwf2` pinned at line ~2717 |
| `showSection()` no guard | ✅ FIXED (S11) | `VALID_SECTIONS.includes(id)` guard in place at line ~3748 |
| Skip link missing | ✅ FIXED (S11) | `.skip-link` added at line ~2720 |
| Donate sticky form layout | ✅ FIXED (S11) | `position: sticky; top: 5rem` · `420px 1fr` cols · Your Impact reordered first · mobile static override |
| **CSP missing Supabase domains** | 🔴 **ACTIVE — login blocker** | `_headers` + `cfp.toml` CSP missing `cdn.jsdelivr.net` in `script-src` and `*.supabase.co` in `connect-src` + `img-src`. Will block the entire member portal on production. Fix before DNS cutover. |
| Check Twice z-index | Active | `.boat-card-video-bg` at `z-index: 0`; all `.boat-story > *:not(.boat-card-video-bg)` at `z-index: 1` |
| `Skyline golden hue .jpg` | Active | Trailing space before `.jpg` is intentional — filename and all `src` refs intentionally match |
| 6 autoplay videos | Active | May degrade on low-end hardware — add `IntersectionObserver` pause if needed |
| Inline `onclick` in portal | Active | Admin/comment buttons use `JSON.stringify(String(id))` pattern — safe but blocks future CSP; migrate to `data-*` + event delegation |

---

## Open / Deferred Items

| Item | Priority | Notes |
|------|----------|-------|
| **Fix CSP headers — Supabase domains missing** | **🔴 CRITICAL** | In `_headers` AND `cfp.toml`: add `https://cdn.jsdelivr.net` to `script-src`; add `https://*.supabase.co` to `connect-src` and `img-src`. Without this, member portal is completely broken on production. See CODEBASE-REVIEW.md for exact fix. |
| **Commit all Session 11–12 work** | **High** | `.git/index.lock` stale — delete it first (`del .git\index.lock` on Windows / `rm .git/index.lock` on Mac). Then stage all files + commit. Huge diff — includes fishing-rodeo.html, donate sticky, gallery events, all S11 fixes. |
| **Gallery22–37 alt text + categories** | **High** | Still generic placeholders; need visual review of the actual photos + `design:accessibility-review` |
| Formspree lock to domain | Medium | Dashboard → Settings → Allowed Origins → `bayoucharity.org` |
| Formspree notification email | Medium | Dashboard → Notifications → `kyle.rockefeller@bayoucharity.org` |
| Stripe / PayPal integration | Medium | Eric handling; nonprofit discount via Stripe |
| Inline `onclick` → event delegation | Medium | Admin/comment buttons in portal; required before tightening CSP headers |
| DNS: Squarespace → Cloudflare Pages | Low | Confirm `bayoucharity.org` CNAME/A records point to Cloudflare Pages |
| Member portal Phase 2 | Future | Trip calendar, guide postings, fishing heatmap |
| Gallery Phase 2 | Future | Admin approval flow UI for `gallery_submissions` in portal |
| IntersectionObserver for videos | Low | Pause 6 autoplay videos when off-screen |
| Favicon upgrade to .ico | Low | Better cross-browser support |
| Social media links | Low | Footer/About when Facebook/Instagram ready |

---

## Workflow Rules

1. **`grep -n` before editing** — line numbers in this file are approximate; verify first
2. **One logical change per commit**
3. **Verify before every commit** — invoke `superpowers:verification-before-completion`
4. **Sync `index.html` at session end only** — never mid-session
5. **Never rename `Photos/` files` — update display text and alt text instead
6. **Cowork = plan only · CLI = implement only** — Cowork sessions produce plans, design decisions, and CLAUDE.md updates. Zero edits to `bayou-family-fishing.html` or any site file ever happen in Cowork. All code changes live in CLI sessions only.
7. **Push to `main` directly** — this project has no staging branch. Every CLI session commits and pushes to `main`. Cloudflare Pages auto-deploys on push.

### Skill Invocation Guide

> **Two environments — hard split, no exceptions.**
>
> | Environment | Purpose | Touches site files? |
> |-------------|---------|-------------------|
> | **Cowork** | Brainstorming · design decisions · writing plans · CLAUDE.md updates | ❌ Never |
> | **CLI (Claude Code)** | All implementation — HTML/CSS/JS edits, commits, pushes | ✅ Always |
>
> Every CLI session starts with `napkin recall "bayou-family-fishing"` + `taskmaster init`, then uses `superpowers:executing-plans` to run the plan written in Cowork. Skills listed per environment below are the confirmed, complete lists.

---

#### CLI Skills — Complete List

**Locally installed (`~/.claude/skills/`)**

| Skill | When to use |
|-------|-------------|
| `humanizer` | After writing ANY copy — before every commit. Removes AI-pattern phrasing. |
| `napkin recall "bayou-family-fishing"` | Start of every CLI session — loads project memory and context. |
| `taskmaster` | Initialize at session start; track tasks throughout. |

**Superpowers (built-in to CLI)**

| Skill | When to use |
|-------|-------------|
| `superpowers:executing-plans` | Executing any written implementation plan (Wave 1–5, etc.) |
| `superpowers:verification-before-completion` | Before EVERY commit — confirm changes are correct |
| `superpowers:brainstorming` | Before adding any new feature, section, or JS behavior |
| `superpowers:writing-plans` | When spec/requirements exist and need a step-by-step plan |
| `superpowers:systematic-debugging` | Any bug, broken layout, JS error, or unexpected output |
| `superpowers:test-driven-development` | Before writing new JS functions or Supabase query logic |
| `superpowers:requesting-code-review` | After completing a major task, before merging |
| `superpowers:receiving-code-review` | When acting on review feedback — verify before implementing |
| `superpowers:finishing-a-development-branch` | When a full wave is done and ready to merge to `main` |
| `superpowers:dispatching-parallel-agents` | When 2+ independent tasks can run simultaneously |
| `superpowers:subagent-driven-development` | Executing independent sub-tasks within a single session |
| `superpowers:using-git-worktrees` | Before any wave that needs branch isolation |
| `ui-ux-pro-max:ui-ux-pro-max` | Any CSS layout, visual design, or dark mode work |
| `gsd:*` | Full project workflow orchestration — run `/gsd:help` for details |

---

#### Cowork Session Skills — Complete List

**Superpowers (planning / architecture)**

| Skill | When to use |
|-------|-------------|
| `superpowers:brainstorming` | Any new feature, section, or UI change — before writing anything |
| `superpowers:writing-plans` | Multi-step implementation plans (waves, sessions) |
| `superpowers:dispatching-parallel-agents` | 2+ independent tasks to split across CLI sessions |
| `superpowers:verification-before-completion` | Verify a plan or output before handing to CLI |
| `superpowers:systematic-debugging` | Diagnosing broken behavior before writing a fix plan |
| `superpowers:writing-skills` | Creating or editing skill files |
| `superpowers:using-git-worktrees` | Planning branch isolation strategy |
| `superpowers:executing-plans` | Executing a plan directly in Cowork (rare) |
| `superpowers:requesting-code-review` | Review before merging from Cowork context |
| `superpowers:receiving-code-review` | Acting on review feedback |
| `superpowers:finishing-a-development-branch` | Deciding how to integrate completed work |
| `superpowers:test-driven-development` | Planning test approach before implementation |
| `superpowers:subagent-driven-development` | Independent sub-tasks in current Cowork session |
| `ui-ux-pro-max:ui-ux-pro-max` | Any CSS, layout, visual, or dark mode decision |

**Engineering**

| Skill | When to use |
|-------|-------------|
| `engineering:code-review` | Review new JS or CSS blocks before handing to CLI |
| `engineering:system-design` | Architecture decisions — Supabase schema, gallery system, auth flow |
| `engineering:architecture` | Writing an ADR for a major technical decision |
| `engineering:documentation` | READMEs, runbooks, CLAUDE.md updates |
| `engineering:deploy-checklist` | Before pushing any wave to Cloudflare Pages / `main` |
| `engineering:tech-debt` | Identifying cleanup items, deferred work, known issues |
| `engineering:debug` | Structured debugging when systematic-debugging isn't enough |
| `engineering:testing-strategy` | Designing test plan for new Supabase logic or JS features |
| `engineering:incident-response` | Production outage (Cloudflare Pages down, Supabase errors) |
| `engineering:incident` | Same — shorthand alias |
| `engineering:standup` | Summarizing recent activity across sessions |
| `engineering:review` | Code review alias |

**Design**

| Skill | When to use |
|-------|-------------|
| `design:accessibility-review` | Contrast checks, WCAG AA, gallery alt text audit |
| `design:ux-writing` | CTAs, button labels, error messages, empty states |
| `design:ux-copy` | Microcopy, nav labels, form field copy |
| `design:critique` | Structured feedback on a section's visual design |
| `design:design-system` | Auditing or extending design tokens (colors, type, spacing) |
| `design:design-system-management` | Managing token library across the single-file stack |
| `design:handoff` | Developer specs from a design (if handing off to a contractor) |
| `design:design-handoff` | Same — alias |
| `design:user-research` | Planning usability tests or member feedback surveys |
| `design:research-synthesis` | Synthesizing feedback from members/Kyle into action items |

**Document / file generation (Cowork only)**

| Skill | When to use |
|-------|-------------|
| `anthropic-skills:docx` | Generating Word documents (reports, memos, proposals) |
| `anthropic-skills:xlsx` | Spreadsheets (budgets, member lists, event rosters) |
| `anthropic-skills:pptx` | Presentations (board decks, sponsor pitch) |
| `anthropic-skills:pdf` | PDFs (forms, handouts, grant applications) |
| `anthropic-skills:schedule` | Creating scheduled/recurring tasks |
| `anthropic-skills:skill-creator` | Creating or optimizing skill files |

---

#### Quick-Reference: Situation → Skill

| Situation | Environment | Skill |
|-----------|-------------|-------|
| Starting a CLI session | CLI | `napkin recall "bayou-family-fishing"` + `taskmaster` |
| New feature or section | Both | `superpowers:brainstorming` first, always |
| Writing a wave/plan | Cowork | `superpowers:writing-plans` |
| Executing a wave | CLI | `superpowers:executing-plans` |
| Any copy written | CLI | `humanizer` before commit |
| Any CSS / visual change | Both | `ui-ux-pro-max:ui-ux-pro-max` |
| Color contrast / dark mode | Both | `design:accessibility-review` |
| Before committing | CLI | `superpowers:verification-before-completion` |
| Bug / broken output | Both | `superpowers:systematic-debugging` |
| JS or CSS block review | Cowork | `engineering:code-review` |
| Supabase schema / auth design | Cowork | `engineering:system-design` |
| Gallery alt text audit | Cowork | `design:accessibility-review` |
| CTAs, button copy, form labels | Cowork | `design:ux-writing` |
| Design token changes | Cowork | `design:design-system` |
| Before pushing to `main` | Cowork | `engineering:deploy-checklist` |
| Wave fully done, ready to merge | CLI | `superpowers:finishing-a-development-branch` |
| 2+ independent CLI tasks | Both | `superpowers:dispatching-parallel-agents` |

### Session End Checklist

```bash
# 1. Sync index.html
cp bayou-family-fishing.html index.html
diff bayou-family-fishing.html index.html && echo "Files match" || echo "MISMATCH"

# 2. Commit and push to main
git add bayou-family-fishing.html index.html
git commit -m "Session [N]: [short description]"
git push origin main
```

---

*Last updated: 2026-03-11 — Sessions 1–11 complete + final pre-launch Cowork review · Donate sticky form confirmed implemented · CSP Supabase domain bug identified as login blocker · Stale plan file deleted · All Session 11 fixes confirmed in source (uncommitted — index.lock must be deleted before commit)*
