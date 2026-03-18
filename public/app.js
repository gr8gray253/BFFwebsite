  // ─── SECTION NAVIGATION ───
  const VALID_SECTIONS = ['home','gallery','volunteer','boats','innisfree','donate','about','members'];
  let _innisfreeMapReady = false;
  let _leafletMap = null;

  // ─── SUPABASE CLIENT (shared — gallery + members both use this) ───
  var _SUPABASE_URL = 'https://osiramhnynhwmlfyuqcp.supabase.co';
  var _SUPABASE_KEY = 'sb_publishable_yS9pPiw1F7QuxGcWVAyLXw_oZMI9HCI';
  var _sbShared = null;
  function getSB() {
    if (!_sbShared) _sbShared = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY, {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true }
    });
    return _sbShared;
  }

  // ── Global XSS utility — available to ALL script code (gallery, members, etc.) ──
  // The member IIFE has its own local escapeHTML for internal use. This global
  // version is needed by loadFishPics() and other functions defined in global scope.
  // DO NOT remove — loadFishPics crashes without this (ReferenceError: escapeHTML).
  function escapeHTML(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function showSection(id, noPush) {
    if (!VALID_SECTIONS.includes(id)) { id = 'home'; }
    document.body.style.overflow = '';
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    const navEl = document.getElementById('nav-' + id);
    if (navEl) navEl.classList.add('active');
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // close mobile menu
    document.getElementById('navLinks').classList.remove('open');
    // Push browser history for back/forward support and deep linking
    if (!noPush) {
      const url = id === 'home' ? window.location.pathname : '#' + id;
      history.pushState({ section: id }, '', url);
    }
    // Refresh home map tiles when home section is shown
    if (id === 'home') {
      setTimeout(() => { if (_homeMap) _homeMap.invalidateSize(); }, 50);
    }
    // Init or refresh INNISFREE map
    if (id === 'innisfree') {
      if (!_innisfreeMapReady) {
        _innisfreeMapReady = true;
        setTimeout(initInnisfreeMap, 50);
      } else if (_leafletMap) {
        setTimeout(() => _leafletMap.invalidateSize(), 50);
      }
    }
    // Refresh member map tiles when members section is shown
    if (id === 'members') {
      setTimeout(function() {
        if (typeof _memberMap !== 'undefined' && _memberMap) _memberMap.invalidateSize();
      }, 100);
    }
    if (id === 'gallery') {
      loadGalleryTabs();
    }
    return false;
  }

  // Back / forward button support
  window.addEventListener('popstate', function(e) {
    const id = (e.state && e.state.section) || 'home';
    if (VALID_SECTIONS.includes(id)) showSection(id, true);
  });

  // Deep-link support: honour #hash on initial page load
  (function() {
    const hash = window.location.hash.replace('#', '');
    if (hash && VALID_SECTIONS.includes(hash)) {
      showSection(hash, true);
      history.replaceState({ section: hash }, '', '#' + hash);
    } else {
      // Preserve query string (PKCE ?code=xxx) AND hash (implicit #access_token=xxx)
      history.replaceState({ section: 'home' }, '', window.location.pathname + window.location.search + window.location.hash);
    }
  })();

  // ─── INNISFREE LEAFLET MAP ───
  function initInnisfreeMap() {
    if (!window.L || !document.getElementById('innisfreeMap')) return;

    _leafletMap = L.map('innisfreeMap', { zoomControl: true }).setView([29.575, -89.930], 12);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
    }).addTo(_leafletMap);

    const mkHome = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#0d2b3e;border:3px solid #c8793a;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10]
    });
    const mkProp = L.divIcon({
      className: '',
      html: '<div style="width:16px;height:16px;border-radius:50%;background:#c8793a;border:3px solid #0d2b3e;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -12]
    });

    L.marker([29.595492887216214, -89.90665602961556], { icon: mkHome })
      .addTo(_leafletMap)
      .bindPopup('<strong style="font-family:Georgia,serif;color:#0d2b3e;">Home Base</strong><br><span style="font-size:0.8rem;color:#2c5364;">Rodeo meeting point &amp; event launch site</span>')
      .openPopup();

    L.marker([29.553418886646913, -89.95388981861294], { icon: mkProp })
      .addTo(_leafletMap)
      .bindPopup('<strong style="font-family:Georgia,serif;color:#0d2b3e;">INNISFREE</strong><br><span style="font-size:0.8rem;color:#2c5364;">Our marshland community hub — under development</span>');

    const mkBait = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#e8923a;border:3px solid #0d2b3e;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10]
    });

    L.marker([29.5549, -89.9545], { icon: mkBait })
      .addTo(_leafletMap)
      .bindPopup('<strong style="font-family:Georgia,serif;color:#0d2b3e;">Sam\'s Bait By You</strong><br><span style="font-size:0.8rem;color:#2c5364;">Capt. Sam Ronquille &nbsp;·&nbsp; 504-906-5812</span>');

    // Fit to show all markers on load — no panning required
    _leafletMap.fitBounds(L.latLngBounds([
      [29.595492887216214, -89.90665602961556],
      [29.553418886646913, -89.95388981861294],
      [29.5549, -89.9545]
    ]), { padding: [40, 40] });
  }

  // ─── HOME PAGE COMPACT MAP ───
  let _homeMap = null;
  function initHomeMap() {
    if (!window.L || !document.getElementById('homeMap') || _homeMap) return;

    _homeMap = L.map('homeMap', {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true
    }).setView([29.575, -89.930], 11);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: ''
    }).addTo(_homeMap);

    const mkSmall = L.divIcon({
      className: '',
      html: '<div style="width:10px;height:10px;border-radius:50%;background:#0d2b3e;border:2px solid #c8793a;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
      iconSize: [10, 10], iconAnchor: [5, 5], popupAnchor: [0, -8]
    });
    const mkBaitSmall = L.divIcon({
      className: '',
      html: '<div style="width:10px;height:10px;border-radius:50%;background:#e8923a;border:2px solid #0d2b3e;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
      iconSize: [10, 10], iconAnchor: [5, 5], popupAnchor: [0, -8]
    });
    const mkPropSmall = L.divIcon({
      className: '',
      html: '<div style="width:12px;height:12px;border-radius:50%;background:#c8793a;border:2px solid #0d2b3e;box-shadow:0 1px 6px rgba(0,0,0,0.5);"></div>',
      iconSize: [12, 12], iconAnchor: [6, 6], popupAnchor: [0, -10]
    });

    L.marker([29.595492887216214, -89.90665602961556], { icon: mkSmall })
      .addTo(_homeMap).bindPopup('Home Base');
    L.marker([29.553418886646913, -89.95388981861294], { icon: mkPropSmall })
      .addTo(_homeMap).bindPopup('INNISFREE');
    L.marker([29.5549, -89.9545], { icon: mkBaitSmall })
      .addTo(_homeMap).bindPopup("Sam's Bait By You");

    // Fit to show all markers on load
    _homeMap.fitBounds(L.latLngBounds([
      [29.595492887216214, -89.90665602961556],
      [29.553418886646913, -89.95388981861294],
      [29.5549, -89.9545]
    ]), { padding: [20, 20] });

    // Force tile + marker redraw after layout settles
    setTimeout(function() { _homeMap.invalidateSize(); }, 200);
  }

  // ─── BOAT STORY TOGGLE ───
  function toggleBoatStory(btn) {
    const body = btn.nextElementSibling;
    const isOpen = !body.hidden;
    body.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
  }

  // ─── HAMBURGER ───
  function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
  }

  // ─── CALENDAR ───
  const _now = new Date();
  let calYear = _now.getFullYear(), calMonth = _now.getMonth();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const bookedDays = [3, 8, 12, 17, 22];
  const availableDays = [5, 7, 9, 10, 14, 16, 18, 21, 24, 26, 28];

  function renderCalendar() {
    const grid = document.getElementById('calGrid');
    const titleEl = document.getElementById('calTitle');
    if (!grid || !titleEl) return;
    titleEl.textContent = months[calMonth] + ' ' + calYear;
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      let cls = 'cal-day';
      if (bookedDays.includes(d)) cls += ' booked';
      else if (availableDays.includes(d)) cls += ' available';
      html += `<div class="${cls}" title="Day ${d}">${d}</div>`;
    }
    grid.innerHTML = html;
  }

  function changeMonth(dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  }

  renderCalendar();

  // ─── APPT TABS ───
  function switchTab(el, id) {
    document.querySelectorAll('.appt-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('byDay').style.display = id === 'byDay' ? 'block' : 'none';
    document.getElementById('byBoat').style.display = id === 'byBoat' ? 'block' : 'none';
  }

  // ─── DONATE AMOUNTS ───
  function selectAmt(el) {
    document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    const isOther = el.textContent === 'Other';
    document.getElementById('otherAmt').style.display = isOther ? 'flex' : 'none';
    document.getElementById('donateAmount').value = isOther ? 'Other' : el.textContent;
  }


  // ─── TOAST ───
  function showToast(title, msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }

  // ─── FOOTER YEAR ───
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // ─── MOBILE NAV: close on outside click ───
  document.addEventListener('click', function(e) {
    const nav = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
    }
  });

  // ─── MOBILE NAV: close on Escape key ───
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.getElementById('navLinks').classList.remove('open');
      closeLightbox();
    }
  });

  // ─── SCROLL-TO-TOP BUTTON ───
  const _scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', function() {
    _scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });


  // ─── GALLERY FUNCTION STUBS (overwritten by Tasks 9 + 10) ───────────────────
  // Prevent ReferenceError if gallery tab opened before Tasks 9/10 run.
  // Task 9 replaces updateGalleryUploadButton with the real implementation.
  // Task 10 replaces loadFishPics with the real implementation.

  async function populateUploadEventPicker() {
    var select = document.getElementById('galleryUploadEvent');
    if (!select) return;

    var { data: events } = await getSB()
      .from('gallery_events')
      .select('id, name')
      .order('sort_order', { ascending: true });

    var html = '';
    if (events && events.length > 0) {
      events.forEach(function(ev) {
        var tabId = (ev.id === BFF_FIRST_EVENT_ID) ? 'seed' : ev.id;
        var selected = (_galleryActiveTab === tabId || _galleryActiveTab === ev.id) ? ' selected' : '';
        html += '<option value="' + ev.id + '"' + selected + '>' + escapeHTML(ev.name) + '</option>';
      });
    }
    var fishSelected = (_galleryActiveTab === 'fish') ? ' selected' : '';
    html += '<option value="fish"' + fishSelected + '>Fish Pics (no event)</option>';
    select.innerHTML = html;
  }

  function openGalleryUploadModal() {
    var modal = document.getElementById('galleryUploadModal');
    if (!modal) return;
    document.getElementById('galleryUploadFile').value = '';
    document.getElementById('galleryUploadCaption').value = '';
    document.getElementById('galleryUploadStatus').textContent = '';
    modal.style.display = 'flex';
    populateUploadEventPicker();
  }

  function closeGalleryUploadModal(e) {
    if (!e || e.target === document.getElementById('galleryUploadModal')) {
      var modal = document.getElementById('galleryUploadModal');
      if (modal) modal.style.display = 'none';
    }
  }

  async function submitGalleryUpload() {
    var fileInput = document.getElementById('galleryUploadFile');
    var caption   = document.getElementById('galleryUploadCaption').value.trim();
    var status    = document.getElementById('galleryUploadStatus');

    if (!fileInput.files || fileInput.files.length === 0) {
      status.textContent = 'Please select a file.'; status.style.color = 'var(--orange)'; return;
    }
    var file = fileInput.files[0];
    var validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validMimes.includes(file.type)) {
      status.textContent = 'Invalid file type. Please upload a JPEG, PNG, WebP, GIF, or MP4 file.';
      status.style.color = 'var(--orange)'; return;
    }
    if (file.size > 50 * 1024 * 1024) {
      status.textContent = 'File too large (max 50MB).'; status.style.color = 'var(--orange)'; return;
    }

    var user = (await getSB().auth.getUser()).data.user;
    if (!user) {
      status.textContent = 'You must be signed in to upload.'; status.style.color = 'var(--orange)'; return;
    }

    status.textContent = 'Uploading…'; status.style.color = 'var(--text-mid)';

    var ext  = file.name.split('.').pop();
    var path = user.id + '/' + Date.now() + '.' + ext;

    var eventSelect = document.getElementById('galleryUploadEvent');
    var eventVal = eventSelect ? eventSelect.value : '';
    var eventId = (eventVal === 'fish' || eventVal === '') ? null : eventVal;

    var { error: uploadErr } = await getSB().storage.from('gallery-pending').upload(path, file);
    if (uploadErr) {
      status.textContent = 'Upload failed: ' + uploadErr.message; status.style.color = 'var(--orange)'; return;
    }

    var { error: dbErr } = await getSB().from('gallery_submissions')
      .insert({ member_id: user.id, event_id: eventId, storage_path: path, caption: caption });
    if (dbErr) {
      status.textContent = 'Saved to storage but DB record failed: ' + dbErr.message; status.style.color = 'var(--orange)'; return;
    }

    status.textContent = 'Submitted! An admin will review your photo before it appears.';
    status.style.color = 'green';
    setTimeout(function() { closeGalleryUploadModal(); }, 2500);
  }

  // Replaces the stub from Task 8 — shows/hides upload bar based on auth state
  function updateGalleryUploadButton() {
    getSB().auth.getUser().then(function(res) {
      var user = res.data && res.data.user;
      var bar  = document.getElementById('galleryUploadBar');
      var hint = document.getElementById('galleryUploadSignInHint');
      if (!bar || !hint) return;
      if (user) { bar.style.display = 'block'; hint.style.display = 'none'; }
      else       { bar.style.display = 'none';  hint.style.display = 'block'; }
    });
  }

  // Replaces the stub from Task 8 — loads fish photos from pins + approved fish uploads
  async function loadFishPics() {
    var container = document.getElementById('galleryFishGrid');
    if (!container) return;
    container.innerHTML = '<p class="gallery-loading">Loading fish photos…</p>';

    var { data: pins } = await getSB()
      .from('pins')
      .select('photo_url, species, caption, created_at')
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    var { data: fishUploads } = await getSB()
      .from('gallery_submissions')
      .select('storage_path, caption, submitted_at')
      .is('event_id', null)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false });

    var html = '';

    if (pins && pins.length > 0) {
      pins.forEach(function(pin) {
        if (!pin.photo_url) return;
        var alt    = pin.species ? escapeHTML(pin.species) + ' caught by a BFF member' : 'Fish catch — BFF member';
        var safeUrl = escapeHTML(pin.photo_url);
        html += '<div class="gallery-thumb" data-action="view-photo" data-url="' + safeUrl + '">'
              + '<img src="' + safeUrl + '" alt="' + alt + '" loading="lazy">'
              + (pin.species || pin.caption
                  ? '<div class="fish-thumb-caption">'
                    + (pin.species ? '<strong>' + escapeHTML(pin.species) + '</strong>' : '')
                    + (pin.caption ? '<br><em>' + escapeHTML(pin.caption) + '</em>' : '')
                    + '</div>'
                  : '')
              + '</div>';
      });
    }

    if (fishUploads && fishUploads.length > 0) {
      fishUploads.forEach(function(sub) {
        var url     = getSB().storage.from('gallery-public').getPublicUrl(sub.storage_path).data.publicUrl;
        var safeUrl = escapeHTML(url);
        html += '<div class="gallery-thumb" data-action="view-photo" data-url="' + safeUrl + '">'
              + '<img src="' + safeUrl + '" alt="' + escapeHTML(sub.caption || 'Fish photo') + '" loading="lazy">'
              + (sub.caption ? '<div class="fish-thumb-caption"><em>' + escapeHTML(sub.caption) + '</em></div>' : '')
              + '</div>';
      });
    }

    container.innerHTML = html || '<p class="gallery-loading">No fish photos yet — drop a pin in the Members tab!</p>';
  }
  // ─── END STUBS ───────────────────────────────────────────────────────────────

  // ─── GALLERY CONSTANTS ───
  var BFF_FIRST_EVENT_ID = 'c9fb742c-6785-41f8-9598-687cb49554de';
  var _galleryActiveTab  = 'seed'; // 'seed' | 'fish' | event uuid

  async function loadGalleryTabs() {
    var strip = document.getElementById('galleryTabStrip');
    if (!strip) return;

    var { data: events, error } = await getSB()
      .from('gallery_events')
      .select('id, name')
      .order('sort_order', { ascending: true });

    if (error || !events || events.length === 0) {
      strip.innerHTML = '<button class="gallery-tab-btn active" data-action="switch-gallery-tab" data-tab-id="seed">BFF 1st Event</button>'
                      + '<button class="gallery-tab-btn" data-action="switch-gallery-tab" data-tab-id="fish">Fish Pics</button>';
      return;
    }

    var html = '';
    events.forEach(function(ev) {
      var tabId  = (ev.id === BFF_FIRST_EVENT_ID) ? 'seed' : ev.id;
      var isFirst = (tabId === 'seed');
      html += '<button class="gallery-tab-btn' + (isFirst ? ' active' : '') + '" '
            + 'data-action="switch-gallery-tab" data-tab-id="' + tabId + '">'
            + escapeHTML(ev.name) + '</button>';

      if (!isFirst) {
        var panel = document.createElement('div');
        panel.id = 'galleryPanel-' + ev.id;
        panel.className = 'gallery-panel';
        panel.innerHTML = '<div class="gallery-grid gallery-dynamic" id="galleryDyn-' + ev.id + '"><p class="gallery-loading">Loading…</p></div>';
        document.getElementById('galleryPanel-seed').parentNode.appendChild(panel);
      }
    });

    // Fish Pics tab always last — hardcoded, not from DB
    html += '<button class="gallery-tab-btn" data-action="switch-gallery-tab" data-tab-id="fish">Fish Pics</button>';
    strip.innerHTML = html;

    updateGalleryUploadButton();

    // Auto-load seed tab's dynamic content (approved member submissions)
    // Without this, dynamic photos only load when user clicks the already-active tab button.
    loadEventSubmissions(BFF_FIRST_EVENT_ID, 'galleryDynamic-seed');
  }

  function switchGalleryTab(tabId, btn) {
    document.querySelectorAll('.gallery-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.gallery-panel').forEach(function(p) { p.classList.remove('active'); p.style.display = 'none'; });
    _galleryActiveTab = tabId;

    if (tabId === 'seed') {
      var p = document.getElementById('galleryPanel-seed');
      if (p) { p.classList.add('active'); p.style.display = ''; }
      loadEventSubmissions(BFF_FIRST_EVENT_ID, 'galleryDynamic-seed');
    } else if (tabId === 'fish') {
      var p = document.getElementById('galleryPanel-fish');
      if (p) { p.classList.add('active'); p.style.display = ''; }
      loadFishPics();
    } else {
      var p = document.getElementById('galleryPanel-' + tabId);
      if (p) { p.classList.add('active'); p.style.display = ''; }
      loadEventSubmissions(tabId, 'galleryDyn-' + tabId);
    }
  }

  async function loadEventSubmissions(eventId, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var { data, error } = await getSB()
      .from('gallery_submissions')
      .select('storage_path, caption, submitted_at')
      .eq('event_id', eventId)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = data.map(function(sub) {
      var url = getSB().storage.from('gallery-public').getPublicUrl(sub.storage_path).data.publicUrl;
      var safeUrl = escapeHTML(url);
      var alt = escapeHTML(sub.caption || 'Member upload');
      return '<div class="gallery-thumb" data-category="community" data-action="view-photo" data-url="' + safeUrl + '">'
           + '<img src="' + safeUrl + '" alt="' + alt + '" loading="lazy">'
           + '</div>';
    }).join('');
  }

  // ─── GALLERY LIGHTBOX ───
  const galleryImages = [
    'Photos/Gallery1.jpg','Photos/Gallery2.jpg','Photos/Gallery3.jpg',
    'Photos/Gallery4.jpg','Photos/Gallery5.jpg','Photos/Gallery6.jpg',
    'Photos/Gallery7.jpg','Photos/Gallery8.jpg','Photos/Gallery9.jpg',
    'Photos/Gallery10.jpg','Photos/Gallery11.jpg','Photos/Gallery12.jpg',
    'Photos/Gallery13.jpg','Photos/Gallery14.jpg','Photos/Gallery15.jpg',
    'Photos/Gallery16.jpg','Photos/Gallery17.jpg','Photos/Gallery18.jpg',
    'Photos/Gallery19.jpg','Photos/Gallery20.jpg','Photos/Gallery21.jpg',
    'Photos/Gallery22.jpg','Photos/Gallery23.jpg','Photos/Gallery24.jpg',
    'Photos/Gallery25.jpg','Photos/Gallery26.jpg','Photos/Gallery27.jpg',
    'Photos/Gallery28.jpg','Photos/Gallery29.jpg','Photos/Gallery30.jpg',
    'Photos/Gallery31.jpg','Photos/Gallery32.jpg','Photos/Gallery33.jpg',
    'Photos/Gallery34.jpg','Photos/Gallery35.jpg','Photos/Gallery36.jpg',
    'Photos/Gallery37.jpg',
    'Photos/Skyline%20golden%202.jpg',
    'Photos/Skyline%20golden%20hue.jpg'
  ];
  let currentLightboxIndex = 0;

  function openLightbox(index) {
    currentLightboxIndex = index;
    const lb = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = galleryImages[index];
    var thumbs = document.querySelectorAll('.gallery-thumb img');
    var lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.alt = (thumbs[index] && thumbs[index].alt) ? thumbs[index].alt : 'Bayou Family Fishing photo';
    document.getElementById('lightboxCounter').textContent = (index + 1) + ' / ' + galleryImages.length;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function lightboxNav(dir) {
    currentLightboxIndex = (currentLightboxIndex + dir + galleryImages.length) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentLightboxIndex];
    document.getElementById('lightboxCounter').textContent = (currentLightboxIndex + 1) + ' / ' + galleryImages.length;
  }

  function handleLightboxClick(e) {
    // Close if clicking the backdrop (not the image or controls)
    if (e.target === document.getElementById('lightbox')) {
      closeLightbox();
    }
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', function(e) {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') lightboxNav(-1);
      if (e.key === 'ArrowRight') lightboxNav(1);
    }
  });

  // ══════════════════════════════════════
  // PRELOADER
  // ══════════════════════════════════════
  (function() {
    function dismissPreloader() {
      const pl = document.getElementById('preloader');
      if (!pl || pl.classList.contains('done')) return;
      setTimeout(function() {
        pl.classList.add('done');
        setTimeout(function() { if (pl.parentNode) pl.remove(); }, 600);
      }, 300);
    }
    // Dismiss as soon as DOM is ready — don't wait for videos
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', dismissPreloader);
    } else {
      dismissPreloader();
    }
    // Hard fallback — ensure it's gone by 2.5s regardless
    setTimeout(dismissPreloader, 2500);
  })();

  // Init home map immediately — home section is visible by default
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeMap);
  } else {
    initHomeMap();
  }

  // ══════════════════════════════════════
  // SCROLL-TRIGGERED ANIMATIONS
  // ══════════════════════════════════════
  (function() {
    var scrollEls = document.querySelectorAll('[data-scroll]');
    if (!scrollEls.length || !('IntersectionObserver' in window)) {
      scrollEls.forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    var scrollObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          scrollObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    scrollEls.forEach(function(el) { scrollObs.observe(el); });
  })();

  // ══════════════════════════════════════
  // SECTION TRANSITIONS (enhanced showSection)
  // ══════════════════════════════════════
  (function() {
    var _origShow = showSection;
    showSection = function(id, noPush) {
      var current = document.querySelector('section.active');
      if (current && current.id === id) return false;
      // Immediately switch (keep fast), but add entrance animation
      _origShow(id, noPush);
      var newSection = document.getElementById(id);
      if (newSection) {
        newSection.classList.remove('section-enter');
        void newSection.offsetWidth; // force reflow
        newSection.classList.add('section-enter');
        // Trigger scroll animations for elements in newly visible section
        var scrollEls = newSection.querySelectorAll('[data-scroll]');
        setTimeout(function() {
          scrollEls.forEach(function(el, i) {
            setTimeout(function() {
              el.style.opacity = '';
              el.style.transform = '';
              el.classList.add('in-view');
            }, i * 80);
          });
        }, 150);
      }
      return false;
    };
  })();

  // ══════════════════════════════════════
  // FISHING RODEO COUNTDOWN TIMER
  // ══════════════════════════════════════
  (function() {
    var target = new Date('2026-04-25T06:15:00-05:00').getTime();
    var container = document.getElementById('rodeoCountdown');
    if (!container) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
      var now = Date.now();
      var diff = target - now;
      if (diff <= 0) {
        container.innerHTML = '<div class="countdown-done">Rodeo Day! See you at sunrise!</div>';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      container.innerHTML =
        '<div class="countdown-strip">' +
          '<div class="countdown-block"><span class="countdown-num">' + pad(d) + '</span><span class="countdown-label">Days</span></div>' +
          '<div class="countdown-block"><span class="countdown-num">' + pad(h) + '</span><span class="countdown-label">Hours</span></div>' +
          '<div class="countdown-block"><span class="countdown-num">' + pad(m) + '</span><span class="countdown-label">Min</span></div>' +
          '<div class="countdown-block"><span class="countdown-num">' + pad(s) + '</span><span class="countdown-label">Sec</span></div>' +
        '</div>';
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  })();

  // ══════════════════════════════════════
  // DARK MODE TOGGLE
  // ══════════════════════════════════════
  function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('bff-theme', next);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
  }
  // Set initial icon
  (function() {
    var theme = document.documentElement.getAttribute('data-theme');
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  })();

  // ══════════════════════════════════════
  // GALLERY FILTER
  // ══════════════════════════════════════
  function openGalleryVideoFullscreen(btn) {
    var videoEl = btn.closest('.gallery-video-thumb').querySelector('video');
    videoEl.muted = false;
    videoEl.controls = true;
    if (videoEl.requestFullscreen) {
      videoEl.requestFullscreen();
    } else if (videoEl.webkitEnterFullscreen) {
      /* iOS Safari — uses video-native fullscreen */
      videoEl.webkitEnterFullscreen();
      videoEl.addEventListener('webkitendfullscreen', function onEnd() {
        videoEl.muted = true;
        videoEl.controls = false;
        videoEl.removeEventListener('webkitendfullscreen', onEnd);
      });
      return;
    } else if (videoEl.webkitRequestFullscreen) {
      videoEl.webkitRequestFullscreen();
    } else if (videoEl.mozRequestFullScreen) {
      videoEl.mozRequestFullScreen();
    }
    function onFullscreenChange() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        videoEl.muted = true;
        videoEl.controls = false;
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  }

  function filterGallery(category, btn) {
    document.querySelectorAll('.gallery-filter-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    document.querySelectorAll('.gallery-thumb, .gallery-video-thumb').forEach(function(thumb) {
      if (category === 'all' || thumb.dataset.category === category) {
        thumb.classList.remove('filtered-out');
      } else {
        thumb.classList.add('filtered-out');
      }
    });
  }

  // ══════════════════════════════════════
  // BUTTON RIPPLE EFFECT
  // ══════════════════════════════════════
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    var ripple = document.createElement('span');
    ripple.classList.add('ripple');
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 550);
  });

  // ══════════════════════════════════════
  // CARD 3D TILT ON HOVER
  // ══════════════════════════════════════
  document.querySelectorAll('.quick-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var midX = rect.width / 2;
      var midY = rect.height / 2;
      var rotX = (y - midY) / midY * -6;
      var rotY = (x - midX) / midX * 6;
      card.style.transform = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  // ══════════════════════════════════════
  // VIDEO PERFORMANCE — pause off-screen autoplay videos
  // ══════════════════════════════════════
  (function () {
    if (!('IntersectionObserver' in window)) return; // SSR / old browsers safe
    var videoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (v.paused) v.play().catch(function () {}); // ignore autoplay policy errors
        } else {
          if (!v.paused) v.pause();
        }
      });
    }, { threshold: 0.25 });

    // Observe after DOM is ready
    window.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('video[autoplay]').forEach(function (v) {
        videoObs.observe(v);
      });
    });
  })();

  // ══════════════════════════════════════════════════════════════
  // MEMBER PORTAL — Supabase auth, map, feed, comments, admin
  // ══════════════════════════════════════════════════════════════
  (function () {
    'use strict';

    // ── XSS utility ───────────────────────────────────────────
    function escapeHTML(str) {
      if (str == null) return '';
      var d = document.createElement('div');
      d.textContent = String(str);
      return d.innerHTML;
    }

    // getSB() is defined globally above the members IIFE — shared with gallery functions
    var _memberMap   = null;
    var _currentUser = null;
    var _pendingMarker = null;
    var _pinMarkers  = [];
    var _pendingLatLng = null;

    // ── Show one members view, hide others ────────────────────
    function showMembersView(view) {
      var auth    = document.getElementById('membersAuth');
      var pending = document.getElementById('membersPending');
      var main    = document.getElementById('membersMain');
      if (auth)    auth.style.display    = view === 'auth'    ? '' : 'none';
      if (pending) pending.style.display = view === 'pending' ? '' : 'none';
      if (main)    main.style.display    = view === 'main'    ? '' : 'none';
    }

    // ── Load profile and route to correct view ────────────────
    function loadProfile(user) {
      getSB()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(function (res) {
          if (res.error || !res.data) {
            console.error('[BFF Auth] loadProfile failed:', res.error);
            showMembersView('auth');
            return;
          }
          var profile = res.data;
          if (profile.status === 'approved') {
            showMembersView('main');
            loadMemberMain(user, profile);
          } else {
            showMembersView('pending');
          }
        });
    }

    // ── Auth state listener ───────────────────────────────────
    function initMemberAuth() {
      getSB().auth.onAuthStateChange(function (event, session) {
        if (session && session.user) {
          loadProfile(session.user);
          if (event === 'SIGNED_IN') {
            var u = session.user;
            getSB().from('profiles').upsert({
              id: u.id,
              email: u.email || null,
              provider: (u.app_metadata && u.app_metadata.provider) || 'unknown'
            }, { onConflict: 'id', ignoreDuplicates: false });
            showSection('members');
          }
        } else if (event === 'SIGNED_OUT') {
          // Only reset to auth screen on an explicit sign-out —
          // NOT on INITIAL_SESSION (fires before async PKCE exchange completes)
          showMembersView('auth');
        }
      });

      // Belt-and-suspenders: catch any session the SDK resolved before the
      // onAuthStateChange listener registered
      getSB().auth.getSession().then(function (res) {
        if (res.data && res.data.session && res.data.session.user) {
          loadProfile(res.data.session.user);
        }
      });
    }

    // ── Sign-in / sign-out button bindings ────────────────────
    // ── Email tab toggle helper ────────────────────────────
    function switchEmailTab(tab) {
      var signInFields = document.getElementById('emailSignInFields');
      var signUpFields = document.getElementById('emailSignUpFields');
      var signInTab    = document.getElementById('emailTabSignIn');
      var signUpTab    = document.getElementById('emailTabSignUp');
      if (tab === 'signin') {
        signInFields.style.display = '';
        signUpFields.style.display = 'none';
        signInTab.style.background = 'var(--amber)'; signInTab.style.color = '#fff';
        signUpTab.style.background = 'transparent';  signUpTab.style.color = 'rgba(238,246,251,0.55)';
      } else {
        signInFields.style.display = 'none';
        signUpFields.style.display = '';
        signUpTab.style.background = 'var(--amber)'; signUpTab.style.color = '#fff';
        signInTab.style.background = 'transparent';  signInTab.style.color = 'rgba(238,246,251,0.55)';
      }
    }

    function bindSignInButtons() {
      var gBtn  = document.getElementById('btnGoogleSignIn');
      var fBtn  = document.getElementById('btnFacebookSignIn');
      var soBtn = document.getElementById('btnSignOut');
      var soBtn2 = document.getElementById('btnMemberSignOut');

      if (gBtn) {
        gBtn.addEventListener('click', function () {
          getSB().auth.signInWithOAuth({ provider: 'google',   options: { redirectTo: window.location.origin } });
        });
      }
      if (fBtn) {
        fBtn.addEventListener('click', function () {
          getSB().auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin } });
        });
      }
      if (soBtn) {
        soBtn.addEventListener('click', function () {
          getSB().auth.signOut().then(function () {
            closeProfileEditor();
            showMembersView('auth');
            if (_memberMap) { _memberMap.remove(); _memberMap = null; }
            _peCurrentUser = null; _peCurrentProfile = null; _peNewAvatarFile = null;
            var adminBtn = document.getElementById('mptAdmin');
            if (adminBtn) adminBtn.style.display = 'none';
          });
        });
      }
      if (soBtn2) {
        soBtn2.addEventListener('click', function () {
          getSB().auth.signOut().then(function () {
            closeProfileEditor(); showMembersView('auth');
            if (_memberMap) { _memberMap.remove(); _memberMap = null; }
            _peCurrentUser = null; _peCurrentProfile = null; _peNewAvatarFile = null;
            var adminBtn = document.getElementById('mptAdmin');
            if (adminBtn) adminBtn.style.display = 'none';
          });
        });
      }

      // ── Email / password auth ──────────────────────────────
      var toggleBtn   = document.getElementById('btnToggleEmailForm');
      var emailForm   = document.getElementById('emailAuthForm');
      var emailMsg    = document.getElementById('emailAuthMsg');
      var emailSignInBtn = document.getElementById('btnEmailSignIn');
      var emailSignUpBtn = document.getElementById('btnEmailSignUp');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          var hidden = emailForm.style.display === 'none';
          emailForm.style.display = hidden ? 'block' : 'none';
          toggleBtn.textContent   = hidden ? 'Hide email sign in ↑' : 'Or sign in with email';
        });
      }

      if (emailSignInBtn) {
        emailSignInBtn.addEventListener('click', function () {
          var email    = document.getElementById('authEmail').value.trim();
          var password = document.getElementById('authPassword').value;
          if (!email || !password) { emailMsg.textContent = 'Please enter your email and password.'; return; }
          emailSignInBtn.disabled    = true;
          emailSignInBtn.textContent = 'Signing in…';
          getSB().auth.signInWithPassword({ email: email, password: password })
            .then(function (res) {
              emailSignInBtn.disabled    = false;
              emailSignInBtn.textContent = 'Sign In';
              if (res.error) { emailMsg.textContent = res.error.message; }
              // onAuthStateChange handles the rest
            });
        });
      }

      if (emailSignUpBtn) {
        emailSignUpBtn.addEventListener('click', function () {
          var name     = document.getElementById('authSignUpName').value.trim();
          var email    = document.getElementById('authSignUpEmail').value.trim();
          var password = document.getElementById('authSignUpPassword').value;
          if (!name || !email || !password) { emailMsg.textContent = 'All fields are required.'; return; }
          if (password.length < 8)          { emailMsg.textContent = 'Password must be at least 8 characters.'; return; }
          emailSignUpBtn.disabled    = true;
          emailSignUpBtn.textContent = 'Creating account…';
          getSB().auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name } }
          }).then(function (res) {
            emailSignUpBtn.disabled    = false;
            emailSignUpBtn.textContent = 'Create Account';
            if (res.error) { emailMsg.textContent = res.error.message; return; }
            if (res.data && res.data.user) {
              getSB().from('profiles').upsert({
                id: res.data.user.id,
                email: email,
                provider: 'email'
              }, { onConflict: 'id', ignoreDuplicates: false });
            }
            emailMsg.textContent = '✅ Account created! Kyle will review and approve you shortly.';
          });
        });
      }
    }

    // ── Load main portal after approval ──────────────────────
    function loadMemberMain(user, profile) {
      _peCurrentUser = user;
      _currentUser = user;
      _peCurrentProfile = profile;
      var avatar = document.getElementById('memberAvatar');
      var initials = document.getElementById('memberAvatarInitials');
      var nameEl = document.getElementById('memberName');

      // Always compute initials so onerror fallback has text ready
      if (initials) {
        var _name = profile.display_name || user.email || '';
        var _parts = _name.trim().split(' ');
        initials.textContent = _parts.length >= 2
          ? (_parts[0][0] + _parts[_parts.length - 1][0]).toUpperCase()
          : _name.slice(0, 2).toUpperCase();
      }
      if (avatar && profile.avatar_url) {
        avatar.src = profile.avatar_url;
        avatar.style.display = 'block';
        if (initials) initials.style.display = 'none';
      } else if (initials) {
        initials.style.display = 'flex';
        if (avatar) avatar.style.display = 'none';
      }
      if (nameEl) nameEl.textContent = profile.display_name || user.email;

      if (profile.role === 'admin') {
        var adminBtn = document.getElementById('mptAdmin');
        if (adminBtn) adminBtn.style.display = '';
      }
      initMemberMap();
      loadFeed();
    }

    // ── Member satellite map ──────────────────────────────────
    function initMemberMap() {
      var container = document.getElementById('memberMap');
      if (!container || _memberMap) return;

      _memberMap = L.map('memberMap', { center: [29.35, -89.8], zoom: 10 });
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
      }).addTo(_memberMap);

      loadMapPins();

      var dropBtn  = document.getElementById('btnDropPin');
      var form     = document.getElementById('pinPostForm');
      var cancelBtn = document.getElementById('btnCancelPin');
      var submitBtn = document.getElementById('btnSubmitPin');
      var coordsEl  = document.getElementById('pinLatLngDisplay');

      if (dropBtn) {
        dropBtn.addEventListener('click', function () {
          form.style.display = 'block';
          dropBtn.style.display = 'none';
          coordsEl.textContent = 'Click the map to place your pin.';
          _pendingLatLng = null;
          if (_pendingMarker) { _memberMap.removeLayer(_pendingMarker); _pendingMarker = null; }
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (pos) {
              placePendingMarker(pos.coords.latitude, pos.coords.longitude, coordsEl);
            }, function () {
              coordsEl.textContent = 'GPS unavailable — click the map to place your pin.';
            }, { timeout: 8000 });
          }
        });
      }

      _memberMap.on('click', function (e) {
        if (form && form.style.display !== 'none') {
          placePendingMarker(e.latlng.lat, e.latlng.lng, coordsEl);
        }
      });

      if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
          form.style.display = 'none';
          dropBtn.style.display = '';
          if (_pendingMarker) { _memberMap.removeLayer(_pendingMarker); _pendingMarker = null; }
          _pendingLatLng = null;
        });
      }

      if (submitBtn) submitBtn.addEventListener('click', submitPin);

      // Map date filter defaults (last 90 days → today) + change listeners
      var today = new Date();
      var ninetyAgo = new Date(today); ninetyAgo.setDate(ninetyAgo.getDate() - 90);
      var fromEl = document.getElementById('mapFromDate');
      var toEl   = document.getElementById('mapToDate');
      if (fromEl) {
        fromEl.value = ninetyAgo.toISOString().slice(0, 10);
        fromEl.addEventListener('change', function () { loadMapPins(); });
      }
      if (toEl) {
        toEl.value = today.toISOString().slice(0, 10);
        toEl.addEventListener('change', function () { loadMapPins(); });
      }
    }

    function placePendingMarker(lat, lng, coordsEl) {
      if (_pendingMarker) _memberMap.removeLayer(_pendingMarker);
      _pendingLatLng = { lat: lat, lng: lng };
      _pendingMarker = L.marker([lat, lng], { draggable: true }).addTo(_memberMap);
      _memberMap.setView([lat, lng], 13);
      coordsEl.textContent = '\uD83D\uDCCD ' + lat.toFixed(5) + ', ' + lng.toFixed(5) + ' (drag to adjust)';
      _pendingMarker.on('dragend', function (e) {
        var p = e.target.getLatLng();
        _pendingLatLng = { lat: p.lat, lng: p.lng };
        coordsEl.textContent = '\uD83D\uDCCD ' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5);
      });
    }

    function loadMapPins() {
      var fromEl = document.getElementById('mapFromDate');
      var toEl   = document.getElementById('mapToDate');
      var fromD  = fromEl ? fromEl.value : null;
      var toD    = toEl   ? toEl.value   : null;
      var q = getSB()
        .from('pins')
        .select('id, lat, lng, caption, species, photo_url')
        .eq('flagged', false)
        .is('archived_at', null);
      if (fromD) q = q.gte('created_at', fromD);
      if (toD)   q = q.lte('created_at', toD + 'T23:59:59');
      q.then(function (res) {
          if (res.error) {
            console.error('[BFF] loadMapPins error:', res.error);
            return;
          }
          if (!res.data) return;
          _pinMarkers.forEach(function(m) { if (_memberMap) _memberMap.removeLayer(m); });
          _pinMarkers = [];
          res.data.forEach(function (pin) { addPinMarker(pin); });
        });
    }

    function addPinMarker(pin) {
      var icon = L.divIcon({
        className: '',
        html: '<div style="width:28px;height:28px;border-radius:50%;background:#f0c040;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:16px;">\uD83C\uDFA3</div>',
        iconSize: [28, 28], iconAnchor: [14, 14]
      });
      var marker = L.marker([pin.lat, pin.lng], { icon: icon }).addTo(_memberMap);
      _pinMarkers.push(marker);
      var img  = pin.photo_url ? '<img src="' + escapeHTML(pin.photo_url) + '" style="width:100%;border-radius:6px;margin-bottom:6px;cursor:pointer;" data-action="view-photo" data-url="' + escapeHTML(pin.photo_url) + '">' : '';
      var sp   = pin.species  ? '<em style="font-size:0.85rem;color:#555;">' + escapeHTML(pin.species) + '</em>' : '';
      var cap  = pin.caption  ? '<p style="margin:4px 0 0;">' + escapeHTML(pin.caption) + '</p>' : '';
      marker.bindPopup('<div style="font-family:Lora,serif;max-width:200px;">' + img + sp + cap + '</div>');
    }

    // ── Submit new pin ────────────────────────────────────────
    function submitPin() {
      if (!_pendingLatLng) { showToast('Oops', 'Click the map to place your pin first.'); return; }
      var photoFile    = document.getElementById('pinPhoto').files[0];
      var species      = document.getElementById('pinSpecies').value.trim();
      var caption      = document.getElementById('pinCaption').value.trim();
      var locationName = document.getElementById('pinLocationName').value.trim();
      if (!photoFile) { showToast('Photo required', 'Please select a photo to post.'); return; }

      var btn = document.getElementById('btnSubmitPin');
      btn.disabled = true; btn.textContent = 'Uploading\u2026';

      getSB().auth.getUser().then(function (res) {
        if (res.error || !res.data.user) { btn.disabled = false; btn.textContent = 'Post Pin'; return; }
        var userId = res.data.user.id;
        var ext    = photoFile.name.split('.').pop();
        var path   = userId + '/' + Date.now() + '.' + ext;

        getSB().storage.from('pin-photos').upload(path, photoFile, { cacheControl: '3600', upsert: false })
          .then(function (upRes) {
            if (upRes.error) { showToast('Upload error', upRes.error.message); btn.disabled = false; btn.textContent = 'Post Pin'; return; }
            var photoUrl = getSB().storage.from('pin-photos').getPublicUrl(path).data.publicUrl;
            return getSB().from('pins').insert({
              user_id: userId, photo_url: photoUrl,
              lat: _pendingLatLng.lat, lng: _pendingLatLng.lng,
              location_name: locationName || null,
              caption: caption || null, species: species || null
            });
          })
          .then(function (insRes) {
            if (!insRes || insRes.error) {
              showToast('Error', insRes ? insRes.error.message : 'Unknown error');
              btn.disabled = false; btn.textContent = 'Post Pin'; return;
            }
            showToast('Posted! \uD83C\uDFA3', 'Your catch is on the map.');
            document.getElementById('pinPostForm').style.display = 'none';
            document.getElementById('btnDropPin').style.display = '';
            ['pinPhoto','pinSpecies','pinCaption','pinLocationName'].forEach(function (id) {
              var el = document.getElementById(id); if (el) el.value = '';
            });
            btn.disabled = false; btn.textContent = 'Post Pin';
            if (_pendingMarker) { _memberMap.removeLayer(_pendingMarker); _pendingMarker = null; }
            loadMapPins(); loadFeed();
          })
          .catch(function (err) {
            showToast('Error', err.message || 'Unknown error');
            btn.disabled = false; btn.textContent = 'Post Pin';
          });
      });
    }

    // ── Edit Pin ──────────────────────────────────────────
    var _editingPinId = null;

    function editPin(pinId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      _editingPinId = pinId;
      getSB().from('pins').select('*').eq('id', pinId).single()
        .then(function(res) {
          if (res.error || !res.data) { alert('Could not load catch.'); return; }
          var p = res.data;
          openCommModal('pin-edit', {
            title: '✏️ Edit Catch',
            formHtml:
              '<div class="comm-modal-field"><label>Species</label><input type="text" id="cfPinSpecies" value="' + escapeHTML(p.species || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Caption</label><input type="text" id="cfPinCaption" value="' + escapeHTML(p.caption || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Location name</label><input type="text" id="cfPinLocation" value="' + escapeHTML(p.location_name || '') + '"></div>' +
              '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button>' +
              '<button class="btn btn-outline" style="border-color:var(--orange);color:var(--orange);" data-action="archive-post" data-table="pins" data-owner="user_id" data-id="' + escapeHTML(String(p.id)) + '">Archive</button>' +
              '<button class="btn btn-primary" data-action="save-edit-pin">Save Changes</button></div>'
          });
        });
    }

    function saveEditPin() {
      if (!_currentUser || !_editingPinId) return;
      var isAdmin = _peCurrentProfile && _peCurrentProfile.role === 'admin';
      var updates = {
        species:       (document.getElementById('cfPinSpecies')  || {}).value || null,
        caption:       (document.getElementById('cfPinCaption')  || {}).value || null,
        location_name: (document.getElementById('cfPinLocation') || {}).value || null
      };
      var q = getSB().from('pins').update(updates).eq('id', _editingPinId);
      if (!isAdmin) q = q.eq('user_id', _currentUser.id);
      q.then(function(res) {
        if (res.error) { alert('Error: ' + res.error.message); return; }
        _editingPinId = null;
        closeCommModal();
        showCommToast('Catch updated.');
        _feedLoading = false; loadFeed(); loadMapPins();
      });
    }

    // ── Archive / Restore ──────────────────────────────────
    function archivePost(table, id, ownerField) {
      if (!_currentUser) return;
      if (!confirm('Archive this post? It will be hidden from feeds but can be restored.')) return;
      var q = getSB().from(table).update({ archived_at: new Date().toISOString() }).eq('id', id);
      if (!(_peCurrentProfile && _peCurrentProfile.role === 'admin') && ownerField) q = q.eq(ownerField, _currentUser.id);
      q.then(function(res) {
        if (res.error) { alert('Error: ' + res.error.message); return; }
        closeCommModal();
        showCommToast('Post archived.');
        if (table === 'pins')          { _feedLoading = false; loadFeed(); loadMapPins(); }
        if (table === 'trips')         { _tripsLoaded = false; loadTrips(); }
        if (table === 'guide_postings'){ _guidesLoaded = false; loadGuides(); }
        if (table === 'classifieds')   { _classifiedsLoaded = false; loadGear(); }
        if (table === 'forum_threads') { _forumLoaded = false; loadForum(); }
        if (table === 'recipes')       { _recipesLoaded = false; loadRecipes(); }
      });
    }

    function restorePost(table, id, row) {
      if (!_currentUser) return;
      getSB().from(table).update({ archived_at: null }).eq('id', id)
        .then(function(res) {
          if (res.error) { alert('Error: ' + res.error.message); return; }
          showCommToast('Post restored.');
          if (row) row.remove();
        });
    }

    // ── Admin Batch Archive ────────────────────────────────
    var _batchArchiveCount = 0;
    var _batchArchiveDays  = 60;

    function adminBatchArchive() {
      var sel = document.getElementById('batchArchiveDays');
      _batchArchiveDays = sel ? parseInt(sel.value) : 60;
      var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - _batchArchiveDays);
      var cutStr = cutoff.toISOString();
      var preview   = document.getElementById('batchArchivePreview');
      var confirmBtn = document.getElementById('batchArchiveConfirmBtn');
      if (preview) preview.textContent = 'Counting…';
      if (confirmBtn) confirmBtn.style.display = 'none';
      var tables = ['trips','guide_postings','classifieds','forum_threads','pins'];
      var done = 0; var total = 0;
      tables.forEach(function(t) {
        getSB().from(t).select('id', { count: 'exact', head: true })
          .lt('created_at', cutStr).is('archived_at', null)
          .then(function(res) {
            total += (res.count || 0); done++;
            if (done === tables.length) {
              _batchArchiveCount = total;
              if (preview) preview.textContent = 'This will archive ' + total + ' post' + (total !== 1 ? 's' : '') + ' older than ' + _batchArchiveDays + ' days. Continue?';
              if (confirmBtn && total > 0) confirmBtn.style.display = '';
            }
          });
      });
    }

    function adminBatchArchiveConfirm() {
      if (!(_peCurrentProfile && _peCurrentProfile.role === 'admin')) return;
      var sel = document.getElementById('batchArchiveDays');
      _batchArchiveDays = sel ? parseInt(sel.value) : 60;
      var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - _batchArchiveDays);
      var cutStr = cutoff.toISOString();
      var now = new Date().toISOString();
      var preview = document.getElementById('batchArchivePreview');
      var confirmBtn = document.getElementById('batchArchiveConfirmBtn');
      if (preview) preview.textContent = 'Archiving…';
      if (confirmBtn) confirmBtn.style.display = 'none';
      var tables = ['trips','guide_postings','classifieds','forum_threads','pins'];
      var done = 0;
      tables.forEach(function(t) {
        getSB().from(t).update({ archived_at: now })
          .lt('created_at', cutStr).is('archived_at', null)
          .then(function() {
            done++;
            if (done === tables.length) {
              if (preview) preview.textContent = 'Done! Archived ' + _batchArchiveCount + ' posts.';
              showCommToast('Batch archive complete.');
              _feedLoading = false; loadFeed(); loadMapPins();
              _tripsLoaded = false; _guidesLoaded = false; _classifiedsLoaded = false; _forumLoaded = false; _recipesLoaded = false;
            }
          });
      });
    }

    // ── Feed ──────────────────────────────────────────────────
    var _feedReactions = {}; // cache: { pinId: { like: count, same_spot: count, userLiked: bool, userSameSpot: bool } }
    var _feedLoading = false; // debounce guard — prevents triple-render on portal init

    function loadFeed() {
      if (_feedLoading) return;
      _feedLoading = true;
      var container = document.getElementById('feedList');
      if (!container) { _feedLoading = false; return; }
      container.innerHTML = '<p class="feed-empty">Loading…</p>';
      getSB()
        .from('pins')
        .select('id, lat, lng, caption, species, location_name, photo_url, created_at, user_id, profiles(display_name, avatar_url)')
        .eq('flagged', false)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(50)
        .then(function (res) {
          if (res.error) {
            container.innerHTML = '<p class="feed-empty">Couldn\'t load the feed — try refreshing.</p>';
            console.error('[BFF] loadFeed error:', res.error);
            _feedLoading = false;
            return;
          }
          if (!res.data || !res.data.length) {
            container.innerHTML = '<p class="feed-empty">No catches posted yet — be the first! 🎣</p>';
            _feedLoading = false;
            return;
          }
          // Load reaction counts for all pins
          var pinIds = res.data.map(function (p) { return p.id; });
          loadReactionCounts(pinIds)
            .then(function () {
              container.innerHTML = '';
              res.data.forEach(function (pin) { container.appendChild(buildFeedCard(pin)); });
              _feedLoading = false;
            })
            .catch(function (err) {
              console.warn('[BFF] Reaction counts failed, rendering feed without reactions:', err);
              _feedReactions = {};
              container.innerHTML = '';
              res.data.forEach(function (pin) { container.appendChild(buildFeedCard(pin)); });
              _feedLoading = false;
            });
        })
        .catch(function (err) {
          container.innerHTML = '<p class="feed-empty">Couldn\'t load the feed — try refreshing.</p>';
          console.error('[BFF] loadFeed error:', err);
          _feedLoading = false;
        });
      // Also load sidebar
      loadFeedLeaderboard();
      loadCommunityActivity();
      loadWeather();
    }

    function loadReactionCounts(pinIds) {
      return getSB()
        .from('reactions')
        .select('target_id, emoji, member_id')
        .eq('target_type', 'pin')
        .in('target_id', pinIds)
        .then(function (res) {
          _feedReactions = {};
          if (res.error || !res.data) return;
          var uid = _currentUser ? _currentUser.id : null;
          res.data.forEach(function (r) {
            var type = r.emoji === '🎣' ? 'same_spot' : 'like';
            if (!_feedReactions[r.target_id]) _feedReactions[r.target_id] = { like: 0, same_spot: 0, userLiked: false, userSameSpot: false };
            var bucket = _feedReactions[r.target_id];
            bucket[type]++;
            if (r.member_id === uid) {
              if (type === 'like') bucket.userLiked = true;
              if (type === 'same_spot') bucket.userSameSpot = true;
            }
          });
        });
    }

    window.handleAvatarError = function(img, initialsId) {
      img.onerror = null;
      img.style.display = 'none';
      if (initialsId) {
        var el = document.getElementById(initialsId);
        if (el) el.style.display = 'flex';
      }
    }

    function buildFeedCard(pin) {
      var card = document.createElement('div');
      card.className = 'feed-card';
      card.setAttribute('data-pin-id', pin.id);
      var avatarUrl   = (pin.profiles && pin.profiles.avatar_url)   ? pin.profiles.avatar_url   : '';
      var displayName = (pin.profiles && pin.profiles.display_name) ? pin.profiles.display_name : 'Member';
      var initials    = displayName.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
      var date = new Date(pin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      var rx = _feedReactions[pin.id] || { like: 0, same_spot: 0, userLiked: false, userSameSpot: false };
      var canEdit = _currentUser && (pin.user_id === _currentUser.id || (_peCurrentProfile && _peCurrentProfile.role === 'admin'));
      var shareUrl = 'https://bayoucharity.org/#members';
      var shareText = (pin.species ? pin.species + ' catch' : 'Check out this catch') + ' on Bayou Charity!';

      card.innerHTML =
        (canEdit ? '<div class="feed-edit-bar"><button class="comm-edit-btn" data-action="edit-pin" data-id="' + escapeHTML(String(pin.id)) + '">✏️ Edit</button></div>' : '') +
        '<div class="feed-card-header">' +
          '<div class="feed-avatar">' +
            escapeHTML(initials) +
            (avatarUrl ? '<img src="' + escapeHTML(avatarUrl) + '" alt="" onerror="handleAvatarError(this)">' : '') +
          '</div>' +
          '<div>' +
            '<div class="feed-name">' + escapeHTML(displayName) + '</div>' +
            '<div class="feed-byline">' + date + (pin.location_name ? ' · ' + escapeHTML(pin.location_name) : '') + '</div>' +
          '</div>' +
        '</div>' +
        (pin.caption ? '<div class="feed-title">' + escapeHTML(pin.caption) + '</div>' : '') +
        (pin.photo_url ? '<img src="' + escapeHTML(pin.photo_url) + '" class="feed-photo" alt="Catch photo">' : '') +
        '<div class="feed-body">' +
          (pin.species ? '<span class="feed-species">' + escapeHTML(pin.species) + '</span>' : '') +
        '</div>' +
        '<div class="feed-actions">' +
          '<button class="feed-action' + (rx.userLiked ? ' active' : '') + '" data-type="like" data-pin="' + escapeHTML(pin.id) + '">👍 <span class="rx-count">' + (rx.like || '') + '</span></button>' +
          '<button class="feed-action" data-toggle-comments="' + escapeHTML(pin.id) + '">💬 <span class="cmt-count" id="cmtCount-' + escapeHTML(pin.id) + '"></span></button>' +
          '<button class="feed-action feed-action-spacer' + (rx.userSameSpot ? ' active' : '') + '" data-type="same_spot" data-pin="' + escapeHTML(pin.id) + '" style="margin-left:auto;color:var(--amber);">🎣 Same spot!</button>' +
        '</div>' +
        '<div class="feed-share">' +
          '<button class="feed-share-btn" data-action="share-fb" data-url="' + escapeHTML(shareUrl) + '" title="Share on Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> Facebook</button>' +
          '<button class="feed-share-btn" data-action="share-x" data-url="' + escapeHTML(shareUrl) + '" data-text="' + escapeHTML(shareText) + '" title="Share on X/Twitter"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X</button>' +
          '<button class="feed-share-btn" data-action="share-copy" data-url="' + escapeHTML(shareUrl) + '" title="Copy link">🔗 Copy link</button>' +
        '</div>' +
        '<div class="feed-card-comments" id="commentsSection-' + escapeHTML(pin.id) + '">' +
          '<div class="comment-list" id="comments-' + escapeHTML(pin.id) + '"></div>' +
          '<div class="comment-input-row">' +
            '<input type="text" class="form-input comment-input" placeholder="Add a comment…" id="commentInput-' + escapeHTML(pin.id) + '">' +
            '<button class="btn btn-primary btn-sm" data-action="post-comment" data-id="' + escapeHTML(String(pin.id)) + '">Post</button>' +
          '</div>' +
        '</div>';

      loadComments(pin.id, card.querySelector('.comment-list'));
      return card;
    }

    // ── Reaction toggle ──────────────────────────────────────
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.feed-action[data-type]');
      if (!btn || typeof _currentUser === 'undefined' || !_currentUser) return;
      var pinId = btn.getAttribute('data-pin');
      var type  = btn.getAttribute('data-type');
      var isActive = btn.classList.contains('active');
      var countEl = btn.querySelector('.rx-count');

      if (isActive) {
        // Remove reaction
        getSB().from('reactions').delete()
          .eq('target_type', 'pin').eq('target_id', pinId).eq('member_id', _currentUser.id)
          .then(function (res) {
            if (!res.error) {
              btn.classList.remove('active');
              var cur = parseInt(countEl.textContent) || 0;
              countEl.textContent = cur > 1 ? (cur - 1) : '';
            }
          });
      } else {
        // Add reaction
        getSB().from('reactions').insert({ member_id: _currentUser.id, target_type: 'pin', target_id: pinId, emoji: type === 'same_spot' ? '🎣' : '👍' })
          .then(function (res) {
            if (!res.error) {
              btn.classList.add('active');
              var cur = parseInt(countEl.textContent) || 0;
              countEl.textContent = cur + 1;
            }
          });
      }
    });

    // ── Comment section toggle ───────────────────────────────
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-toggle-comments]');
      if (!btn) return;
      var pinId = btn.getAttribute('data-toggle-comments');
      var section = document.getElementById('commentsSection-' + pinId);
      if (section) section.classList.toggle('expanded');
    });

    // ── Leaderboard ──────────────────────────────────────────
    function loadFeedLeaderboard() {
      var container = document.getElementById('leaderboardList');
      if (!container) return;
      getSB().from('pins').select('user_id, profiles(display_name)')
        .eq('flagged', false)
        .then(function (r2) {
          if (r2.error || !r2.data || !r2.data.length) {
            container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-mid);font-style:italic;">No catches yet</div>';
            return;
          }
          var counts = {};
          var names = {};
          r2.data.forEach(function (p) {
            counts[p.user_id] = (counts[p.user_id] || 0) + 1;
            if (p.profiles && p.profiles.display_name) names[p.user_id] = p.profiles.display_name;
          });
          var sorted = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 5);
          container.innerHTML = '';
          sorted.forEach(function (uid, i) {
            var row = document.createElement('div');
            row.className = 'lb-row';
            row.innerHTML =
              '<div class="lb-rank">' + (i + 1) + '</div>' +
              '<div class="lb-name">' + escapeHTML(names[uid] || 'Member') + '</div>' +
              '<div class="lb-catch"' + (i === 0 ? ' style="color:var(--gold);"' : '') + '>' + counts[uid] + ' catches</div>';
            container.appendChild(row);
          });
        });
    }

    // ── Community Activity Widget ────────────────────────────
    function loadCommunityActivity() {
      var container = document.getElementById('communityActivityList');
      if (!container) return;
      var TYPES = [
        { table: 'trips',          label: 'Trip',   color: '#e8923a', titleCol: 'title' },
        { table: 'forum_threads',  label: 'Forum',  color: '#3a7bd5', titleCol: 'title' },
        { table: 'guide_postings', label: 'Guide',  color: '#2e8b57', titleCol: 'title' },
        { table: 'classifieds',    label: 'Gear',   color: '#7b3ad5', titleCol: 'title' },
        { table: 'recipes',        label: 'Recipe', color: '#d5823a', titleCol: 'title' }
      ];
      var queries = TYPES.map(function(t) {
        return getSB().from(t.table).select('title, created_at').eq('status', 'approved')
          .order('created_at', { ascending: false }).limit(2)
          .then(function(res) {
            if (res.error || !res.data) return [];
            return res.data.map(function(row) {
              return { title: row.title, created_at: row.created_at, label: t.label, color: t.color };
            });
          });
      });
      Promise.all(queries).then(function(results) {
        var items = [].concat.apply([], results);
        items.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
        items = items.slice(0, 5);
        if (!items.length) {
          container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-mid);font-style:italic;">No community activity yet.</div>';
          return;
        }
        container.innerHTML = items.map(function(item) {
          var ago = formatTimeAgo(item.created_at);
          return '<div data-action="nav-community" style="padding:0.4rem 0;border-bottom:1px solid var(--border,rgba(0,0,0,0.08));cursor:pointer;" title="Go to Community">' +
            '<span style="display:inline-block;font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:10px;background:' + item.color + ';color:#fff;margin-right:6px;">' + item.label + '</span>' +
            '<span style="font-size:0.8rem;color:var(--text-dark);">' + escapeHTML(item.title) + '</span>' +
            '<div style="font-size:0.72rem;color:var(--text-mid);margin-top:2px;">' + ago + '</div>' +
            '</div>';
        }).join('');
      });
    }

    function formatTimeAgo(isoString) {
      var diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
      if (diff < 60)   return 'just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    }

    // ── Weather (Open-Meteo) ─────────────────────────────────
    var _weatherCache = { data: null, fetchedAt: 0 };

    function loadWeather() {
      var container = document.getElementById('weatherDisplay');
      if (!container) return;
      var now = Date.now();
      // Cache for 30 minutes
      if (_weatherCache.data && (now - _weatherCache.fetchedAt) < 1800000) {
        renderWeather(container, _weatherCache.data);
        return;
      }
      fetch('https://api.open-meteo.com/v1/forecast?latitude=29.5955&longitude=-89.9067&current=temperature_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          _weatherCache.data = data;
          _weatherCache.fetchedAt = now;
          renderWeather(container, data);
        })
        .catch(function () {
          container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-mid);">Weather unavailable</div>';
        });
    }

    function renderWeather(container, data) {
      if (!data || !data.current) return;
      var c = data.current;
      var temp = Math.round(c.temperature_2m);
      var wind = Math.round(c.wind_speed_10m);
      var code = c.weather_code;
      var desc = weatherCodeToText(code);
      var icon = weatherCodeToIcon(code);
      container.innerHTML =
        '<div class="weather-temp">' + icon + ' ' + temp + '°F</div>' +
        '<div class="weather-details">' +
          '<div class="weather-condition">' + escapeHTML(desc) + '</div>' +
          '<div>Wind: ' + wind + ' mph</div>' +
        '</div>';
    }

    function weatherCodeToText(code) {
      var map = { 0:'Clear sky', 1:'Mostly clear', 2:'Partly cloudy', 3:'Overcast',
        45:'Foggy', 48:'Fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
        61:'Light rain', 63:'Rain', 65:'Heavy rain', 71:'Light snow', 73:'Snow', 75:'Heavy snow',
        80:'Light showers', 81:'Showers', 82:'Heavy showers', 95:'Thunderstorm', 96:'Thunderstorm w/ hail', 99:'Severe storm' };
      return map[code] || 'Unknown';
    }

    function weatherCodeToIcon(code) {
      if (code === 0) return '☀️';
      if (code <= 2) return '🌤️';
      if (code === 3) return '☁️';
      if (code <= 48) return '🌫️';
      if (code <= 55) return '🌦️';
      if (code <= 65) return '🌧️';
      if (code <= 75) return '❄️';
      if (code <= 82) return '🌧️';
      return '⛈️';
    }

    // ── Quick Post ───────────────────────────────────────────
    (function () {
      document.addEventListener('click', function (e) {
        if (e.target.id !== 'btnQuickPost' && !e.target.closest('#btnQuickPost')) return;
        var caption  = document.getElementById('quickPostCaption');
        var species  = document.getElementById('quickPostSpecies');
        var location = document.getElementById('quickPostLocation');
        var photoInput = document.getElementById('quickPostPhoto');
        var btn = document.getElementById('btnQuickPost');
        if (!caption || !caption.value.trim()) { alert('Add a caption for your catch!'); return; }
        if (!_currentUser) { alert('Please sign in first.'); return; }
        btn.disabled = true; btn.textContent = 'Posting…';

        var doPost = function (photoUrl) {
          getSB().from('pins').insert({
            user_id: _currentUser.id,
            caption: caption.value.trim(),
            species: species ? species.value.trim() : '',
            location_name: location ? location.value.trim() : '',
            photo_url: photoUrl || '',
            lat: 29.5955,
            lng: -89.9067,
            flagged: false
          }).then(function (res) {
            btn.disabled = false; btn.textContent = 'Post';
            if (res.error) { console.error('[BFF] quickPost error:', res.error); alert('Post failed — try again.'); return; }
            caption.value = ''; if (species) species.value = ''; if (location) location.value = '';
            if (photoInput) photoInput.value = '';
            document.getElementById('quickPostFileName').textContent = '';
            loadFeed();
          });
        };

        // Upload photo if present
        if (photoInput && photoInput.files && photoInput.files[0]) {
          var file = photoInput.files[0];
          var path = _currentUser.id + '/' + Date.now() + '.' + file.name.split('.').pop();
          getSB().storage.from('pin-photos').upload(path, file)
            .then(function (upRes) {
              if (upRes.error) { doPost(''); return; }
              var url = getSB().storage.from('pin-photos').getPublicUrl(path).data.publicUrl;
              doPost(url);
            });
        } else {
          doPost('');
        }
      });

      // Show filename on photo select
      document.addEventListener('change', function (e) {
        if (e.target.id !== 'quickPostPhoto') return;
        var nameEl = document.getElementById('quickPostFileName');
        if (nameEl && e.target.files && e.target.files[0]) {
          nameEl.textContent = e.target.files[0].name;
        }
      });
    })();

    // ── Comments ──────────────────────────────────────────────
    function loadComments(pinId, container) {
      getSB()
        .from('comments')
        .select('id, body, created_at, profiles(display_name)')
        .eq('pin_id', pinId)
        .order('created_at', { ascending: true })
        .then(function (res) {
          if (res.error || !res.data || !res.data.length) { container.innerHTML = ''; return; }
          container.innerHTML = '';
          res.data.forEach(function (c) {
            var row = document.createElement('div');
            row.className = 'comment-row';
            var name = (c.profiles && c.profiles.display_name) ? c.profiles.display_name : 'Member';
            row.innerHTML = '<strong class="comment-author">' + escapeHTML(name) + '</strong> ' + escapeHTML(c.body);
            container.appendChild(row);
          });
        });
    }

    window._bffPostComment = function (pinId) {
      var input = document.getElementById('commentInput-' + pinId);
      if (!input || !input.value.trim()) return;
      var body = input.value.trim();
      var container = document.getElementById('comments-' + pinId);
      getSB().auth.getUser().then(function (res) {
        if (res.error || !res.data.user) return;
        getSB().from('comments').insert({ pin_id: pinId, user_id: res.data.user.id, body: body })
          .then(function (ins) {
            if (ins.error) { showToast('Error', ins.error.message); return; }
            input.value = '';
            loadComments(pinId, container);
          });
      });
    };

    // ── Admin ─────────────────────────────────────────────────
    function loadAdminQueues() {
      var pendingList = document.getElementById('adminPendingList');
      var flaggedList = document.getElementById('adminFlaggedList');

      if (pendingList) {
        pendingList.innerHTML = '<p class="admin-empty">Loading\u2026</p>';
        getSB()
          .from('profiles').select('id, display_name, email, provider, joined_at').eq('status', 'pending').order('joined_at', { ascending: true })
          .then(function (res) {
            if (res.error) {
              pendingList.innerHTML = '<p class="admin-empty">Error loading accounts \u2014 check console.</p>';
              console.error('[BFF] loadAdminQueues pending error:', res.error);
              return;
            }
            if (!res.data || !res.data.length) { pendingList.innerHTML = '<p class="admin-empty">No pending accounts.</p>'; return; }
            pendingList.innerHTML = '';
            res.data.forEach(function (p) {
              var row = document.createElement('div'); row.className = 'admin-row';
              var date = new Date(p.joined_at).toLocaleDateString();
              var providerBadge = p.provider ? '<span style="background:var(--gold);color:#000;font-size:0.65rem;font-weight:700;border-radius:3px;padding:1px 5px;margin-left:0.3rem;text-transform:capitalize;">' + escapeHTML(p.provider) + '</span>' : '';
              var emailLine = p.email ? '<span style="font-size:0.8rem;color:var(--text-mid);display:block;">' + escapeHTML(p.email) + '</span>' : '';
              row.innerHTML =
                '<span><strong>' + escapeHTML(p.display_name || 'Unknown') + '</strong>' + providerBadge + ' <span style="font-size:0.8rem;color:var(--text-mid);">joined ' + escapeHTML(date) + '</span>' + emailLine + '</span>' +
                '<div style="display:flex;gap:0.5rem;">' +
                  '<button class="btn btn-primary btn-sm" data-action="approve-user" data-id="' + escapeHTML(String(p.id)) + '">Approve</button>' +
                  '<button class="btn btn-outline btn-sm" style="border-color:var(--orange);color:var(--orange);" data-action="reject-user" data-id="' + escapeHTML(String(p.id)) + '">Reject</button>' +
                '</div>';
              pendingList.appendChild(row);
            });
          });
      }

      if (flaggedList) {
        flaggedList.innerHTML = '<p class="admin-empty">Loading\u2026</p>';
        getSB()
          .from('pins').select('id, caption, species, photo_url, created_at').eq('flagged', true).order('created_at', { ascending: false })
          .then(function (res) {
            if (res.error) {
              flaggedList.innerHTML = '<p class="admin-empty">Error loading flagged posts \u2014 check console.</p>';
              console.error('[BFF] loadAdminQueues flagged error:', res.error);
              return;
            }
            if (!res.data || !res.data.length) { flaggedList.innerHTML = '<p class="admin-empty">No flagged posts.</p>'; return; }
            flaggedList.innerHTML = '';
            res.data.forEach(function (pin) {
              var row = document.createElement('div'); row.className = 'admin-row';
              var img = pin.photo_url ? '<img src="' + escapeHTML(pin.photo_url) + '" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">' : '';
              row.innerHTML =
                '<span style="display:flex;align-items:center;gap:0.75rem;">' + img +
                  '<span>' + escapeHTML(pin.species || 'Unknown species') + (pin.caption ? ' \u2014 ' + escapeHTML(pin.caption) : '') + '</span>' +
                '</span>' +
                '<button class="btn btn-outline btn-sm" style="border-color:var(--orange);color:var(--orange);" data-action="remove-pin" data-id="' + escapeHTML(String(pin.id)) + '">Remove</button>';
              flaggedList.appendChild(row);
            });
          });
      }
      loadPendingTrips();
      loadPendingGuides();
      loadPendingClassifieds();
    }

    window._bffApproveUser = function (userId, row) {
      getSB().from('profiles').update({ status: 'approved' }).eq('id', userId).then(function (res) {
        if (res.error) { showToast('Error', res.error.message); return; }
        showToast('Approved \u2713', 'Member now has access.');
        if (row) row.remove();
      });
    };
    window._bffRejectUser = function (userId, row) {
      getSB().from('profiles').update({ status: 'rejected' }).eq('id', userId).then(function (res) {
        if (res.error) { showToast('Error', res.error.message); return; }
        showToast('Rejected', 'Account has been declined.');
        if (row) row.remove();
      });
    };
    window._bffRemovePin = function (pinId, row) {
      getSB().from('pins').delete().eq('id', pinId).then(function (res) {
        if (res.error) { showToast('Error', res.error.message); return; }
        showToast('Removed', 'Post removed from the map and feed.');
        if (row) row.remove();
      });
    };

    // ── Gallery Admin Approval ────────────────────────────────────
    var _galleryApprovalOpen = true;

    window.toggleGalleryApprovalList = function() {
      _galleryApprovalOpen = !_galleryApprovalOpen;
      var list = document.getElementById('galleryPendingList');
      var toggle = document.getElementById('galleryApprovalToggle');
      if (list) list.style.display = _galleryApprovalOpen ? 'block' : 'none';
      if (toggle) toggle.textContent = _galleryApprovalOpen ? '▾' : '▸';
    };

    window.toggleGalleryItemExpand = function(id) {
      var item = document.getElementById('gpi-' + id);
      var preview = document.getElementById('gpe-' + id);
      if (!item || !preview) return;
      var isOpen = preview.classList.contains('visible');
      document.querySelectorAll('.gallery-expand-preview.visible').forEach(function(el) { el.classList.remove('visible'); });
      document.querySelectorAll('.gallery-pending-item.expanded').forEach(function(el) { el.classList.remove('expanded'); });
      if (!isOpen) {
        preview.classList.add('visible');
        item.classList.add('expanded');
      }
    };

    async function loadPendingGallerySubmissions() {
      var list = document.getElementById('galleryPendingList');
      var countEl = document.getElementById('galleryPendingCount');
      if (!list) return;

      var { data, error } = await getSB()
        .from('gallery_submissions')
        .select('id, storage_path, caption, status, submitted_at, event_id, member_id(display_name), gallery_events(name)')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) {
        list.innerHTML = '<div style="padding:1rem;font-size:0.78rem;color:#9d174d;font-family:\'Lora\',serif;">Error loading submissions.</div>';
        return;
      }
      var items = data || [];
      if (countEl) {
        countEl.textContent = items.length;
        countEl.style.display = items.length > 0 ? 'inline-block' : 'none';
      }
      if (items.length === 0) {
        list.innerHTML = '<div style="padding:1rem;text-align:center;font-size:0.8rem;color:var(--text-mid);font-family:\'Lora\',serif;">No pending submissions ✓</div>';
        return;
      }

      // Use async loop to build signed URLs (gallery-pending is private)
      var rows = [];
      for (var i = 0; i < items.length; i++) {
        var sub = items[i];
        var { data: signedData } = await getSB().storage
          .from('gallery-pending')
          .createSignedUrl(sub.storage_path, 300);
        var thumbUrl = signedData ? escapeHTML(signedData.signedUrl) : '';

        var memberName = escapeHTML((sub.member_id && sub.member_id.display_name) || 'Member');
        var eventName  = escapeHTML((sub.gallery_events && sub.gallery_events.name) || (sub.event_id ? 'Event upload' : 'Fish Pics'));
        var caption    = escapeHTML(sub.caption || '');
        var date = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        // ── ADMIN APPROVAL ONCLICK QUOTING RULE ─────────────────────────────────
        // NEVER use JSON.stringify() for onclick attribute values — it produces
        // double-quoted strings ("value") which break double-quoted HTML attributes,
        // causing the browser to terminate the attribute at the first inner ".
        // ALWAYS use single-quote wrapping: '\'' + String(val) + '\''
        // This produces: onclick="fn('uuid','path/file.jpg')" — valid HTML.
        // Supabase UUIDs and storage paths never contain single quotes, so this is safe.
        // This same bug has hit: rsvpTrip, postReply, approve/reject (x3 here).
        // ────────────────────────────────────────────────────────────────────────
        var sid   = String(sub.id);
        var spath = String(sub.storage_path);
        var sidSafe = escapeHTML(sid); // for DOM id attributes only

        rows.push(
          '<div class="gallery-pending-item" id="gpi-' + sidSafe + '" data-action="toggle-gallery-expand" data-id="' + sidSafe + '">' +
            (thumbUrl ? '<img class="gallery-pending-thumb" src="' + thumbUrl + '" alt="" loading="lazy">' : '<div class="gallery-pending-thumb"></div>') +
            '<div class="gallery-pending-info">' +
              '<div class="gallery-pending-member">' + memberName + '</div>' +
              '<div class="gallery-pending-meta">' + eventName + ' · ' + date + '</div>' +
              '<div class="gallery-pending-caption">' + (caption ? '"' + caption + '"' : '(no caption)') + '</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:0.3rem;flex-shrink:0;" data-action="stop-propagation">' +
              '<button class="gallery-approve-btn" data-action="approve-gallery" data-sid="' + sidSafe + '" data-spath="' + escapeHTML(spath) + '">✓ Approve</button>' +
              '<button class="gallery-reject-btn" data-action="reject-gallery" data-sid="' + sidSafe + '" data-spath="' + escapeHTML(spath) + '">✕ Reject</button>' +
            '</div>' +
          '</div>' +
          '<div class="gallery-expand-preview" id="gpe-' + sidSafe + '">' +
            (thumbUrl ? '<img class="gallery-expand-img" src="' + thumbUrl + '" alt="">' : '') +
            '<div class="gallery-expand-field"><strong>' + memberName + '</strong> · ' + eventName + '</div>' +
            '<div class="gallery-expand-field" style="color:var(--text-mid);font-size:0.7rem;">' + date + '</div>' +
            (caption ? '<div class="gallery-expand-caption">"' + caption + '"</div>' : '') +
            '<div class="gallery-expand-actions">' +
              '<button class="gallery-expand-approve" data-action="approve-gallery" data-sid="' + sidSafe + '" data-spath="' + escapeHTML(spath) + '">✓ Approve &amp; Publish</button>' +
              '<button class="gallery-expand-reject" data-action="reject-gallery" data-sid="' + sidSafe + '" data-spath="' + escapeHTML(spath) + '">✕ Reject</button>' +
            '</div>' +
          '</div>'
        );
      }
      list.innerHTML = rows.join('');
    }

    window.approveGallerySubmission = async function(subId, storagePath) {
      if (!confirm('Approve this photo and publish it to the gallery?')) return;
      var item = document.getElementById('gpi-' + subId);
      var preview = document.getElementById('gpe-' + subId);
      if (item) item.style.opacity = '0.5';

      // Move from gallery-pending to gallery-public (fallback: download + re-upload)
      var { error: moveErr } = await getSB().storage
        .from('gallery-pending')
        .move(storagePath, storagePath, { destinationBucket: 'gallery-public' });
      if (moveErr) {
        var { data: fileData } = await getSB().storage.from('gallery-pending').download(storagePath);
        if (fileData) {
          await getSB().storage.from('gallery-public').upload(storagePath, fileData, { upsert: true });
          await getSB().storage.from('gallery-pending').remove([storagePath]);
        }
      }

      var authResult = await getSB().auth.getUser();
      var user = authResult.data && authResult.data.user;
      if (!user) {
        if (item) item.style.opacity = '1';
        alert('Session expired. Please sign in again.');
        return;
      }

      await getSB().from('gallery_submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user.id, storage_path: storagePath })
        .eq('id', subId);

      if (item) item.remove();
      if (preview) preview.remove();
      loadPendingGallerySubmissions();
    };

    window.rejectGallerySubmission = async function(subId, storagePath) {
      if (!confirm('Reject and delete this submission?')) return;
      var item = document.getElementById('gpi-' + subId);
      var preview = document.getElementById('gpe-' + subId);
      if (item) item.style.opacity = '0.5';

      await getSB().storage.from('gallery-pending').remove([storagePath]);

      var authResult = await getSB().auth.getUser();
      var user = authResult.data && authResult.data.user;
      if (!user) {
        if (item) item.style.opacity = '1';
        alert('Session expired. Please sign in again.');
        return;
      }

      await getSB().from('gallery_submissions')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq('id', subId);

      if (item) item.remove();
      if (preview) preview.remove();
      loadPendingGallerySubmissions();
    };
    // ── GALLERY EVENT TAB MANAGEMENT (admin) ──────────────────────────────
    var _editingEventId = null;

    window.toggleGalleryEventsList = function() {
      var list = document.getElementById('galleryEventsList');
      list.classList.toggle('hidden');
      document.getElementById('galleryEventsToggle').textContent = list.classList.contains('hidden') ? '▾' : '▴';
      if (!list.classList.contains('hidden')) loadGalleryEvents();
    };

    async function loadGalleryEvents() {
      var list = document.getElementById('galleryEventsList');
      list.innerHTML = '<div style="padding:1rem;text-align:center;font-size:0.8rem;color:var(--text-mid);">Loading…</div>';

      var { data, error } = await getSB()
        .from('gallery_events')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data) {
        list.innerHTML = '<div style="padding:1rem;text-align:center;font-size:0.8rem;color:var(--orange);">Failed to load events.</div>';
        return;
      }

      document.getElementById('galleryEventsCount').textContent = data.length;
      document.getElementById('galleryEventsCount').style.display = data.length > 0 ? '' : 'none';

      if (data.length === 0) {
        list.innerHTML = '<div style="padding:1rem;text-align:center;font-size:0.8rem;color:var(--text-mid);">No events yet.</div>';
      } else {
        list.innerHTML = data.map(function(ev) {
          var dateStr = ev.event_date ? new Date(ev.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
          return '<div class="gallery-pending-item" style="cursor:default;">'
            + '<div class="gallery-pending-info">'
            +   '<div class="gallery-pending-member">' + escapeHTML(ev.name) + '</div>'
            +   '<div class="gallery-pending-meta">'
            +     (dateStr ? dateStr + ' · ' : '') + 'Sort: ' + ev.sort_order
            +     (ev.description ? ' · ' + escapeHTML(ev.description) : '')
            +   '</div>'
            + '</div>'
            + '<div style="display:flex;gap:0.3rem;flex-shrink:0;">'
            +   '<button class="btn btn-outline btn-sm" style="font-size:0.7rem;" data-action="edit-event" data-id="' + escapeHTML(String(ev.id)) + '">Edit</button>'
            +   '<button class="btn btn-outline btn-sm" style="font-size:0.7rem;border-color:var(--orange);color:var(--orange);" data-action="delete-event" data-id="' + escapeHTML(String(ev.id)) + '" data-name="' + escapeHTML(ev.name) + '">Delete</button>'
            + '</div>'
            + '</div>';
        }).join('');
      }

      list.innerHTML += '<div style="padding:0.75rem;text-align:center;">'
        + '<button class="btn btn-primary btn-sm" data-action="show-gallery-event-form">+ Add Event Tab</button>'
        + '</div>';
    }

    window.showGalleryEventForm = function() {
      _editingEventId = null;
      document.getElementById('geFormName').value = '';
      document.getElementById('geFormDate').value = '';
      document.getElementById('geFormSort').value = '10';
      document.getElementById('geFormDesc').value = '';
      document.getElementById('geFormStatus').textContent = '';
      document.getElementById('galleryEventForm').classList.remove('hidden');
    };

    window.cancelGalleryEventForm = function() {
      _editingEventId = null;
      document.getElementById('galleryEventForm').classList.add('hidden');
    };

    window.editGalleryEvent = async function(eventId) {
      var { data, error } = await getSB()
        .from('gallery_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error || !data) { alert('Could not load event.'); return; }

      _editingEventId = eventId;
      document.getElementById('geFormName').value = data.name || '';
      document.getElementById('geFormDate').value = data.event_date || '';
      document.getElementById('geFormSort').value = data.sort_order || 0;
      document.getElementById('geFormDesc').value = data.description || '';
      document.getElementById('geFormStatus').textContent = 'Editing: ' + data.name;
      document.getElementById('galleryEventForm').classList.remove('hidden');
    };

    window.saveGalleryEvent = async function() {
      var name = document.getElementById('geFormName').value.trim();
      var status = document.getElementById('geFormStatus');
      if (!name) { status.textContent = 'Name is required.'; status.style.color = 'var(--orange)'; return; }

      var payload = {
        name: name,
        event_date: document.getElementById('geFormDate').value || null,
        sort_order: parseInt(document.getElementById('geFormSort').value) || 0,
        description: document.getElementById('geFormDesc').value.trim() || null
      };

      status.textContent = 'Saving…'; status.style.color = 'var(--text-mid)';

      var result;
      if (_editingEventId) {
        result = await getSB().from('gallery_events').update(payload).eq('id', _editingEventId);
      } else {
        result = await getSB().from('gallery_events').insert(payload);
      }

      if (result.error) {
        status.textContent = 'Error: ' + result.error.message; status.style.color = 'var(--orange)';
        return;
      }

      status.textContent = _editingEventId ? 'Updated!' : 'Created!';
      status.style.color = 'green';
      _editingEventId = null;
      document.getElementById('galleryEventForm').classList.add('hidden');
      loadGalleryEvents();
      loadGalleryTabs();
    };

    window.deleteGalleryEvent = async function(eventId, eventName) {
      if (!confirm('Delete event tab "' + eventName + '"? Photos tagged to it will move to Fish Pics.')) return;

      await getSB().from('gallery_submissions').update({ event_id: null }).eq('event_id', eventId);
      var { error } = await getSB().from('gallery_events').delete().eq('id', eventId);

      if (error) { alert('Delete failed: ' + error.message); return; }
      loadGalleryEvents();
      loadGalleryTabs();
    };
    // ── End Gallery Admin Approval ────────────────────────────────

    // ── Community Admin — Pending approvals ───────────────────
    function loadPendingTrips() {
      var list = document.getElementById('tripsPendingList');
      var badge = document.getElementById('tripsPendingCount');
      if (!list) return;
      getSB().from('trips').select('*, profiles(display_name)').eq('status','pending')
        .then(function(res) {
          if (res.error || !res.data || !res.data.length) { list.innerHTML = '<div class="admin-empty">No pending trips.</div>'; return; }
          if (badge) { badge.textContent = res.data.length; badge.style.display = ''; }
          list.innerHTML = res.data.map(function(t) {
            var name = (t.profiles && t.profiles.display_name) ? escapeHTML(t.profiles.display_name) : 'Member';
            return '<div class="admin-card"><div class="admin-card-info"><strong>' + escapeHTML(t.title) + '</strong><br><span style="font-size:0.8rem;color:var(--text-mid);">' + name + ' · ' + escapeHTML(t.trip_date) + '</span></div>' +
              '<div class="admin-card-actions">' +
              '<button class="btn-approve" data-action="approve-content" data-table="trips" data-id="' + escapeHTML(String(t.id)) + '" data-status="approved">Approve</button>' +
              '<button class="btn-reject"  data-action="approve-content" data-table="trips" data-id="' + escapeHTML(String(t.id)) + '" data-status="cancelled">Reject</button>' +
              '</div></div>';
          }).join('');
        });
    }

    function loadPendingGuides() {
      var list = document.getElementById('guidesPendingList');
      var badge = document.getElementById('guidesPendingCount');
      if (!list) return;
      getSB().from('guide_postings').select('*, profiles(display_name)').eq('status','pending')
        .then(function(res) {
          if (res.error || !res.data || !res.data.length) { list.innerHTML = '<div class="admin-empty">No pending guide listings.</div>'; return; }
          if (badge) { badge.textContent = res.data.length; badge.style.display = ''; }
          list.innerHTML = res.data.map(function(g) {
            var name = (g.profiles && g.profiles.display_name) ? escapeHTML(g.profiles.display_name) : 'Member';
            return '<div class="admin-card"><div class="admin-card-info"><strong>' + escapeHTML(g.title) + '</strong><br><span style="font-size:0.8rem;color:var(--text-mid);">' + name + '</span></div>' +
              '<div class="admin-card-actions">' +
              '<button class="btn-approve" data-action="approve-content" data-table="guide_postings" data-id="' + escapeHTML(String(g.id)) + '" data-status="approved">Approve</button>' +
              '<button class="btn-reject"  data-action="approve-content" data-table="guide_postings" data-id="' + escapeHTML(String(g.id)) + '" data-status="removed">Reject</button>' +
              '</div></div>';
          }).join('');
        });
    }

    function loadPendingClassifieds() {
      var list = document.getElementById('classifiedsPendingList');
      var badge = document.getElementById('classifiedsPendingCount');
      if (!list) return;
      getSB().from('classifieds').select('*, profiles(display_name)').eq('status','pending')
        .then(function(res) {
          if (res.error || !res.data || !res.data.length) { list.innerHTML = '<div class="admin-empty">No pending listings.</div>'; return; }
          if (badge) { badge.textContent = res.data.length; badge.style.display = ''; }
          list.innerHTML = res.data.map(function(c) {
            var name = (c.profiles && c.profiles.display_name) ? escapeHTML(c.profiles.display_name) : 'Member';
            return '<div class="admin-card"><div class="admin-card-info"><strong>' + escapeHTML(c.title) + '</strong><br><span style="font-size:0.8rem;color:var(--text-mid);">' + name + (c.price ? ' · ' + escapeHTML(c.price) : '') + '</span></div>' +
              '<div class="admin-card-actions">' +
              '<button class="btn-approve" data-action="approve-content" data-table="classifieds" data-id="' + escapeHTML(String(c.id)) + '" data-status="approved">Approve</button>' +
              '<button class="btn-reject"  data-action="approve-content" data-table="classifieds" data-id="' + escapeHTML(String(c.id)) + '" data-status="removed">Reject</button>' +
              '</div></div>';
          }).join('');
        });
    }

    function approveContent(table, id, status, btn) {
      if (!btn) return;
      btn.disabled = true;
      getSB().from(table).update({ status: status }).eq('id', id)
        .then(function(res) {
          if (res.error) { btn.disabled = false; console.error(res.error); return; }
          var card = btn.closest('.admin-card');
          if (card) card.remove();
          showCommToast(status === 'approved' ? 'Approved ✓' : 'Rejected');
        });
    }
    // ── End Community Admin ───────────────────────────────────

    // ── Tab switcher ──────────────────────────────────────────
    window.switchPrimaryTab = function (tab) {
      ['Feed', 'Community', 'Map', 'Admin'].forEach(function (t) {
        var panel = document.getElementById('memberTab' + t);
        if (panel) panel.style.display = t === tab ? '' : 'none';
        var btn = document.getElementById('mpt' + t);
        if (btn) { btn.classList.toggle('active', t === tab); btn.setAttribute('aria-selected', t === tab ? 'true' : 'false'); }
      });
      var secNav = document.getElementById('memberSecondaryNav');
      if (secNav) secNav.style.display = tab === 'Community' ? 'flex' : 'none';
      if (tab === 'Feed')      { loadFeed(); }
      if (tab === 'Community') { if (typeof loadCurrentCommunityTab === 'function') loadCurrentCommunityTab(); }
      if (tab === 'Map')       { if (_memberMap) setTimeout(function () { _memberMap.invalidateSize(); }, 50); }
      if (tab === 'Admin')     { loadAdminQueues(); loadPendingGallerySubmissions(); }
    };

    // ── Keyboard navigation for tab bars ──────────────────────
    document.addEventListener('keydown', function(e) {
      var tab = document.activeElement;
      if (!tab) return;
      var isPrimary = tab.classList.contains('member-primary-tab');
      var isSecondary = tab.classList.contains('member-secondary-tab');
      if (!isPrimary && !isSecondary) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var tabs = Array.from(tab.parentElement.querySelectorAll(isPrimary ? '.member-primary-tab' : '.member-secondary-tab'));
      tabs = tabs.filter(function(t) { return t.style.display !== 'none'; });
      var idx = tabs.indexOf(tab);
      if (idx === -1) return;
      var next = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });

    // Community sub-tab switching (stubs — content added in wave-2-community)
    var _currentCommunityTab = 'Trips';
    window.switchCommunityTab = function (tab) {
      _currentCommunityTab = tab;
      ['Trips','Guides','Gear','Forum','Leaderboard','Recipes'].forEach(function (t) {
        var btn = document.getElementById('mst' + t);
        if (btn) btn.classList.toggle('active', t === tab);
      });
      if (typeof loadCurrentCommunityTab === 'function') loadCurrentCommunityTab();
    };

    function loadCurrentCommunityTab() {
      var loaders = {
        Trips: loadTrips, Guides: loadGuides, Gear: loadClassifieds,
        Forum: loadForum, Leaderboard: loadCommunityLeaderboard, Recipes: loadRecipes
      };
      ['Trips','Guides','Gear','Forum','Leaderboard','Recipes'].forEach(function(t) {
        var p = document.getElementById('commPanel' + t);
        if (p) p.style.display = t === _currentCommunityTab ? '' : 'none';
      });
      var fn = loaders[_currentCommunityTab];
      if (typeof fn === 'function') fn();
    }

    // ── Community post modal ──────────────────────────────────
    function openCommModal(type, config) {
      var modal = document.getElementById('commPostModal');
      var title = document.getElementById('commPostModalTitle');
      var body  = document.getElementById('commPostModalBody');
      if (!modal || !title || !body) return;
      title.textContent = config.title;
      body.innerHTML = config.formHtml;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeCommModal() {
      var modal = document.getElementById('commPostModal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    function showCommToast(msg) {
      var t = document.createElement('div');
      t.textContent = msg;
      t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--green-deep);color:var(--gold);font-family:Lora,serif;font-size:0.82rem;padding:0.6rem 1.2rem;border-radius:2rem;box-shadow:0 4px 16px rgba(0,0,0,0.25);z-index:300;';
      document.body.appendChild(t);
      setTimeout(function() { t.remove(); }, 3000);
    }

    // Close modal on overlay click
    document.addEventListener('click', function(e) {
      var modal = document.getElementById('commPostModal');
      if (modal && e.target === modal) closeCommModal();
    });

    // ── Trips ─────────────────────────────────────────────────
    var _tripsLoaded = false;

    // Cache RSVP data keyed by trip_id → array of { member_id, display_name }
    var _tripRsvps = {};

    function loadTrips() {
      var panel = document.getElementById('commPanelTrips');
      if (!panel || _tripsLoaded) return;
      _tripsLoaded = true;
      panel.innerHTML = '<div class="comm-empty">Loading trips…</div>';
      getSB().from('trips').select('*, profiles(display_name)')
        .eq('status','approved').is('archived_at', null).order('trip_date', { ascending: true })
        .then(function(res) {
          if (res.error || !res.data) { panel.innerHTML = '<div class="comm-empty">Could not load trips.</div>'; return; }
          // Fetch all RSVPs for approved trips
          var tripIds = res.data.map(function(t) { return t.id; });
          if (tripIds.length) {
            getSB().from('trip_rsvps').select('trip_id, member_id, profiles(display_name)')
              .in('trip_id', tripIds)
              .then(function(rsvpRes) {
                if (rsvpRes.data) {
                  rsvpRes.data.forEach(function(r) {
                    if (!_tripRsvps[r.trip_id]) _tripRsvps[r.trip_id] = [];
                    _tripRsvps[r.trip_id].push({
                      member_id: r.member_id,
                      display_name: (r.profiles && r.profiles.display_name) ? r.profiles.display_name : 'Member'
                    });
                  });
                }
                renderTripsPanel(panel, res.data);
              });
          } else {
            renderTripsPanel(panel, res.data);
          }
        });
    }

    function renderTripsPanel(panel, data) {
      var club   = data.filter(function(t) { return t.type === 'club'; });
      var member = data.filter(function(t) { return t.type === 'member'; });
      var html = '<button class="comm-post-btn" data-action="open-trip-form">+ Post a Trip</button>' +
        '<div class="comm-approval-note">Member-posted trips are reviewed by Kyle before appearing here.</div>';
      if (club.length)   { html += '<div class="comm-section-heading">Club Events</div>'  + club.map(renderTripCard).join(''); }
      if (member.length) { html += '<div class="comm-section-heading">Member Trips</div>' + member.map(renderTripCard).join(''); }
      if (!club.length && !member.length) html += '<div class="comm-empty">No upcoming trips — be the first to post one!</div>';
      panel.innerHTML = html;
    }

    function renderTripCard(trip) {
      var name  = (trip.profiles && trip.profiles.display_name) ? escapeHTML(trip.profiles.display_name) : 'Member';
      var date  = new Date(trip.trip_date).toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' });
      var spots = trip.max_spots ? trip.max_spots + ' spots' : 'Open';
      var rsvps = _tripRsvps[trip.id] || [];
      var rsvpCount = rsvps.length;
      var rsvpNames = rsvps.map(function(r) { return escapeHTML(r.display_name); }).join(', ');
      var alreadyRsvpd = _currentUser && rsvps.some(function(r) { return r.member_id === _currentUser.id; });
      var isOwner = _currentUser && trip.created_by === _currentUser.id;

      var rsvpBadge = rsvpCount > 0
        ? '<span style="font-size:0.68rem;color:var(--green-water);background:rgba(26,74,107,0.08);padding:0.2rem 0.6rem;border-radius:1rem;border:1px solid rgba(26,74,107,0.2);" title="' + rsvpNames + '">' + rsvpCount + ' going</span>'
        : '';

      return '<div class="comm-card" id="trip-card-' + escapeHTML(trip.id) + '">' +
        '<span class="comm-card-badge ' + (trip.type === 'club' ? 'badge-club' : 'badge-member') + '">' + (trip.type === 'club' ? 'Club Event' : 'Member Trip') + '</span>' +
        (isOwner ? '<button class="comm-edit-btn" data-action="edit-trip" data-id="' + escapeHTML(String(trip.id)) + '">Edit</button>' : '') +
        '<div class="comm-card-title">' + escapeHTML(trip.title) + '</div>' +
        '<div class="comm-card-meta">' + date + (trip.location ? ' · ' + escapeHTML(trip.location) : '') + '<br>Posted by ' + name + '</div>' +
        (trip.description ? '<div class="comm-card-meta">' + escapeHTML(trip.description) + '</div>' : '') +
        (rsvpCount > 0 ? '<div class="comm-rsvp-list" style="font-size:0.75rem;color:var(--text-mid);padding:0.4rem 0;border-top:1px solid #e8eef3;margin-top:0.5rem;">Going: ' + rsvpNames + '</div>' : '') +
        '<div class="comm-card-footer">' +
          '<span style="font-size:0.68rem;color:var(--text-mid);background:var(--cream);padding:0.2rem 0.6rem;border-radius:1rem;border:1px solid #ccdde8;">' + escapeHTML(spots) + '</span>' +
          rsvpBadge +
          (alreadyRsvpd
            ? '<button class="comm-cta-btn" disabled>RSVP\'d ✓</button>'
            : '<button class="comm-cta-btn" data-action="rsvp-trip" data-id="' + escapeHTML(String(trip.id)) + '">RSVP</button>') +
        '</div></div>';
    }

    function rsvpTrip(tripId, btn) {
      if (!_currentUser) { alert('Sign in to RSVP.'); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      var userName = (_currentUser.user_metadata && _currentUser.user_metadata.display_name) || _currentUser.email || 'Member';
      getSB().from('trip_rsvps').insert({ trip_id: tripId, member_id: _currentUser.id })
        .then(function(res) {
          if (res.error && res.error.code === '23505') { btn.textContent = "Already RSVP'd"; return; }
          if (res.error) { btn.disabled = false; btn.textContent = 'RSVP'; console.error(res.error); return; }
          btn.textContent = "RSVP'd ✓";
          // Update local RSVP cache and re-render the card
          if (!_tripRsvps[tripId]) _tripRsvps[tripId] = [];
          _tripRsvps[tripId].push({ member_id: _currentUser.id, display_name: userName });
          // Refresh the trips panel to show updated RSVP list
          _tripsLoaded = false;
          loadTrips();
          // Notify the trip author
          notifyTripAuthor(tripId, userName);
        });
    }

    function notifyTripAuthor(tripId, rsvpName) {
      // Fetch the trip to get the author, then send email via Edge Function
      getSB().from('trips').select('created_by, title, profiles(display_name)').eq('id', tripId).single()
        .then(function(res) {
          if (res.error || !res.data) return;
          // Call Edge Function to send email notification (if configured)
          getSB().functions.invoke('notify-rsvp', {
            body: { trip_id: tripId, trip_title: res.data.title, author_id: res.data.created_by, rsvp_name: rsvpName }
          }).catch(function() { /* Notification is best-effort — silently fail */ });
        });
    }

    function openTripForm() {
      openCommModal('trip', {
        title: '🎣 Post a Trip',
        formHtml: '<div class="comm-modal-field"><label>Trip Title *</label><input type="text" id="cfTripTitle" placeholder="e.g. Redfish run at Breton Sound"></div>' +
          '<div class="comm-modal-field"><label>Date *</label><input type="date" id="cfTripDate"></div>' +
          '<div class="comm-modal-field"><label>Location</label><input type="text" id="cfTripLocation" placeholder="e.g. Breton Sound"></div>' +
          '<div class="comm-modal-field"><label>Max Spots</label><input type="number" id="cfTripSpots" min="1" placeholder="Leave blank for open"></div>' +
          '<div class="comm-modal-field"><label>Description</label><textarea id="cfTripDesc" placeholder="Details about the trip…"></textarea></div>' +
          '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-primary" data-action="submit-trip">Submit for Approval</button></div>'
      });
    }

    function submitTrip() {
      if (!_currentUser) { alert('Sign in required.'); return; }
      var title = document.getElementById('cfTripTitle');
      var date  = document.getElementById('cfTripDate');
      if (!title || !title.value.trim()) { alert('Trip title is required.'); return; }
      if (!date  || !date.value)          { alert('Date is required.'); return; }
      var spots = document.getElementById('cfTripSpots');
      var spotsVal = spots && spots.value ? parseInt(spots.value) : null;
      getSB().from('trips').insert({
        created_by: _currentUser.id, type: 'member', status: 'pending',
        title: title.value.trim(),
        trip_date: date.value,
        location: (document.getElementById('cfTripLocation') || {}).value || '',
        description: (document.getElementById('cfTripDesc') || {}).value || '',
        max_spots: spotsVal
      }).then(function(res) {
        if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
        closeCommModal();
        showCommToast('Trip submitted — Kyle will review it before it goes live.');
      });
    }
    // ── Edit Trip (member self-edit, no re-approval) ──
    var _editingTripId = null;

    function editTrip(tripId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      _editingTripId = tripId;
      getSB().from('trips').select('*').eq('id', tripId).single()
        .then(function(res) {
          if (res.error || !res.data) { alert('Could not load trip.'); return; }
          var t = res.data;
          openCommModal('trip-edit', {
            title: '✏️ Edit Trip',
            formHtml: '<div class="comm-modal-field"><label>Trip Title *</label><input type="text" id="cfTripTitle" value="' + escapeHTML(t.title) + '"></div>' +
              '<div class="comm-modal-field"><label>Date *</label><input type="date" id="cfTripDate" value="' + escapeHTML(t.trip_date) + '"></div>' +
              '<div class="comm-modal-field"><label>Location</label><input type="text" id="cfTripLocation" value="' + escapeHTML(t.location || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Max Spots</label><input type="number" id="cfTripSpots" min="1" value="' + (t.max_spots || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Description</label><textarea id="cfTripDesc">' + escapeHTML(t.description || '') + '</textarea></div>' +
              '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-outline" style="border-color:var(--orange);color:var(--orange);" data-action="archive-post" data-table="trips" data-owner="created_by" data-id="' + escapeHTML(String(t.id)) + '">Archive</button><button class="btn btn-primary" data-action="save-edit-trip">Save Changes</button></div>'
          });
        });
    }

    function saveEditTrip() {
      if (!_currentUser || !_editingTripId) return;
      var title = document.getElementById('cfTripTitle');
      var date  = document.getElementById('cfTripDate');
      if (!title || !title.value.trim()) { alert('Trip title is required.'); return; }
      if (!date  || !date.value)          { alert('Date is required.'); return; }
      var spots = document.getElementById('cfTripSpots');
      var spotsVal = spots && spots.value ? parseInt(spots.value) : null;
      getSB().from('trips').update({
        title: title.value.trim(),
        trip_date: date.value,
        location: (document.getElementById('cfTripLocation') || {}).value || '',
        description: (document.getElementById('cfTripDesc') || {}).value || '',
        max_spots: spotsVal
      }).eq('id', _editingTripId).eq('created_by', _currentUser.id)
        .then(function(res) {
          if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
          _editingTripId = null;
          closeCommModal();
          showCommToast('Trip updated.');
          _tripsLoaded = false;
          loadTrips();
        });
    }
    // ── End Trips ─────────────────────────────────────────────

    // ── Guides ────────────────────────────────────────────────
    var _guidesLoaded = false;

    function loadGuides() {
      var panel = document.getElementById('commPanelGuides');
      if (!panel || _guidesLoaded) return;
      _guidesLoaded = true;
      panel.innerHTML = '<div class="comm-empty">Loading guides…</div>';
      getSB().from('guide_postings').select('*, profiles(display_name)')
        .eq('status','approved').is('archived_at', null).order('created_at', { ascending: false })
        .then(function(res) {
          if (res.error || !res.data) { panel.innerHTML = '<div class="comm-empty">Could not load guide listings.</div>'; return; }
          var html = '<button class="comm-post-btn" data-action="open-guide-form">+ List Your Guide Services</button>' +
            '<div class="comm-approval-note">Guide listings are reviewed by Kyle before appearing here.</div>';
          if (!res.data.length) html += '<div class="comm-empty">No guide listings yet.</div>';
          else html += res.data.map(renderGuideCard).join('');
          panel.innerHTML = html;
        });
    }

    function renderGuideCard(g) {
      var name = (g.profiles && g.profiles.display_name) ? escapeHTML(g.profiles.display_name) : 'Member';
      var isOwner = _currentUser && g.guide_id === _currentUser.id;
      return '<div class="comm-card">' +
        '<span class="comm-card-badge badge-guide">Guide</span>' +
        (isOwner ? '<button class="comm-edit-btn" data-action="edit-guide" data-id="' + escapeHTML(String(g.id)) + '">Edit</button>' : '') +
        '<div class="comm-card-title">' + escapeHTML(g.title) + '</div>' +
        '<div class="comm-card-meta">' +
          (g.rate ? 'Rate: ' + escapeHTML(g.rate) + '<br>' : '') +
          (g.available_dates ? 'Available: ' + escapeHTML(g.available_dates) + '<br>' : '') +
          'Posted by ' + name +
        '</div>' +
        (g.description ? '<div class="comm-card-meta">' + escapeHTML(g.description) + '</div>' : '') +
        '<div class="comm-card-footer"><span></span>' +
          (g.contact ? '<a href="mailto:' + escapeHTML(g.contact) + '" class="comm-cta-btn" style="text-decoration:none;">Contact</a>' : '') +
        '</div></div>';
    }

    function openGuideForm() {
      openCommModal('guide', {
        title: '🧑‍✈️ List Your Guide Services',
        formHtml: '<div class="comm-modal-field"><label>Listing Title *</label><input type="text" id="cfGuideTitle" placeholder="e.g. Half-day inshore trips — Plaquemines Parish"></div>' +
          '<div class="comm-modal-field"><label>Rate</label><input type="text" id="cfGuideRate" placeholder="e.g. $250 half-day, $400 full-day"></div>' +
          '<div class="comm-modal-field"><label>Available Dates / Schedule</label><input type="text" id="cfGuideDates" placeholder="e.g. Weekends Apr–Oct"></div>' +
          '<div class="comm-modal-field"><label>Contact (email or phone)</label><input type="text" id="cfGuideContact"></div>' +
          '<div class="comm-modal-field"><label>Description</label><textarea id="cfGuideDesc" placeholder="Tell members about your experience and what you offer…"></textarea></div>' +
          '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-primary" data-action="submit-guide">Submit for Approval</button></div>'
      });
    }

    function submitGuide() {
      if (!_currentUser) { alert('Sign in required.'); return; }
      var title = document.getElementById('cfGuideTitle');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      getSB().from('guide_postings').insert({
        guide_id: _currentUser.id, status: 'pending',
        title: title.value.trim(),
        rate:            (document.getElementById('cfGuideRate')    || {}).value || '',
        available_dates: (document.getElementById('cfGuideDates')   || {}).value || '',
        contact:         (document.getElementById('cfGuideContact') || {}).value || '',
        description:     (document.getElementById('cfGuideDesc')    || {}).value || ''
      }).then(function(res) {
        if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
        closeCommModal();
        showCommToast('Guide listing submitted — Kyle will review it before it goes live.');
      });
    }
    // ── Edit Guide (member self-edit, no re-approval) ──
    var _editingGuideId = null;

    function editGuide(guideId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      _editingGuideId = guideId;
      getSB().from('guide_postings').select('*').eq('id', guideId).single()
        .then(function(res) {
          if (res.error || !res.data) { alert('Could not load guide.'); return; }
          var g = res.data;
          openCommModal('guide-edit', {
            title: '✏️ Edit Guide Listing',
            formHtml: '<div class="comm-modal-field"><label>Listing Title *</label><input type="text" id="cfGuideTitle" value="' + escapeHTML(g.title) + '"></div>' +
              '<div class="comm-modal-field"><label>Rate</label><input type="text" id="cfGuideRate" value="' + escapeHTML(g.rate || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Available Dates / Schedule</label><input type="text" id="cfGuideDates" value="' + escapeHTML(g.available_dates || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Contact (email or phone)</label><input type="text" id="cfGuideContact" value="' + escapeHTML(g.contact || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Description</label><textarea id="cfGuideDesc">' + escapeHTML(g.description || '') + '</textarea></div>' +
              '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-outline" style="border-color:var(--orange);color:var(--orange);" data-action="archive-post" data-table="guide_postings" data-owner="guide_id" data-id="' + escapeHTML(String(g.id)) + '">Archive</button><button class="btn btn-primary" data-action="save-edit-guide">Save Changes</button></div>'
          });
        });
    }

    function saveEditGuide() {
      if (!_currentUser || !_editingGuideId) return;
      var title = document.getElementById('cfGuideTitle');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      getSB().from('guide_postings').update({
        title: title.value.trim(),
        rate: (document.getElementById('cfGuideRate') || {}).value || '',
        available_dates: (document.getElementById('cfGuideDates') || {}).value || '',
        contact: (document.getElementById('cfGuideContact') || {}).value || '',
        description: (document.getElementById('cfGuideDesc') || {}).value || ''
      }).eq('id', _editingGuideId).eq('guide_id', _currentUser.id)
        .then(function(res) {
          if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
          _editingGuideId = null;
          closeCommModal();
          showCommToast('Guide listing updated.');
          _guidesLoaded = false;
          loadGuides();
        });
    }
    // ── End Guides ────────────────────────────────────────────

    // ── Gear / Classifieds ────────────────────────────────────
    var _classifiedsLoaded = false;

    function loadClassifieds() {
      var panel = document.getElementById('commPanelGear');
      if (!panel || _classifiedsLoaded) return;
      _classifiedsLoaded = true;
      panel.innerHTML = '<div class="comm-empty">Loading listings…</div>';
      getSB().from('classifieds').select('*, profiles(display_name)')
        .eq('status','approved').is('archived_at', null).order('created_at', { ascending: false })
        .then(function(res) {
          if (res.error || !res.data) { panel.innerHTML = '<div class="comm-empty">Could not load listings.</div>'; return; }
          var html = '<button class="comm-post-btn" data-action="open-gear-form">+ Post a Listing</button>' +
            '<div class="comm-approval-note">Listings are reviewed by Kyle before appearing here.</div>';
          if (!res.data.length) html += '<div class="comm-empty">No listings yet.</div>';
          else html += res.data.map(renderClassifiedCard).join('');
          panel.innerHTML = html;
        });
    }

    function renderClassifiedCard(c) {
      var name = (c.profiles && c.profiles.display_name) ? escapeHTML(c.profiles.display_name) : 'Member';
      var isOwner = _currentUser && c.seller_id === _currentUser.id;
      return '<div class="comm-card">' +
        '<span class="comm-card-badge badge-gear">Gear</span>' +
        (c.sold ? '<span class="comm-card-badge" style="background:#e5e7eb;color:#6b7280;margin-left:0.4rem;">SOLD</span>' : '') +
        (isOwner ? '<button class="comm-edit-btn" data-action="edit-gear" data-id="' + escapeHTML(String(c.id)) + '">Edit</button>' : '') +
        '<div class="comm-card-title">' + escapeHTML(c.title) + '</div>' +
        (c.photo_url ? '<img src="' + escapeHTML(c.photo_url) + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:0.5rem;margin-bottom:0.6rem;" alt="">' : '') +
        '<div class="comm-card-meta">' +
          (c.price ? '<strong>' + escapeHTML(c.price) + '</strong><br>' : '') +
          (c.description ? escapeHTML(c.description) + '<br>' : '') +
          'Posted by ' + name +
        '</div>' +
        '<div class="comm-card-footer"><span></span>' +
          (c.contact && !c.sold ? '<a href="mailto:' + escapeHTML(c.contact) + '" class="comm-cta-btn" style="text-decoration:none;">Contact Seller</a>' : '') +
        '</div></div>';
    }

    function openGearForm() {
      openCommModal('gear', {
        title: '🛒 Post a Listing',
        formHtml: '<div class="comm-modal-field"><label>Item Title *</label><input type="text" id="cfGearTitle" placeholder="e.g. Minn Kota Terrova 80 — like new"></div>' +
          '<div class="comm-modal-field"><label>Price</label><input type="text" id="cfGearPrice" placeholder="e.g. $650 OBO"></div>' +
          '<div class="comm-modal-field"><label>Description</label><textarea id="cfGearDesc" placeholder="Condition, specs, any defects…"></textarea></div>' +
          '<div class="comm-modal-field"><label>Contact (email or phone)</label><input type="text" id="cfGearContact"></div>' +
          '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-primary" data-action="submit-gear">Submit for Approval</button></div>'
      });
    }

    function submitGear() {
      if (!_currentUser) { alert('Sign in required.'); return; }
      var title = document.getElementById('cfGearTitle');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      getSB().from('classifieds').insert({
        seller_id: _currentUser.id, status: 'pending', sold: false,
        title:       title.value.trim(),
        price:       (document.getElementById('cfGearPrice')   || {}).value || '',
        description: (document.getElementById('cfGearDesc')    || {}).value || '',
        contact:     (document.getElementById('cfGearContact') || {}).value || ''
      }).then(function(res) {
        if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
        closeCommModal();
        showCommToast('Listing submitted — Kyle will review it before it goes live.');
      });
    }
    // ── Edit Gear / Classified (member self-edit, no re-approval) ──
    var _editingGearId = null;

    function editGear(gearId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      _editingGearId = gearId;
      getSB().from('classifieds').select('*').eq('id', gearId).single()
        .then(function(res) {
          if (res.error || !res.data) { alert('Could not load listing.'); return; }
          var c = res.data;
          openCommModal('gear-edit', {
            title: '✏️ Edit Listing',
            formHtml: '<div class="comm-modal-field"><label>Item Title *</label><input type="text" id="cfGearTitle" value="' + escapeHTML(c.title) + '"></div>' +
              '<div class="comm-modal-field"><label>Price</label><input type="text" id="cfGearPrice" value="' + escapeHTML(c.price || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Description</label><textarea id="cfGearDesc">' + escapeHTML(c.description || '') + '</textarea></div>' +
              '<div class="comm-modal-field"><label>Contact (email or phone)</label><input type="text" id="cfGearContact" value="' + escapeHTML(c.contact || '') + '"></div>' +
              '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-outline" style="border-color:var(--orange);color:var(--orange);" data-action="archive-post" data-table="classifieds" data-owner="seller_id" data-id="' + escapeHTML(String(c.id)) + '">Archive</button><button class="btn btn-primary" data-action="save-edit-gear">Save Changes</button></div>'
          });
        });
    }

    function saveEditGear() {
      if (!_currentUser || !_editingGearId) return;
      var title = document.getElementById('cfGearTitle');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      getSB().from('classifieds').update({
        title: title.value.trim(),
        price: (document.getElementById('cfGearPrice') || {}).value || '',
        description: (document.getElementById('cfGearDesc') || {}).value || '',
        contact: (document.getElementById('cfGearContact') || {}).value || ''
      }).eq('id', _editingGearId).eq('seller_id', _currentUser.id)
        .then(function(res) {
          if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
          _editingGearId = null;
          closeCommModal();
          showCommToast('Listing updated.');
          _classifiedsLoaded = false;
          loadClassifieds();
        });
    }
    // ── End Gear / Classifieds ────────────────────────────────

    // ── Forum ─────────────────────────────────────────────────
    var _forumLoaded = false;

    function loadForum() {
      var panel = document.getElementById('commPanelForum');
      if (!panel || _forumLoaded) return;
      _forumLoaded = true;
      panel.innerHTML = '<div class="comm-empty">Loading forum…</div>';
      getSB().from('forum_threads').select('*, profiles(display_name)')
        .eq('status','approved').is('archived_at', null).order('created_at', { ascending: false })
        .then(function(res) {
          if (res.error || !res.data) { panel.innerHTML = '<div class="comm-empty">Could not load forum.</div>'; return; }
          var categories = ['general','gear','spots','recipes'];
          var byCategory = {};
          categories.forEach(function(c) { byCategory[c] = []; });
          res.data.forEach(function(t) { if (byCategory[t.category]) byCategory[t.category].push(t); });
          var html = '<button class="comm-post-btn" data-action="open-forum-form">+ Start a Thread</button>';
          var labels = { general:'General', gear:'Gear Talk', spots:'Fishing Spots', recipes:'Recipes & Cooking' };
          categories.forEach(function(cat) {
            if (!byCategory[cat].length) return;
            html += '<div class="comm-section-heading">' + labels[cat] + '</div>';
            html += byCategory[cat].map(renderThreadCard).join('');
          });
          if (!res.data.length) html += '<div class="comm-empty">No threads yet — start the conversation!</div>';
          panel.innerHTML = html;
        });
    }

    function renderThreadCard(t) {
      var name = (t.profiles && t.profiles.display_name) ? escapeHTML(t.profiles.display_name) : 'Member';
      var date = new Date(t.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
      var isOwner = _currentUser && t.author_id === _currentUser.id;
      return '<div class="comm-card">' +
        '<span class="comm-card-badge badge-forum">' + escapeHTML(t.category) + '</span>' +
        (isOwner ? '<button class="comm-edit-btn" data-action="edit-thread" data-id="' + escapeHTML(String(t.id)) + '">Edit</button>' : '') +
        '<div class="comm-card-title">' + escapeHTML(t.title) + '</div>' +
        '<div class="comm-card-meta">' + name + ' · ' + date + '</div>' +
        (t.body ? '<div class="comm-card-meta">' + escapeHTML(t.body).substring(0, 200) + (t.body.length > 200 ? '…' : '') + '</div>' : '') +
        '<div class="comm-card-footer"><span></span>' +
          '<button class="comm-cta-btn" data-action="toggle-replies" data-thread-id="' + escapeHTML(String(t.id)) + '">💬 Replies</button>' +
        '</div>' +
        '<div id="replies-' + escapeHTML(t.id) + '" style="display:none;margin-top:0.75rem;border-top:1px solid #ccdde8;padding-top:0.75rem;"></div>' +
        '</div>';
    }

    function toggleReplies(threadId, btn) {
      var container = document.getElementById('replies-' + threadId);
      if (!container) return;
      if (container.style.display !== 'none') { container.style.display = 'none'; return; }
      container.style.display = '';
      container.innerHTML = '<div class="comm-empty" style="padding:0.5rem;">Loading replies…</div>';
      getSB().from('forum_replies').select('*, profiles(display_name)')
        .eq('thread_id', threadId).order('created_at', { ascending: true })
        .then(function(res) {
          var html = '';
          if (res.data && res.data.length) {
            html = res.data.map(function(r) {
              var rName = (r.profiles && r.profiles.display_name) ? escapeHTML(r.profiles.display_name) : 'Member';
              var rDate = new Date(r.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' });
              return '<div style="margin-bottom:0.6rem;"><span style="font-size:0.75rem;font-weight:600;color:var(--green-deep);">' + rName + '</span> <span style="font-size:0.7rem;color:var(--text-mid);">· ' + rDate + '</span><div style="font-size:0.8rem;margin-top:0.2rem;">' + escapeHTML(r.body) + '</div></div>';
            }).join('');
          }
          html += '<div style="display:flex;gap:0.5rem;margin-top:0.5rem;">' +
            '<input type="text" class="form-input" id="replyInput-' + escapeHTML(threadId) + '" placeholder="Add a reply…" style="flex:1;font-size:0.78rem;">' +
            '<button class="comm-cta-btn" data-action="post-reply" data-thread-id="' + escapeHTML(String(threadId)) + '">Post</button></div>';
          container.innerHTML = html;
        });
    }

    function postReply(threadId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      var input = document.getElementById('replyInput-' + threadId);
      if (!input || !input.value.trim()) return;
      getSB().from('forum_replies').insert({ thread_id: threadId, author_id: _currentUser.id, body: input.value.trim() })
        .then(function(res) {
          if (res.error) { console.error(res.error); return; }
          input.value = '';
          toggleReplies(threadId, null);
          toggleReplies(threadId, null);
        });
    }

    function openForumForm() {
      openCommModal('forum', {
        title: '💬 Start a Thread',
        formHtml: '<div class="comm-modal-field"><label>Title *</label><input type="text" id="cfForumTitle" placeholder="What\'s on your mind?"></div>' +
          '<div class="comm-modal-field"><label>Category</label><select id="cfForumCat"><option value="general">General</option><option value="gear">Gear Talk</option><option value="spots">Fishing Spots</option><option value="recipes">Recipes & Cooking</option></select></div>' +
          '<div class="comm-modal-field"><label>Body</label><textarea id="cfForumBody" placeholder="Share details, ask a question…"></textarea></div>' +
          '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-primary" data-action="submit-thread">Post Thread</button></div>'
      });
    }

    function submitThread() {
      if (!_currentUser) { alert('Sign in required.'); return; }
      var title = document.getElementById('cfForumTitle');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      getSB().from('forum_threads').insert({
        author_id: _currentUser.id, status: 'approved',
        title:    title.value.trim(),
        category: (document.getElementById('cfForumCat')  || {}).value || 'general',
        body:     (document.getElementById('cfForumBody') || {}).value || ''
      }).then(function(res) {
        if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
        closeCommModal();
        _forumLoaded = false;
        loadForum();
        showCommToast('Thread posted!');
      });
    }
    // ── Edit Thread (member self-edit, no re-approval) ──
    var _editingThreadId = null;

    function editThread(threadId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      _editingThreadId = threadId;
      getSB().from('forum_threads').select('*').eq('id', threadId).single()
        .then(function(res) {
          if (res.error || !res.data) { alert('Could not load thread.'); return; }
          var t = res.data;
          openCommModal('thread-edit', {
            title: '✏️ Edit Thread',
            formHtml: '<div class="comm-modal-field"><label>Title *</label><input type="text" id="cfForumTitle" value="' + escapeHTML(t.title) + '"></div>' +
              '<div class="comm-modal-field"><label>Category</label><select id="cfForumCat"><option value="general" ' + (t.category === 'general' ? 'selected' : '') + '>General</option><option value="gear" ' + (t.category === 'gear' ? 'selected' : '') + '>Gear Talk</option><option value="spots" ' + (t.category === 'spots' ? 'selected' : '') + '>Fishing Spots</option><option value="recipes" ' + (t.category === 'recipes' ? 'selected' : '') + '>Recipes & Cooking</option></select></div>' +
              '<div class="comm-modal-field"><label>Body</label><textarea id="cfForumBody">' + escapeHTML(t.body || '') + '</textarea></div>' +
              '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-outline" style="border-color:var(--orange);color:var(--orange);" data-action="archive-post" data-table="forum_threads" data-owner="author_id" data-id="' + escapeHTML(String(t.id)) + '">Archive</button><button class="btn btn-primary" data-action="save-edit-thread">Save Changes</button></div>'
          });
        });
    }

    function saveEditThread() {
      if (!_currentUser || !_editingThreadId) return;
      var title = document.getElementById('cfForumTitle');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      getSB().from('forum_threads').update({
        title: title.value.trim(),
        category: (document.getElementById('cfForumCat') || {}).value || 'general',
        body: (document.getElementById('cfForumBody') || {}).value || ''
      }).eq('id', _editingThreadId).eq('author_id', _currentUser.id)
        .then(function(res) {
          if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
          _editingThreadId = null;
          closeCommModal();
          showCommToast('Thread updated.');
          _forumLoaded = false;
          loadForum();
        });
    }
    // ── End Forum ─────────────────────────────────────────────

    // ── Community Leaderboard ─────────────────────────────────
    function loadCommunityLeaderboard() {
      var panel = document.getElementById('commPanelLeaderboard');
      if (!panel) return;
      panel.innerHTML = '<div class="comm-empty">Loading leaderboard…</div>';
      var now = new Date();
      var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      var monthName  = now.toLocaleString('en-US', { month:'long', year:'numeric' });
      getSB().from('pins').select('user_id, profiles(display_name)')
        .gte('created_at', monthStart).eq('flagged', false)
        .then(function(res) {
          if (res.error || !res.data) { panel.innerHTML = '<div class="comm-empty">Could not load leaderboard.</div>'; return; }
          var counts = {}, names = {};
          res.data.forEach(function(p) {
            counts[p.user_id] = (counts[p.user_id] || 0) + 1;
            if (p.profiles && p.profiles.display_name) names[p.user_id] = p.profiles.display_name;
          });
          var ranked = Object.keys(counts)
            .map(function(uid) { return { uid: uid, name: names[uid] || 'Member', count: counts[uid] }; })
            .sort(function(a,b) { return b.count - a.count; }).slice(0, 10);
          if (!ranked.length) { panel.innerHTML = '<div class="comm-empty">No catches logged this month yet — be the first! 🎣</div>'; return; }
          var medals = ['🥇','🥈','🥉'];
          var rows = ranked.map(function(r, i) {
            return '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.1);">' +
              '<span style="font-size:1rem;width:28px;text-align:center;">' + (medals[i] || (i+1)+'.') + '</span>' +
              '<span style="flex:1;font-family:\'Lora\',serif;font-size:0.85rem;color:var(--cream);">' + escapeHTML(r.name) + '</span>' +
              '<span style="font-family:\'Lora\',serif;font-size:0.75rem;color:' + (i === 0 ? 'var(--gold)' : 'rgba(200,220,240,0.7)') + ';">' + r.count + ' pin' + (r.count !== 1 ? 's' : '') + '</span>' +
              '</div>';
          }).join('');
          panel.innerHTML = '<div style="background:linear-gradient(135deg,var(--green-deep),var(--green-water));border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem;">' +
            '<div style="font-family:\'Playfair Display\',serif;font-size:1.1rem;color:var(--gold);margin-bottom:1rem;">🏆 ' + escapeHTML(monthName) + ' Leaderboard</div>' +
            rows + '</div>' +
            '<div style="font-size:0.72rem;color:var(--text-mid);font-family:\'Lora\',serif;">Counts pins logged in the Map tab this month. Drops reset on the 1st.</div>';
        });
    }
    // ── End Leaderboard ───────────────────────────────────────

    // ── Recipes ───────────────────────────────────────────────
    var _recipesLoaded = false;

    function loadRecipes() {
      var panel = document.getElementById('commPanelRecipes');
      if (!panel || _recipesLoaded) return;
      _recipesLoaded = true;
      panel.innerHTML = '<div class="comm-empty">Loading recipes…</div>';
      getSB().from('recipes').select('*, profiles(display_name)')
        .eq('status','approved').is('archived_at', null).order('created_at', { ascending: false })
        .then(function(res) {
          if (res.error || !res.data) { panel.innerHTML = '<div class="comm-empty">Could not load recipes.</div>'; return; }
          var html = '<button class="comm-post-btn" data-action="open-recipe-form">+ Share a Recipe</button>';
          if (!res.data.length) html += '<div class="comm-empty">No recipes yet — share your best catch-and-cook!</div>';
          else html += res.data.map(renderRecipeCard).join('');
          panel.innerHTML = html;
        });
    }

    function renderRecipeCard(r) {
      var name = (r.profiles && r.profiles.display_name) ? escapeHTML(r.profiles.display_name) : 'Member';
      var date = new Date(r.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
      var isOwner = _currentUser && r.created_by === _currentUser.id;
      return '<div class="comm-card">' +
        '<span class="comm-card-badge badge-recipe">Recipe</span>' +
        (r.species ? '<span class="comm-card-badge" style="background:rgba(26,74,107,0.1);color:var(--green-water);margin-left:0.4rem;">' + escapeHTML(r.species) + '</span>' : '') +
        (isOwner ? '<button class="comm-edit-btn" data-action="edit-recipe" data-id="' + escapeHTML(String(r.id)) + '">Edit</button>' : '') +
        '<div class="comm-card-title">' + escapeHTML(r.title) + '</div>' +
        (r.photo_url ? '<img src="' + escapeHTML(r.photo_url) + '" style="width:100%;max-height:220px;object-fit:cover;border-radius:0.5rem;margin-bottom:0.6rem;" alt="">' : '') +
        '<div class="comm-card-meta">' + name + ' · ' + date + '</div>' +
        (r.body ? '<div class="comm-card-meta">' + escapeHTML(r.body).substring(0, 300) + (r.body.length > 300 ? '…' : '') + '</div>' : '') +
        '</div>';
    }

    function openRecipeForm() {
      openCommModal('recipe', {
        title: '🍳 Share a Recipe',
        formHtml: '<div class="comm-modal-field"><label>Recipe Title *</label><input type="text" id="cfRecipeTitle" placeholder="e.g. Blackened Speckled Trout with Cajun Butter"></div>' +
          '<div class="comm-modal-field"><label>Species</label><input type="text" id="cfRecipeSpecies" placeholder="e.g. Speckled Trout"></div>' +
          '<div class="comm-modal-field"><label>Recipe *</label><textarea id="cfRecipeBody" style="min-height:140px;" placeholder="Ingredients and instructions…"></textarea></div>' +
          '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-primary" data-action="submit-recipe">Post Recipe</button></div>'
      });
    }

    function submitRecipe() {
      if (!_currentUser) { alert('Sign in required.'); return; }
      var title = document.getElementById('cfRecipeTitle');
      var body  = document.getElementById('cfRecipeBody');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      if (!body  || !body.value.trim())  { alert('Recipe body is required.'); return; }
      getSB().from('recipes').insert({
        author_id: _currentUser.id, status: 'approved',
        title:   title.value.trim(),
        species: (document.getElementById('cfRecipeSpecies') || {}).value || '',
        body:    body.value.trim()
      }).then(function(res) {
        if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
        closeCommModal();
        _recipesLoaded = false;
        loadRecipes();
        showCommToast('Recipe posted! 🍳');
      });
    }
    // ── Edit Recipe (member self-edit, no re-approval) ──
    var _editingRecipeId = null;

    function editRecipe(recipeId) {
      if (!_currentUser) { alert('Sign in required.'); return; }
      _editingRecipeId = recipeId;
      getSB().from('recipes').select('*').eq('id', recipeId).single()
        .then(function(res) {
          if (res.error || !res.data) { alert('Could not load recipe.'); return; }
          var r = res.data;
          openCommModal('recipe-edit', {
            title: '✏️ Edit Recipe',
            formHtml: '<div class="comm-modal-field"><label>Recipe Title *</label><input type="text" id="cfRecipeTitle" value="' + escapeHTML(r.title) + '"></div>' +
              '<div class="comm-modal-field"><label>Species</label><input type="text" id="cfRecipeSpecies" value="' + escapeHTML(r.species || '') + '"></div>' +
              '<div class="comm-modal-field"><label>Recipe *</label><textarea id="cfRecipeBody" style="min-height:140px;">' + escapeHTML(r.body || '') + '</textarea></div>' +
              '<div class="comm-modal-actions"><button class="btn btn-outline" data-action="close-comm-modal">Cancel</button><button class="btn btn-outline" style="border-color:var(--orange);color:var(--orange);" data-action="archive-post" data-table="recipes" data-owner="created_by" data-id="' + escapeHTML(String(r.id)) + '">Archive</button><button class="btn btn-primary" data-action="save-edit-recipe">Save Changes</button></div>'
          });
        });
    }

    function saveEditRecipe() {
      if (!_currentUser || !_editingRecipeId) return;
      var title = document.getElementById('cfRecipeTitle');
      var body  = document.getElementById('cfRecipeBody');
      if (!title || !title.value.trim()) { alert('Title is required.'); return; }
      if (!body  || !body.value.trim())  { alert('Recipe body is required.'); return; }
      getSB().from('recipes').update({
        title: title.value.trim(),
        species: (document.getElementById('cfRecipeSpecies') || {}).value || '',
        body: body.value.trim()
      }).eq('id', _editingRecipeId).eq('created_by', _currentUser.id)
        .then(function(res) {
          if (res.error) { console.error(res.error); alert('Error: ' + res.error.message); return; }
          _editingRecipeId = null;
          closeCommModal();
          showCommToast('Recipe updated.');
          _recipesLoaded = false;
          loadRecipes();
        });
    }
    // ── End Recipes ───────────────────────────────────────────

    // ── Init ──────────────────────────────────────────────────
    window.addEventListener('DOMContentLoaded', function () {
      bindSignInButtons();
      initMemberAuth();
    });

    // ── Expose community functions to global scope for inline onclick handlers ──
    window.openCommModal  = openCommModal;
    window.closeCommModal = closeCommModal;
    window.openTripForm   = openTripForm;
    window.submitTrip     = submitTrip;
    window.editTrip       = editTrip;
    window.saveEditTrip   = saveEditTrip;
    window.rsvpTrip       = rsvpTrip;
    window.openGuideForm  = openGuideForm;
    window.submitGuide    = submitGuide;
    window.editGuide      = editGuide;
    window.saveEditGuide  = saveEditGuide;
    window.openGearForm   = openGearForm;
    window.submitGear     = submitGear;
    window.editGear       = editGear;
    window.saveEditGear   = saveEditGear;
    window.openForumForm  = openForumForm;
    window.submitThread   = submitThread;
    window.editThread     = editThread;
    window.saveEditThread = saveEditThread;
    window.openRecipeForm = openRecipeForm;
    window.submitRecipe   = submitRecipe;
    window.editRecipe     = editRecipe;
    window.saveEditRecipe = saveEditRecipe;
    window.approveContent  = approveContent;
    window.switchEmailTab  = switchEmailTab;
    window.postReply       = postReply;
    window.toggleReplies   = toggleReplies;
    window.editPin                  = editPin;
    window.saveEditPin              = saveEditPin;
    window.archivePost              = archivePost;
    window.restorePost              = restorePost;
    window.adminBatchArchive        = adminBatchArchive;
    window.adminBatchArchiveConfirm = adminBatchArchiveConfirm;

    // ── Full-screen photo overlay (map popups + fish pics tab) ──
    window._bffViewPhoto = function (url) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
      var img = document.createElement('img');
      img.src = url;
      img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 4px 32px rgba(0,0,0,.6);object-fit:contain;';
      overlay.appendChild(img);
      overlay.addEventListener('click', function () { overlay.remove(); });
      document.body.appendChild(overlay);
    };

  })();

// ── Profile Editor ────────────────────────────────────────────
var _peCurrentUser = null;
var _peCurrentProfile = null;
var _peNewAvatarFile = null;
var _peEscHandler = null;

function openProfileEditor() {
  if (!_peCurrentProfile) return;
  var p = _peCurrentProfile;
  var u = _peCurrentUser;

  var nameEl = document.getElementById('peDisplayName');
  var bioEl = document.getElementById('peBio');
  var watersEl = document.getElementById('peHomeWaters');
  var speciesEl = document.getElementById('peSpecies');
  if (nameEl) nameEl.value = p.display_name || '';
  if (bioEl) bioEl.value = p.bio || '';
  if (watersEl) watersEl.value = p.home_waters || '';
  if (speciesEl) speciesEl.value = p.species || '';

  var preview = document.getElementById('peAvatarPreview');
  var initials = document.getElementById('peAvatarInitials');
  if (p.avatar_url && preview) {
    preview.src = p.avatar_url;
    preview.style.display = 'block';
    if (initials) initials.textContent = '';
  } else if (initials) {
    var name = p.display_name || (u && u.email) || '';
    var parts = name.trim().split(' ');
    initials.textContent = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    if (preview) preview.style.display = 'none';
  }

  _peNewAvatarFile = null;
  var overlay = document.getElementById('profileEditorOverlay');
  if (overlay) {
    overlay.classList.add('open');
  }
  document.body.style.overflow = 'hidden';
  _peEscHandler = function(e) { if (e.key === 'Escape') closeProfileEditor(); };
  document.addEventListener('keydown', _peEscHandler);
}

function closeProfileEditor() {
  var overlay = document.getElementById('profileEditorOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (_peEscHandler) { document.removeEventListener('keydown', _peEscHandler); _peEscHandler = null; }
}

function closeProfileEditorOnOverlay(e) {
  if (e.target === document.getElementById('profileEditorOverlay')) {
    closeProfileEditor();
  }
}

function previewAvatarUpload(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Photo must be under 5 MB.');
    return;
  }
  _peNewAvatarFile = file;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var preview = document.getElementById('peAvatarPreview');
    var initials = document.getElementById('peAvatarInitials');
    if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
    if (initials) initials.textContent = '';
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  if (!_peCurrentUser) return;
  var saveBtn = document.getElementById('peSaveBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving\u2026'; }

  var updates = {
    display_name: (document.getElementById('peDisplayName') || {}).value || '',
    bio:          (document.getElementById('peBio')         || {}).value || '',
    home_waters:  (document.getElementById('peHomeWaters')  || {}).value || '',
    species:      (document.getElementById('peSpecies')     || {}).value || ''
  };

  function doSave(avatarUrl) {
    if (avatarUrl) updates.avatar_url = avatarUrl;
    getSB()
      .from('profiles')
      .update(updates)
      .eq('id', _peCurrentUser.id)
      .then(function(res) {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Profile'; }
        if (res.error) { alert('Could not save: ' + res.error.message); return; }

        _peCurrentProfile = Object.assign({}, _peCurrentProfile, updates);
        var nameEl = document.getElementById('memberName');
        if (nameEl) nameEl.textContent = updates.display_name || _peCurrentUser.email;

        var headerAvatar = document.getElementById('memberAvatar');
        var headerInitials = document.getElementById('memberAvatarInitials');
        if (updates.avatar_url) {
          if (headerAvatar) { headerAvatar.src = updates.avatar_url; headerAvatar.style.display = 'block'; }
          if (headerInitials) headerInitials.style.display = 'none';
        }
        closeProfileEditor();
      });
  }

  if (_peNewAvatarFile) {
    var ext = _peNewAvatarFile.name.split('.').pop();
    var path = _peCurrentUser.id + '/avatar.' + ext;
    getSB()
      .storage.from('avatars')
      .upload(path, _peNewAvatarFile, { upsert: true, contentType: _peNewAvatarFile.type })
      .then(function(res) {
        if (res.error) { alert('Avatar upload failed: ' + res.error.message); if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Profile'; } return; }
        var publicUrl = getSB().storage.from('avatars').getPublicUrl(path).data.publicUrl;
        doSave(publicUrl);
      });
  } else {
    doSave(null);
  }
}
// ── End Profile Editor ────────────────────────────────────────

// ── Event Delegation — central dispatcher for data-action handlers ──
function initEventDelegation() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    var d = el.dataset;
    switch (action) {
      // Navigation
      case 'show-section':           e.preventDefault(); showSection(d.target); break;
      case 'toggle-theme':           toggleTheme(); break;
      case 'toggle-menu':            toggleMenu(); break;
      case 'scroll-top':             window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      // Gallery
      case 'open-gallery-upload':    openGalleryUploadModal(); break;
      case 'lightbox':               openLightbox(Number(d.index)); break;
      case 'lightbox-close':         closeLightbox(); break;
      case 'lightbox-nav':           lightboxNav(Number(d.dir)); break;
      case 'lightbox-backdrop':      handleLightboxClick(e); break;
      case 'video-fullscreen':       openGalleryVideoFullscreen(el); break;
      case 'switch-gallery-tab':     switchGalleryTab(d.tabId, el); break;
      case 'close-gallery-upload':   closeGalleryUploadModal(e); break;
      case 'close-gallery-upload-x': closeGalleryUploadModal(); break;
      case 'submit-gallery-upload':  submitGalleryUpload(); break;
      case 'stop-propagation':       e.stopPropagation(); break;
      case 'view-photo':             if (window._bffViewPhoto) window._bffViewPhoto(d.url); break;
      case 'nav-community':          if (window.switchPrimaryTab) window.switchPrimaryTab('Community'); break;
      // Boats
      case 'toggle-boat-story':      toggleBoatStory(el); break;
      // Members portal tabs
      case 'switch-email-tab':       if (window.switchEmailTab) window.switchEmailTab(d.tab); break;
      case 'switch-primary-tab':     if (window.switchPrimaryTab) window.switchPrimaryTab(d.tab); break;
      case 'switch-community-tab':   if (window.switchCommunityTab) window.switchCommunityTab(d.tab); break;
      // Profile editor
      case 'open-profile-editor':    openProfileEditor(); break;
      case 'close-profile-editor':   closeProfileEditor(); break;
      case 'close-profile-overlay':  closeProfileEditorOnOverlay(e); break;
      case 'profile-avatar-trigger': var fi = document.getElementById('peAvatarFileInput'); if (fi) fi.click(); break;
      case 'save-profile':           saveProfile(); break;
      // Admin
      case 'toggle-gallery-approval': if (window.toggleGalleryApprovalList) window.toggleGalleryApprovalList(); break;
      case 'toggle-gallery-events':   if (window.toggleGalleryEventsList) window.toggleGalleryEventsList(); break;
      case 'toggle-gallery-expand':   if (window.toggleGalleryItemExpand) window.toggleGalleryItemExpand(d.id); break;
      case 'toggle-next-sibling':     el.nextElementSibling.classList.toggle('hidden'); break;
      case 'show-gallery-event-form': if (window.showGalleryEventForm) window.showGalleryEventForm(); break;
      case 'save-gallery-event':      if (window.saveGalleryEvent) window.saveGalleryEvent(); break;
      case 'cancel-gallery-event':    if (window.cancelGalleryEventForm) window.cancelGalleryEventForm(); break;
      case 'edit-event':              if (window.editGalleryEvent) window.editGalleryEvent(d.id); break;
      case 'delete-event':            if (window.deleteGalleryEvent) window.deleteGalleryEvent(d.id, d.name); break;
      case 'approve-gallery':         if (window.approveGallerySubmission) window.approveGallerySubmission(d.sid, d.spath); break;
      case 'reject-gallery':          if (window.rejectGallerySubmission) window.rejectGallerySubmission(d.sid, d.spath); break;
      case 'approve-user':            if (window._bffApproveUser) window._bffApproveUser(d.id, el.closest('.admin-row')); break;
      case 'reject-user':             if (window._bffRejectUser) window._bffRejectUser(d.id, el.closest('.admin-row')); break;
      case 'remove-pin':              if (window._bffRemovePin) window._bffRemovePin(d.id, el.closest('.admin-row')); break;
      case 'post-comment':            if (window._bffPostComment) window._bffPostComment(d.id); break;
      case 'approve-content':         if (window.approveContent) window.approveContent(d.table, d.id, d.status, el); break;
      // Community modal
      case 'close-comm-modal':    if (window.closeCommModal) window.closeCommModal(); break;
      // Community forms
      case 'open-trip-form':      if (window.openTripForm)   window.openTripForm();   break;
      case 'open-guide-form':     if (window.openGuideForm)  window.openGuideForm();  break;
      case 'open-gear-form':      if (window.openGearForm)   window.openGearForm();   break;
      case 'open-forum-form':     if (window.openForumForm)  window.openForumForm();  break;
      case 'open-recipe-form':    if (window.openRecipeForm) window.openRecipeForm(); break;
      case 'submit-trip':         if (window.submitTrip)     window.submitTrip();     break;
      case 'submit-guide':        if (window.submitGuide)    window.submitGuide();    break;
      case 'submit-gear':         if (window.submitGear)     window.submitGear();     break;
      case 'submit-thread':       if (window.submitThread)   window.submitThread();   break;
      case 'submit-recipe':       if (window.submitRecipe)   window.submitRecipe();   break;
      case 'edit-trip':           if (window.editTrip)       window.editTrip(d.id);   break;
      case 'edit-guide':          if (window.editGuide)      window.editGuide(d.id);  break;
      case 'edit-gear':           if (window.editGear)       window.editGear(d.id);   break;
      case 'edit-thread':         if (window.editThread)     window.editThread(d.id); break;
      case 'edit-recipe':         if (window.editRecipe)     window.editRecipe(d.id); break;
      case 'save-edit-trip':      if (window.saveEditTrip)    window.saveEditTrip();    break;
      case 'save-edit-guide':     if (window.saveEditGuide)   window.saveEditGuide();   break;
      case 'save-edit-gear':      if (window.saveEditGear)    window.saveEditGear();    break;
      case 'save-edit-thread':    if (window.saveEditThread)  window.saveEditThread();  break;
      case 'save-edit-recipe':    if (window.saveEditRecipe)  window.saveEditRecipe();  break;
      case 'edit-pin':            if (window.editPin)         window.editPin(d.id);     break;
      case 'save-edit-pin':       if (window.saveEditPin)     window.saveEditPin();     break;
      case 'archive-post':
        if (window.archivePost) window.archivePost(d.table, d.id, d.owner);
        break;
      case 'restore-post':
        if (window.restorePost) window.restorePost(d.table, d.id, el.closest('.admin-row'));
        break;
      case 'admin-batch-archive':         if (window.adminBatchArchive)        window.adminBatchArchive();        break;
      case 'admin-batch-archive-confirm': if (window.adminBatchArchiveConfirm) window.adminBatchArchiveConfirm(); break;
      case 'share-fb':
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(d.url || 'https://bayoucharity.org/#members'), '_blank', 'width=600,height=400');
        break;
      case 'share-x':
        window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(d.url || 'https://bayoucharity.org/#members') + '&text=' + encodeURIComponent(d.text || ''), '_blank', 'width=600,height=400');
        break;
      case 'share-copy':
        (function() {
          var url = d.url || 'https://bayoucharity.org/#members';
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() { if (window.showCommToast) showCommToast('Link copied!'); });
          } else {
            var ta = document.createElement('textarea'); ta.value = url;
            document.body.appendChild(ta); ta.select(); document.execCommand('copy');
            document.body.removeChild(ta); if (window.showCommToast) showCommToast('Link copied!');
          }
        })();
        break;
      case 'rsvp-trip':           if (window.rsvpTrip)       window.rsvpTrip(d.id, el);            break;
      case 'post-reply':          if (window.postReply)      window.postReply(d.threadId);          break;
      case 'toggle-replies':      if (window.toggleReplies)  window.toggleReplies(d.threadId, el); break;
    }
  });
}
window.addEventListener('DOMContentLoaded', initEventDelegation);

// ── Video IntersectionObserver — lazy-load + pause off-screen autoplay videos ──
(function() {
  var videoObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var v = entry.target;
      if (entry.isIntersecting) {
        // Lazy-load: swap data-src → src on first intersection
        if (v.dataset.lazy) {
          var src = v.querySelector('source[data-src]');
          if (src) {
            src.src = src.dataset.src;
            delete src.dataset.src;
            v.load();
          }
          delete v.dataset.lazy;
        }
        v.play().catch(function() {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0 });
  document.querySelectorAll('video[autoplay]').forEach(function(v) {
    videoObserver.observe(v);
  });
})();
