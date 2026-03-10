# Bayou Family Fishing — Website Project

> Nonprofit website for Bayou Family Fishing & Charity
> Built with HTML, CSS, and vanilla JavaScript — single file, no dependencies.

---

## Project Files

| File | Description |
|------|-------------|
| `bayou-family-fishing.html` | Full website — all pages, styles, and logic in one file |
| `Photos/` | All media assets (photos, videos) |
| `README.md` | This file |

---

## Site Structure

| Tab | Section ID | Description |
|-----|-----------|-------------|
| Home | `#home` | Hero (skyline photo), mission quote, quick-link cards |
| Club / Join | `#club` | Membership tiers, paywall notice, application form |
| Volunteer | `#volunteer` | **Fishing Rodeo spotlight (April 25)**, opportunities grid, general signup form |
| Boats | `#boats` | 5 real boat stories + photos, maintenance table, availability calendar |
| INNISFREE | `#innisfree` | Land story, build phases, fishing spot map placeholder |
| Donate | `#donate` | Donation form, local biz support, impact breakdown |
| About | `#about` | Team bios + photos, contact info, partner/press cards |

---

## Media Assets

| File | Used In |
|------|---------|
| `BFF+Logo.jpg` | Nav logo |
| `skyline.jpg` | Hero background |
| `Kyle Rockefeller, President and Secretary.jpg` | About — team card |
| `Doug Rockefeller, Big Papa.jpg` | About — team card |
| `Max Juge, Vice President.jpg` | About — team card |
| `Ashley Toshimitsu Oiterong, Treasurer.jpg` | About — team card |
| `Gallery5.jpg` | About — large founder photo |
| `who we are.jpg` | Available, not yet placed |
| `Uncle Johns Campagna Skiff (boat).jpg` | Boats section |
| `The Ms Carrol (boat).jpg` | Boats section |
| `Last Chance (boat).jpg` | Boats section |
| `The Check Twice (boat).jpg` | Boats section |
| `Bait By You Hook it or Cook it (boat).jpg` | Boats section |
| `Uncle Johns Campagna Skiff First Crabbing Trip (boat).jpg` | Available, not yet placed |
| `Gallery1–21.jpg` | Available, not yet placed (gallery section TBD) |
| `BFF club page header video.mp4` | Available, not yet placed |
| `bff video 2.mp4` | Available, not yet placed |

---

## Design System

| Font | Use |
|------|-----|
| `Playfair Display` | Headings, titles |
| `Caveat` | Handwritten accents, taglines |
| `Lora` | Body copy, navigation |

| Variable | Hex | Use |
|----------|-----|-----|
| `--green-deep` | `#1a3a2a` | Nav, primary dark |
| `--green-mid` | `#2d5c40` | Hover states |
| `--green-water` | `#2d6b5e` | Available dates, success |
| `--amber` | `#c8793a` | Primary CTA |
| `--gold` | `#d4a855` | Logo accents, impact numbers |
| `--cream` | `#f7edd8` | Section backgrounds |
| `--cream-dark` | `#ede0c8` | Borders, card backgrounds |
| `--white` | `#fdf8f0` | Page background |
| `--text-dark` | `#1e2a1e` | Primary body text |
| `--text-mid` | `#3d4f3a` | Secondary body text |

---

## What's Done

- Real BFF logo in nav
- Hero background — real bayou skyline photo
- 5 real boats with photos and stories (Uncle John's Campagna Skiff, The Ms. Carrol, Last Chance, The Check Twice, Bait By You)
- Maintenance table and booking calendar updated with real boat names
- About page — real team photos and written bios for all 4 members
- Tab navigation fixed — instant scroll to top, home section no longer permanently visible
- Decorative hero wave removed (was blocking content)
- **Fishing Rodeo spotlight added to Volunteer page** — see detail below

### Fishing Rodeo Feature (added March 2026)

A full event spotlight block now lives at the top of the `#volunteer` section for the **Sunrise Family Fishing Rodeo on April 25, 2026**.

| Component | Status | Notes |
|-----------|--------|-------|
| Event headline, subline, synopsis | ✅ Done | Pulled from event brief |
| Date / time strip | ✅ Done | April 25, begins at Sunrise |
| Rain or Shine badge | ✅ Done | Prominently displayed in meta strip |
| Location | ⚠️ Placeholder | Replace `[Location TBD]` with venue name/address |
| Rodeo features list (Class / Feast / Cost) | ✅ Done | |
| Family RSVP form | ✅ Done | Name, adults, kids, gear toggle |
| Live capacity counter + progress bar | ✅ Done | Cap set to 50; turns red and shows waitlist at limit |
| Backend integration point | ✅ Stubbed | Comment block marks where to plug in API call |
| Pack Your Tackle checklist | ✅ Done | Interactive — checkboxes cross off items |
| Support the Captains payment strip | ✅ Done | 6 methods — all handles are placeholders |
| Mobile responsive | ✅ Done | Collapses to single column on small screens |

---

## Still Needed

| Item | Location | Notes |
|------|----------|-------|
| Rodeo venue / address | `#volunteer` rodeo spotlight | Replace `[Location TBD]` in the meta strip |
| Payment handles | `#volunteer` captains strip | Fill in CashApp, Venmo, Zelle, PayPal, Apple Cash handles |
| Captain / guide names | `#volunteer` rodeo synopsis | Optional — name the 3 Lafayette captains if desired |
| RSVP backend | `#volunteer` RSVP form | Connect to Supabase or Firebase so counter persists across sessions — integration point is already stubbed in the JS |
| Photo gallery | New section | 21 gallery photos ready in `Photos/` |
| Videos | TBD | 2 videos ready in `Photos/` |
| `who we are.jpg` | Home or About | Good group-on-boat shot |
| Membership prices | `#club` | Confirm actual dues |
| Local business partners | `#donate` | Swap in real partners |
| Fishing spot map | `#innisfree` | Embed Google Maps iframe |
| General form backend | All other forms | Formspree or Netlify Forms |
| Payment processing | Club + Donate | Stripe or PayPal |
| Member paywall | `#club`, `#boats`, `#innisfree` | MemberStack or Outseta |
| Shop section | TBD | Merch/shop not yet built — add if needed |

---

## Hosting Plan

- **Domain:** `bayoucharity.org` (Squarespace, paid through Jan 2029)
- **Host:** Netlify (free) — drag and drop `first draft website` folder to deploy
- **DNS:** Point Squarespace domain to Netlify after deploy
- **Owner editing:** Open HTML in any text editor → make changes → re-drag folder to Netlify

---

## Contact Info

| Field | Value |
|-------|-------|
| Email | kyle.rockefeller@bayoucharity.org |
| Phone | 504-507-0560 |
| Org | Bayou Family Fishing & Charity |

---

## Project Notes

- **Pro charter deferrals** — Captains donate boat slots/time to club members
- **Innislife** — Purchased Louisiana marshland, community hub in development
- **Confidence Course** — Boat training program; Louisiana license required to rent boats
- **Doug "Big Papa" Rockefeller** — Co-founder, Kyle's father

---

*Last updated: March 5, 2026 — Fishing Rodeo spotlight added to Volunteer page*
