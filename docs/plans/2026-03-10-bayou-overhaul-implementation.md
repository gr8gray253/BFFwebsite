# Bayou Family Fishing — Full Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply all post-launch owner change requests to bayoucharity.org — copy edits, visual rebrand, satellite map, and a full Supabase-backed member portal with social fishing map and admin approval flow.

**Architecture:** Single static HTML file (`bayou-family-fishing.html`) on Cloudflare Pages. Supabase JS SDK loaded via CDN handles auth, database, and file storage entirely client-side. Member portal is a new 9th tab injected into the existing tab-switching system. `index.html` is a sync of `bayou-family-fishing.html` — only touch `bayou-family-fishing.html` during development; sync to `index.html` on final deploy commit.

**Tech Stack:** Vanilla HTML/CSS/JS, Leaflet.js (already present), Supabase JS SDK v2 (CDN), Esri satellite tiles (free, no key), Cloudflare Pages (hosting), Git (auto-deploy on push to `main`)

---

## Pre-Flight: Things to have ready before starting

- Supabase project created at [supabase.com](https://supabase.com) — free tier is fine
- Note your **Project URL** and **anon public key** (Settings → API in Supabase dashboard)
- Kyle invited to Supabase org: Organization → Members → Invite by email → Developer role
- Google OAuth app configured in Supabase: Authentication → Providers → Google → enable, add Client ID + Secret from [console.cloud.google.com](https://console.cloud.google.com)
- Facebook OAuth app configured in Supabase: Create app at [developers.facebook.com](https://developers.facebook.com) → Consumer type → add "Facebook Login" product → add `https://<project>.supabase.co/auth/v1/callback` as Valid OAuth Redirect URI → copy App ID + App Secret → paste into Supabase Authentication → Providers → Facebook
- Apple OAuth configured similarly (optional for Phase 1, add when ready)
- In Supabase Auth settings: set Site URL to `https://bayoucharity.org`, add `http://localhost:*` to Additional Redirect URLs for local testing

---

## Task 1: Branding & Navigation Edits

**Files:**
- Modify: `bayou-family-fishing.html` — nav section (~line 2316–2380)

**Step 1: Remove "Bayou Family Fishing Club" subtitle**

Find and delete this element in the nav (search for `Bayou Family Fishing Club`):
```html
<!-- DELETE this line entirely: -->
<span class="nav-club-sub">Bayou Family Fishing Club</span>
```

**Step 2: Rename "Club/Join" tab to "Join"**

Find the nav link (search for `Club/Join` or `onclick="showSection('club')`):
```html
<!-- BEFORE -->
<a href="#club" class="nav-link" onclick="...">Club/Join</a>

<!-- AFTER -->
<a href="#club" class="nav-link" onclick="...">Join</a>
```

**Step 3: Fix footer links**

Search for all `<a>` tags in the footer. Change every `href="#section-name"` to `href="#home"` and every `onclick="showSection('anything')"` to `onclick="showSection('home')"`. Keep link text the same — only the destination changes.

**Step 4: Verify**
Open `bayou-family-fishing.html` in browser. Confirm:
- [ ] No subtitle under logo
- [ ] Tab reads "Join" not "Club/Join"
- [ ] All footer links navigate to home section

**Step 5: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: rename join tab, remove logo subtitle, fix footer links"
```

---

## Task 2: Home Page — Stats & Mission Statement

**Files:**
- Modify: `bayou-family-fishing.html` — home section

**Step 1: Remove hero stat chips**

Search for `5 Boats` — delete the entire stats/chips container block that holds "5 Boats", "INNISFREE Land", and "100% Community Built". It will look something like:
```html
<!-- DELETE this entire block: -->
<div class="hero-stats">
  <div class="stat-chip">5 Boats</div>
  <div class="stat-chip">🌿 INNISFREE Land</div>
  <div class="stat-chip">100% Community Built</div>
</div>
```

**Step 2: Replace mission statement**

Find the existing mission/tagline paragraph in the home section and replace its text content with:
```
Coastal living is hard work, but the rewards are plenty. Our mission is to share our way of life with those who serve our nation and our communities. We're military families—we've been there, stretched thin, missing birthdays, missing dinner; and we see you. We are here for our military heroes, our cops and fire fighters, our first responders, educators, and caregivers. You're the ones who show up because others can't. We are all in this together—now let get out on the water!
```

**Step 3: Verify**
- [ ] No stat chips visible in hero
- [ ] New mission statement displays correctly

**Step 4: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: update home mission statement, remove hero stat chips"
```

---

## Task 3: CSS Color Theme — Water / Sky / Golden Hour

**Files:**
- Modify: `bayou-family-fishing.html` — `:root` CSS variables block (top of `<style>` tag, ~lines 37–60)

**Step 1: Swap light-mode root variables**

Find the `:root { }` block and replace the color values:
```css
:root {
  --green-deep:  #0d2b3e;   /* was #1a3a2a */
  --green-mid:   #1a4a6b;   /* was #2d5c40 */
  --green-water: #2980b9;   /* was #2d6b5e */
  --amber:       #e8923a;   /* was #c8793a — keep warm */
  --amber-light: #f0a84a;   /* was #e8974a */
  --gold:        #f0c040;   /* was #d4a855 */
  --brown:       #5a6e7f;   /* was #6b3d1e */
  --cream:       #eef6fb;   /* was #f7edd8 */
  --cream-dark:  #d0e8f5;   /* was #ede0c8 */
  --orange:      #e07040;   /* was #d4623a */
  --white:       #f5fbff;   /* was #fdf8f0 */
  --text-dark:   #0d1f2d;   /* was #1e2a1e */
  --text-mid:    #2c5364;   /* was #3d4f3a */
}
```

**Step 2: Swap dark-mode variables**

Find the `[data-theme="dark"]` block and update to match:
```css
[data-theme="dark"] {
  --green-deep:  #0a1520;
  --cream:       #0f2233;
  --white:       #0a1520;
  --text-dark:   #d4e8f5;
  --text-mid:    #7aaec8;
  --cream-dark:  #152840;
}
```
Amber and gold stay the same in dark mode (brand consistency).

**Step 3: Verify**
Open in browser. Scroll through all 8 sections. Confirm:
- [ ] No green tones remain — site feels blue/water-toned
- [ ] Amber/gold CTAs still pop against dark backgrounds
- [ ] Toggle dark mode — everything reads clearly
- [ ] Nav, cards, forms, footer all use the new palette

**Step 4: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: rebrand color theme to water/sky/golden hour palette"
```

---

## Task 4: INNISFREE — Satellite Map Tiles

**Files:**
- Modify: `bayou-family-fishing.html` — Leaflet map initialization JS (~`initInnisfreeMap` function)

**Step 1: Replace tile layer**

Find the `L.tileLayer(` call inside `initInnisfreeMap`. Replace the entire tileLayer line:
```js
// BEFORE (OpenStreetMap):
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// AFTER (Esri satellite):
L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  }
).addTo(map);
```

**Step 2: Verify**
Navigate to the INNISFREE section. Confirm:
- [ ] Satellite imagery loads (aerial photo of the bayou area)
- [ ] All 3 markers still visible and clickable
- [ ] Popups still show correct descriptions
- [ ] No console errors

**Step 3: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: switch INNISFREE map to Esri satellite imagery"
```

---

## Task 5: Volunteer Page Updates

**Files:**
- Modify: `bayou-family-fishing.html` — volunteer/rodeo section

**Step 1: Add LDWF fishing license link**

Find the fishing license notice (amber notice block in the RSVP section). Add a link below or within it:
```html
<p class="license-notice">
  All attendees are responsible for purchasing their own valid Louisiana fishing license before the event.
  <a href="https://louisianaoutdoors.com/licenses-and-permits?utm_source=Rec_Fishing_Licensing_Page&utm_medium=Web&utm_campaign=LDWF_Website"
     target="_blank" rel="noopener noreferrer"
     style="color: var(--amber); text-decoration: underline;">
    Buy your license here →
  </a>
</p>
```

**Step 2: Add age gate to liability checkbox**

Find the liability waiver checkbox (search for `liability` or `release Bayou Charity`).

Add an age confirmation checkbox ABOVE the liability checkbox:
```html
<label class="form-check">
  <input type="checkbox" id="ageConfirm" name="age_confirm" required
    onchange="document.getElementById('liabilityCheck').disabled = !this.checked;">
  I confirm that I am 18 years of age or older.
</label>

<!-- Existing liability checkbox — add disabled attribute: -->
<label class="form-check">
  <input type="checkbox" id="liabilityCheck" name="liability" required disabled>
  I release Bayou Charity &amp; Slowdown Park LLC from claims...
</label>
```

Add this CSS to style the disabled state:
```css
input[type="checkbox"]:disabled + span,
input[type="checkbox"]:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Step 3: Update photo consent copy**

Search for: `I give Bayou Charity permission to take photos and videos of me and my children`
Replace with: `I give Bayou Charity permission to take photos and videos of my family and me.`

**Step 4: Verify**
- [ ] LDWF link appears, opens in new tab
- [ ] Liability checkbox is greyed out until age confirm is checked
- [ ] New consent wording displays correctly

**Step 5: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: add LDWF license link, age gate on liability, update consent copy"
```

---

## Task 6: Donation Page — Full Overhaul

**Files:**
- Modify: `bayou-family-fishing.html` — donate section

**Step 1: Replace main description**

Find the paragraph that begins "Your donation directly funds boat maintenance..." and replace:
```html
<p>Your donation directly funds our fishing programs for military and other community service families. Your generosity also helps us build the charity's offshore hub, Innisfree, where members have access to the full Louisiana experience.</p>
```

**Step 2: Update destination dropdown labels**

Find the `<select>` for donation destination. Update `<option>` text:
```html
<option value="innisfree">Innisfree construction</option>
<option value="boats">Boating for Vets</option>
<option value="community">Community support</option>
```

**Step 3: Update "Support Mom & Pops" section heading**

Search for `Support Local Businesses` → replace with `Support Mom & Pops`

**Step 4: Replace business cards**

Find the local business cards container and replace all cards with:
```html
<div class="biz-card">
  <h4>Operation Healing Waters / Reel O-Fishal Charters</h4>
  <p>TikTok: <a href="https://tiktok.com/@reelofishal" target="_blank" rel="noopener">@reelofishal</a></p>
  <p>Capt. Derrious Austin</p>
  <p><a href="tel:8503198909">850-319-8909</a></p>
</div>

<div class="biz-card">
  <h4>Sam's Bait by You &amp; Alligator Hunts</h4>
  <p>Capt. Sam Ronquille</p>
  <p><a href="tel:5049065812">504-906-5812</a></p>
</div>

<div class="biz-card">
  <h4>Slow Down Park: Fishing Camp and RV Park</h4>
  <p>Airbnb &amp; VRBO</p>
  <p>Kyle Rockefeller</p>
  <p><a href="tel:5045411838">504-541-1838</a></p>
</div>
```

**Step 5: Replace "Your Impact" amounts**

Find the impact grid/list and replace all entries:
```html
<div class="impact-item">
  <span class="impact-amount">$50</span>
  <span class="impact-desc">Covers fuel for member-supported fishing trips</span>
</div>
<div class="impact-item">
  <span class="impact-amount">$100</span>
  <span class="impact-desc">Covers a beginner's class and a day of dock fishing for a BFF family</span>
</div>
<div class="impact-item">
  <span class="impact-amount">$250</span>
  <span class="impact-desc">Covers a parent and child fishing trip with a licensed guide</span>
</div>
<div class="impact-item">
  <span class="impact-amount">$500</span>
  <span class="impact-desc">Covers a family of 4 fishing trip with a licensed guide</span>
</div>
```

**Step 6: Add Guides section to donation page**

After the business cards / impact section, insert a new "Our Guides" block:
```html
<div class="guides-section" data-scroll="fade-up">
  <h3 class="section-sub-heading">Our Guides</h3>
  <p class="guides-intro">These trusted guides support BFF's mission and offer exceptional Louisiana fishing experiences.</p>
  <div class="guides-grid">

    <div class="guide-card">
      <h4>Reel O-Fishal Charters</h4>
      <p class="guide-captain">Capt. Derrious Austin</p>
      <p>TikTok: <a href="https://tiktok.com/@reelofishal" target="_blank" rel="noopener">@reelofishal</a></p>
      <p><a href="tel:8503198909">850-319-8909</a></p>
    </div>

    <div class="guide-card">
      <h4>Down South Fishing Charters</h4>
      <p class="guide-captain">Capt. Kevin Hezeau</p>
      <p><a href="https://www.downsouthfishingchartersnola.com/" target="_blank" rel="noopener">downsouthfishingchartersnola.com</a></p>
      <p><a href="tel:9857681656">985-768-1656</a></p>
    </div>

    <div class="guide-card">
      <h4>Bayou Paradise Fish Charters</h4>
      <p class="guide-captain">Capt. Mitchel Haydel</p>
      <p><a href="https://www.geauxfishneworleans.com/" target="_blank" rel="noopener">geauxfishneworleans.com</a></p>
      <p><a href="tel:5043450865">504-345-0865</a></p>
    </div>

    <div class="guide-card">
      <h4>Marsh Assassins BowFishing</h4>
      <p class="guide-captain">Capt. Kenny Bergman</p>
      <p><a href="https://www.marshassassinsbowfishing.com/" target="_blank" rel="noopener">marshassassinsbowfishing.com</a></p>
    </div>

  </div>
</div>
```

Add CSS for guide cards (inside `<style>` block):
```css
.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
  margin-top: 1.5rem;
}
.guide-card {
  background: var(--cream-dark);
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  border: 1px solid var(--green-water);
}
.guide-card h4 {
  font-family: 'Playfair Display', serif;
  color: var(--green-deep);
  margin-bottom: 0.3rem;
}
.guide-captain {
  font-style: italic;
  color: var(--amber);
  margin-bottom: 0.5rem;
}
.guide-card a {
  color: var(--green-water);
  text-decoration: none;
}
.guide-card a:hover { text-decoration: underline; }
```

**Step 7: Verify**
- [ ] New description shows
- [ ] Dropdown labels updated
- [ ] "Support Mom & Pops" heading shows
- [ ] 3 new business cards display
- [ ] 4 new impact amounts correct
- [ ] Guides section appears with all 4 guides and working links

**Step 8: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: overhaul donation page — copy, businesses, impact amounts, guides section"
```

---

## Task 7: About Page — Max Juge Bio

**Files:**
- Modify: `bayou-family-fishing.html` — about section, Max Juge team card

**Step 1: Update bio**

Find Max Juge's bio text (search for `Max Juge`). Replace the `<p>` bio paragraph with:
```html
<p>A full-time commercial real estate professional with a deep-rooted passion for the outdoors and the unique culture of South Louisiana. Having grown up fishing and hunting the salt marshes of Plaquemines Parish, Max brings a local's perspective and appreciation for the region to his work and life.</p>
```

**Step 2: Verify**
- [ ] Max Juge card shows updated bio

**Step 3: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: update Max Juge bio"
```

---

## Task 8: Supabase — Project Setup & Schema

**Context:** Do this in Supabase dashboard, not in code. Use the Supabase MCP connector if available.

**Step 1: Run schema migration**

In Supabase dashboard → SQL Editor, run:
```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  role          text NOT NULL DEFAULT 'member',   -- member | guide | admin
  status        text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  joined_at     timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Fishing pins
CREATE TABLE pins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url     text NOT NULL,
  lat           float8 NOT NULL,
  lng           float8 NOT NULL,
  location_name text,
  caption       text,
  species       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  flagged       boolean NOT NULL DEFAULT false
);

-- Comments
CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id     uuid REFERENCES pins(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Step 2: Enable Row-Level Security**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read approved profiles; only self can update own (non-role fields)
CREATE POLICY "read approved profiles" ON profiles
  FOR SELECT USING (status = 'approved' OR auth.uid() = id);

CREATE POLICY "update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()));
  -- Prevents self-promotion: role can only be changed by admin via service role

-- Pins: approved members can read all; only owner inserts/deletes their own
CREATE POLICY "approved members read pins" ON pins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "owner inserts pin" ON pins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "owner deletes own pin" ON pins
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: same pattern
CREATE POLICY "approved members read comments" ON comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "approved members insert comment" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "owner deletes own comment" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

**Step 3: Create storage bucket**

In Supabase dashboard → Storage → New Bucket:
- Name: `pin-photos`
- Public: YES (photos are visible to all members)
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/heic`

Add storage policy (SQL Editor):
```sql
CREATE POLICY "approved members upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pin-photos' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "public read pin photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pin-photos');
```

**Step 4: Set Kyle as admin**

After Kyle signs in for the first time (creates his profile), run in SQL Editor:
```sql
-- Replace with Kyle's actual user ID from auth.users table
UPDATE profiles SET role = 'admin', status = 'approved'
WHERE id = '<kyle-user-uuid>';
```

**Step 5: Note your credentials**

From Supabase Settings → API, note:
- `Project URL` → will be `SUPABASE_URL` in the code
- `anon public` key → will be `SUPABASE_ANON_KEY` in the code

**Step 6: Verify in Supabase dashboard**
- [ ] `profiles`, `pins`, `comments` tables visible in Table Editor
- [ ] `pin-photos` bucket created in Storage
- [ ] RLS enabled on all 3 tables (shown as shield icon)

---

## Task 9: Member Portal — HTML Structure & Supabase SDK

**Files:**
- Modify: `bayou-family-fishing.html`

**Step 1: Add Supabase SDK before closing `</head>`**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

**Step 2: Add "Members" nav link**

In the nav bar, after the last nav link (About), add:
```html
<a href="#members" class="nav-link" onclick="showSection('members'); return false;">Members</a>
```

**Step 3: Add Members section HTML**

After the last `</section>` and before the `<footer>`, add:
```html
<section id="members" class="site-section" style="display:none;">
  <div class="container">

    <!-- AUTH VIEW: shown when logged out -->
    <div id="membersAuth" class="members-auth-view">
      <h2 class="section-heading">Member Portal</h2>
      <p class="section-tagline">Sign in to access the BFF member map and community.</p>
      <div class="auth-buttons">
        <button class="btn btn-primary" id="btnGoogleSignIn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="margin-right:8px;vertical-align:middle;">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
        <button class="btn btn-primary" id="btnFacebookSignIn" style="background:#1877f2; margin-top:0.8rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="margin-right:8px;vertical-align:middle;">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Sign in with Facebook
        </button>
      </div>
      <p class="auth-note">New members are reviewed by our admin before gaining access. You'll receive an email once approved.</p>
    </div>

    <!-- PENDING VIEW: signed in but not yet approved -->
    <div id="membersPending" class="members-pending-view" style="display:none;">
      <div class="pending-card">
        <div class="pending-icon">🎣</div>
        <h3>You're on the list!</h3>
        <p>Your account is awaiting approval. Kyle will review your signup and you'll receive an email once you're in.</p>
        <button class="btn btn-outline" id="btnSignOut">Sign Out</button>
      </div>
    </div>

    <!-- MEMBER VIEW: approved members -->
    <div id="membersMain" class="members-main-view" style="display:none;">
      <div class="members-nav">
        <button class="member-tab active" data-tab="map" onclick="switchMemberTab('map',this)">🗺 Map</button>
        <button class="member-tab" data-tab="feed" onclick="switchMemberTab('feed',this)">📸 Feed</button>
        <button class="member-tab admin-only" data-tab="admin" onclick="switchMemberTab('admin',this)" style="display:none;">⚙️ Admin</button>
        <div class="member-user-info">
          <img id="memberAvatar" src="" alt="avatar" class="member-avatar">
          <span id="memberName"></span>
          <button class="btn btn-outline btn-sm" id="btnMemberSignOut">Sign Out</button>
        </div>
      </div>

      <!-- MAP TAB -->
      <div id="memberTabMap" class="member-tab-content">
        <div id="memberMap" style="height:450px; border-radius:12px; overflow:hidden;"></div>
        <div class="pin-post-form" id="pinPostForm" style="display:none;">
          <h4>📍 Post Your Catch</h4>
          <input type="file" id="pinPhoto" accept="image/*" required>
          <input type="text" id="pinSpecies" placeholder="Species caught (e.g. Redfish, Speckled Trout)" class="form-input">
          <input type="text" id="pinCaption" placeholder="Caption (optional)" class="form-input">
          <input type="text" id="pinLocationName" placeholder="Location name (optional)" class="form-input">
          <p id="pinLatLngDisplay" class="pin-coords-display"></p>
          <div class="pin-form-actions">
            <button class="btn btn-primary" id="btnSubmitPin">Post Pin</button>
            <button class="btn btn-outline" id="btnCancelPin">Cancel</button>
          </div>
        </div>
        <button class="btn btn-primary" id="btnDropPin" style="margin-top:1rem;">
          + Drop a Pin Here
        </button>
      </div>

      <!-- FEED TAB -->
      <div id="memberTabFeed" class="member-tab-content" style="display:none;">
        <div id="feedList" class="feed-list">
          <p class="feed-empty">Loading catches...</p>
        </div>
      </div>

      <!-- ADMIN TAB -->
      <div id="memberTabAdmin" class="member-tab-content" style="display:none;">
        <h3>Pending Accounts</h3>
        <div id="adminPendingList" class="admin-list">
          <p>Loading...</p>
        </div>
        <h3 style="margin-top:2rem;">Flagged Posts</h3>
        <div id="adminFlaggedList" class="admin-list">
          <p>Loading...</p>
        </div>
      </div>
    </div>

  </div>
</section>
```

**Step 4: Add member portal CSS**

Inside the `<style>` block, add at the end (before `</style>`):
```css
/* ── MEMBER PORTAL ─────────────────────────────────── */
.members-auth-view, .members-pending-view {
  max-width: 480px;
  margin: 80px auto;
  text-align: center;
}
.auth-buttons { margin: 2rem 0 1rem; }
.auth-note {
  font-size: 0.85rem;
  color: var(--text-mid);
  font-style: italic;
}
.pending-card {
  background: var(--cream);
  border: 2px solid var(--amber);
  border-radius: 16px;
  padding: 3rem 2rem;
  max-width: 440px;
  margin: 80px auto;
}
.pending-icon { font-size: 3rem; margin-bottom: 1rem; }
.members-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  border-bottom: 2px solid var(--cream-dark);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.member-tab {
  background: var(--cream-dark);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  font-family: 'Lora', serif;
  color: var(--text-dark);
  transition: background 0.2s;
}
.member-tab.active {
  background: var(--green-deep);
  color: var(--white);
}
.member-user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
}
.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.btn-sm { padding: 0.3rem 0.8rem; font-size: 0.8rem; }
.pin-post-form {
  background: var(--cream);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid var(--cream-dark);
}
.pin-post-form h4 {
  font-family: 'Playfair Display', serif;
  color: var(--green-deep);
  margin-bottom: 1rem;
}
.pin-coords-display {
  font-size: 0.8rem;
  color: var(--text-mid);
  font-style: italic;
}
.pin-form-actions { display: flex; gap: 0.8rem; margin-top: 1rem; }
.feed-list { display: flex; flex-direction: column; gap: 1.5rem; }
.feed-card {
  background: var(--cream);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--cream-dark);
}
.feed-card-photo { width: 100%; max-height: 320px; object-fit: cover; }
.feed-card-body { padding: 1rem 1.2rem; }
.feed-card-meta {
  font-size: 0.8rem;
  color: var(--text-mid);
  margin-bottom: 0.4rem;
}
.feed-card-caption { margin-bottom: 0.8rem; }
.comments-section { border-top: 1px solid var(--cream-dark); padding-top: 0.8rem; }
.comment-item { font-size: 0.85rem; margin-bottom: 0.4rem; }
.comment-author { font-weight: 600; color: var(--green-deep); }
.comment-input-row { display: flex; gap: 0.5rem; margin-top: 0.6rem; }
.comment-input-row input { flex: 1; }
.admin-list { display: flex; flex-direction: column; gap: 1rem; margin: 1rem 0; }
.admin-card {
  background: var(--cream);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--cream-dark);
}
.admin-card-info { flex: 1; }
.admin-card-actions { display: flex; gap: 0.5rem; }
.btn-approve { background: var(--green-water); color: white; border: none; border-radius: 6px; padding: 0.3rem 0.8rem; cursor: pointer; }
.btn-reject  { background: var(--orange); color: white; border: none; border-radius: 6px; padding: 0.3rem 0.8rem; cursor: pointer; }
.feed-empty, .admin-empty { color: var(--text-mid); font-style: italic; text-align: center; padding: 2rem; }
```

**Step 5: Commit structure**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: add member portal HTML structure, CSS, and Supabase SDK"
```

---

## Task 10: Member Portal — JavaScript (Auth + Map + Feed + Admin)

**Files:**
- Modify: `bayou-family-fishing.html` — JS block at bottom

**Step 1: Initialize Supabase client**

At the TOP of the `<script>` block (before any other functions), add:
```js
// ── SUPABASE CONFIG ─────────────────────────────────
const SUPABASE_URL  = 'YOUR_PROJECT_URL';   // from Supabase Settings → API
const SUPABASE_ANON = 'YOUR_ANON_KEY';      // from Supabase Settings → API
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
let _currentUser    = null;
let _currentProfile = null;
let _memberMap      = null;
let _pendingPin     = null;  // { lat, lng } while placing a pin
```

**Step 2: Add auth state listener**

Add this function and call it on page load:
```js
async function initMemberAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) await handleAuthUser(session.user);

  _supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      await handleAuthUser(session.user);
    } else {
      _currentUser = null;
      _currentProfile = null;
      showMembersView('auth');
    }
  });
}

async function handleAuthUser(user) {
  _currentUser = user;
  const { data: profile } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  _currentProfile = profile;

  if (!profile || profile.status === 'pending') {
    showMembersView('pending');
  } else if (profile.status === 'approved') {
    showMembersView('main');
    loadMemberMain();
  }
}

function showMembersView(view) {
  document.getElementById('membersAuth').style.display    = view === 'auth'    ? '' : 'none';
  document.getElementById('membersPending').style.display = view === 'pending' ? '' : 'none';
  document.getElementById('membersMain').style.display    = view === 'main'    ? '' : 'none';
}
```

**Step 3: Wire sign-in and sign-out buttons**

```js
document.getElementById('btnGoogleSignIn').addEventListener('click', async () => {
  await _supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/#members' }
  });
});

document.getElementById('btnFacebookSignIn').addEventListener('click', async () => {
  await _supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: window.location.origin + '/#members' }
  });
});

document.getElementById('btnSignOut')?.addEventListener('click', () => _supabase.auth.signOut());
document.getElementById('btnMemberSignOut')?.addEventListener('click', () => _supabase.auth.signOut());
```

**Step 4: Load member main view**

```js
function loadMemberMain() {
  // Set user display info
  document.getElementById('memberName').textContent = _currentProfile.display_name || _currentUser.email;
  const avatar = document.getElementById('memberAvatar');
  avatar.src = _currentProfile.avatar_url || '';
  avatar.style.display = _currentProfile.avatar_url ? '' : 'none';

  // Show admin tab if admin
  if (_currentProfile.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
  }

  initMemberMap();
  loadFeed();
  if (_currentProfile.role === 'admin') loadAdminQueues();
}
```

**Step 5: Member map initialization**

```js
function initMemberMap() {
  if (_memberMap) return; // already initialized

  _memberMap = L.map('memberMap').setView([29.58, -89.92], 13);

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', maxZoom: 18 }
  ).addTo(_memberMap);

  // Click map to place pin
  _memberMap.on('click', function(e) {
    if (!document.getElementById('pinPostForm').style.display ||
        document.getElementById('pinPostForm').style.display === 'none') {
      _pendingPin = { lat: e.latlng.lat, lng: e.latlng.lng };
      document.getElementById('pinLatLngDisplay').textContent =
        `Pin location: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
      document.getElementById('pinPostForm').style.display = '';
      document.getElementById('btnDropPin').style.display = 'none';
    }
  });

  document.getElementById('btnDropPin').addEventListener('click', () => {
    showToast('Drop a Pin', 'Click anywhere on the map to place your pin.');
  });

  document.getElementById('btnCancelPin').addEventListener('click', () => {
    _pendingPin = null;
    document.getElementById('pinPostForm').style.display = 'none';
    document.getElementById('btnDropPin').style.display = '';
  });

  document.getElementById('btnSubmitPin').addEventListener('click', submitPin);

  // Load existing pins
  loadMapPins();
}

async function loadMapPins() {
  const { data: pins } = await _supabase
    .from('pins')
    .select('*, profiles(display_name)')
    .order('created_at', { ascending: false });

  if (!pins) return;
  pins.forEach(pin => addPinMarker(pin));
}

function addPinMarker(pin) {
  const marker = L.marker([pin.lat, pin.lng]).addTo(_memberMap);
  const date = new Date(pin.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  const time = new Date(pin.created_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  marker.bindPopup(`
    <div style="max-width:220px;">
      <img src="${pin.photo_url}" style="width:100%;border-radius:6px;margin-bottom:6px;" />
      <strong>${pin.profiles?.display_name || 'Member'}</strong><br>
      ${pin.species ? `🐟 ${pin.species}<br>` : ''}
      ${pin.caption ? `<em>${pin.caption}</em><br>` : ''}
      <small>📍 ${pin.location_name || ''} &bull; ${date} ${time}</small>
    </div>
  `);
}
```

**Step 6: GPS extraction + pin submission**

```js
async function submitPin() {
  const fileInput = document.getElementById('pinPhoto');
  if (!fileInput.files[0]) { showToast('Missing photo', 'Please select a photo.'); return; }
  if (!_pendingPin) { showToast('No pin placed', 'Click the map to place your pin first.'); return; }

  // Try GPS from EXIF (requires exif-js or manual parse — use simple fallback)
  // For now, use manually placed pin coordinates (GPS extraction can be added later)
  const lat = _pendingPin.lat;
  const lng = _pendingPin.lng;

  const btn = document.getElementById('btnSubmitPin');
  btn.textContent = 'Posting...';
  btn.disabled = true;

  try {
    // Upload photo
    const file = fileInput.files[0];
    const fileName = `${_currentUser.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await _supabase.storage
      .from('pin-photos')
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = _supabase.storage
      .from('pin-photos')
      .getPublicUrl(fileName);

    // Insert pin record
    const { error: insertError } = await _supabase.from('pins').insert({
      user_id:       _currentUser.id,
      photo_url:     publicUrl,
      lat, lng,
      location_name: document.getElementById('pinLocationName').value,
      caption:       document.getElementById('pinCaption').value,
      species:       document.getElementById('pinSpecies').value,
    });

    if (insertError) throw insertError;

    showToast('Pin posted! 🎣', 'Your catch is on the map.');
    document.getElementById('pinPostForm').style.display = 'none';
    document.getElementById('btnDropPin').style.display = '';
    _pendingPin = null;
    fileInput.value = '';
    document.getElementById('pinCaption').value = '';
    document.getElementById('pinSpecies').value = '';
    document.getElementById('pinLocationName').value = '';
    loadMapPins(); // refresh
    loadFeed();

  } catch (err) {
    showToast('Error', err.message);
    btn.textContent = 'Post Pin';
    btn.disabled = false;
  }
}
```

**Step 7: Feed**

```js
async function loadFeed() {
  const feedEl = document.getElementById('feedList');
  feedEl.innerHTML = '<p class="feed-empty">Loading catches...</p>';

  const { data: pins } = await _supabase
    .from('pins')
    .select('*, profiles(display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!pins || pins.length === 0) {
    feedEl.innerHTML = '<p class="feed-empty">No catches posted yet. Be the first! 🎣</p>';
    return;
  }

  feedEl.innerHTML = pins.map(pin => {
    const date = new Date(pin.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    return `
      <div class="feed-card" data-pin-id="${pin.id}">
        <img class="feed-card-photo" src="${pin.photo_url}" alt="Fishing photo" loading="lazy">
        <div class="feed-card-body">
          <div class="feed-card-meta">
            <strong>${pin.profiles?.display_name || 'Member'}</strong> &bull;
            ${pin.species ? `🐟 ${pin.species} &bull; ` : ''}
            ${date}
            ${pin.location_name ? ` &bull; 📍 ${pin.location_name}` : ''}
          </div>
          ${pin.caption ? `<p class="feed-card-caption">${pin.caption}</p>` : ''}
          <div class="comments-section" id="comments-${pin.id}">
            <p class="feed-empty" style="padding:0.4rem 0;">Loading comments...</p>
          </div>
          <div class="comment-input-row">
            <input class="form-input" type="text" placeholder="Add a comment…"
              id="commentInput-${pin.id}" onkeydown="if(event.key==='Enter') postComment('${pin.id}')">
            <button class="btn btn-primary btn-sm" onclick="postComment('${pin.id}')">Post</button>
          </div>
        </div>
      </div>`;
  }).join('');

  pins.forEach(pin => loadComments(pin.id));
}

async function loadComments(pinId) {
  const el = document.getElementById(`comments-${pinId}`);
  if (!el) return;

  const { data: comments } = await _supabase
    .from('comments')
    .select('*, profiles(display_name)')
    .eq('pin_id', pinId)
    .order('created_at', { ascending: true });

  if (!comments || comments.length === 0) {
    el.innerHTML = '<p class="feed-empty" style="padding:0.4rem 0;font-size:0.8rem;">No comments yet.</p>';
    return;
  }

  el.innerHTML = comments.map(c => `
    <div class="comment-item">
      <span class="comment-author">${c.profiles?.display_name || 'Member'}:</span>
      ${c.body}
    </div>`).join('');
}

async function postComment(pinId) {
  const input = document.getElementById(`commentInput-${pinId}`);
  const body = input.value.trim();
  if (!body) return;

  const { error } = await _supabase.from('comments').insert({
    pin_id: pinId,
    user_id: _currentUser.id,
    body
  });

  if (error) { showToast('Error', error.message); return; }
  input.value = '';
  loadComments(pinId);
}
```

**Step 8: Admin panel**

```js
async function loadAdminQueues() {
  // Pending accounts
  const { data: pending } = await _supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .order('joined_at', { ascending: true });

  const pendingEl = document.getElementById('adminPendingList');
  if (!pending || pending.length === 0) {
    pendingEl.innerHTML = '<p class="admin-empty">No pending accounts.</p>';
  } else {
    pendingEl.innerHTML = pending.map(p => `
      <div class="admin-card">
        <div class="admin-card-info">
          <strong>${p.display_name || '(no name)'}</strong><br>
          <small>Role requested: ${p.role} &bull; Joined: ${new Date(p.joined_at).toLocaleDateString()}</small>
        </div>
        <div class="admin-card-actions">
          <button class="btn-approve" onclick="approveUser('${p.id}')">Approve</button>
          <button class="btn-reject"  onclick="rejectUser('${p.id}')">Reject</button>
        </div>
      </div>`).join('');
  }

  // Flagged posts
  const { data: flagged } = await _supabase
    .from('pins')
    .select('*, profiles(display_name)')
    .eq('flagged', true);

  const flaggedEl = document.getElementById('adminFlaggedList');
  if (!flagged || flagged.length === 0) {
    flaggedEl.innerHTML = '<p class="admin-empty">No flagged posts.</p>';
  } else {
    flaggedEl.innerHTML = flagged.map(p => `
      <div class="admin-card">
        <img src="${p.photo_url}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
        <div class="admin-card-info">
          <strong>${p.profiles?.display_name}</strong> &bull; ${p.caption || ''}
        </div>
        <div class="admin-card-actions">
          <button class="btn-reject" onclick="removePin('${p.id}')">Remove</button>
        </div>
      </div>`).join('');
  }
}

async function approveUser(userId) {
  // Requires service role key for this — use Supabase Edge Function or manual dashboard update
  // For now, direct Kyle to approve via Supabase dashboard Table Editor
  showToast('Action required', 'Approve this user in the Supabase dashboard → profiles table → set status to approved.');
}

async function rejectUser(userId) {
  showToast('Action required', 'Reject this user in the Supabase dashboard → profiles table → set status to rejected.');
}

async function removePin(pinId) {
  const { error } = await _supabase.from('pins').delete().eq('id', pinId);
  if (error) showToast('Error', error.message);
  else { showToast('Removed', 'Post removed.'); loadAdminQueues(); loadFeed(); }
}
```

> **Note on admin approve/reject:** Direct row updates to `profiles.status` require a service role key (not safe to embed in client HTML). The cleanest Phase 1 solution is Kyle uses the Supabase dashboard. For Phase 2, add a Supabase Edge Function that accepts a signed request from Kyle's admin session to approve/reject accounts safely server-side.

**Step 9: Member tab switching**

```js
function switchMemberTab(tab, btn) {
  document.querySelectorAll('.member-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.member-tab-content').forEach(el => el.style.display = 'none');
  document.getElementById(`memberTab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).style.display = '';
  if (tab === 'map' && _memberMap) setTimeout(() => _memberMap.invalidateSize(), 100);
}
```

**Step 10: Wire initMemberAuth into page load**

Find the existing `window.addEventListener('load', ...)` or DOMContentLoaded block and add:
```js
initMemberAuth();
```

**Step 11: Commit**
```bash
git add "bayou-family-fishing.html"
git commit -m "feat: member portal — auth, map pins, feed, comments, admin panel"
```

---

## Task 11: Final Sync & Deploy

**Step 1: Full visual QA checklist**
- [ ] Home: no stat chips, new mission statement, water/sky/gold palette throughout
- [ ] Nav: "Join" tab, no logo subtitle, new "Members" tab
- [ ] Footer: all links go to home
- [ ] Volunteer: LDWF link present, age gate works on liability checkbox, consent copy updated
- [ ] Donate: new description, updated dropdowns, "Support Mom & Pops", 3 new business cards, new impact amounts, guides section with 4 guides
- [ ] About: Max Juge bio updated
- [ ] INNISFREE: satellite tiles load, all 3 markers present
- [ ] Members tab: sign-in screen shows when logged out
- [ ] Members tab: Google sign-in works, pending screen shows for unapproved
- [ ] Members tab: approved member sees map + feed
- [ ] Members tab: admin sees Admin tab with pending queue
- [ ] Dark mode: all sections legible in both light and dark

**Step 2: Sync working file to index.html**
```bash
cp "bayou-family-fishing.html" index.html
```

**Step 3: Final commit and push**
```bash
git add bayou-family-fishing.html index.html
git commit -m "feat: session 8 — full overhaul, member portal, rebrand, satellite map"
git push origin main
```

Cloudflare Pages will auto-deploy within ~60 seconds of the push.

**Step 4: Post-deploy checks**
- [ ] Visit bayoucharity.org — site loads on new palette
- [ ] Navigate all tabs
- [ ] Test Google sign-in on live domain
- [ ] Kyle can sign in and sees admin tab (after his profile is set to admin in Supabase)
- [ ] Test pin drop on member map

---

## Known Phase 2 Items (future session)

- Admin approve/reject directly from the site (requires Supabase Edge Function)
- GPS EXIF extraction from photo files
- Trip planning calendar (post future trips, join others, guide last-minute discounts)
- Historical fishing record view (filter by month/location/species, heatmap overlay)
- Apple Sign-In (add to Supabase auth providers when ready)
