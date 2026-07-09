/* plan-cart.js — the "plan cart" on static recipe/hub pages (BRAIN spec §9.1d).
 *
 * Standalone by design: NO imports (recipes.js is ~10 MB — this file must
 * stay a few KB). Labels and the app URL are baked per-language into the
 * #plan-cart-config element by scripts/generate-content.mjs, so no i18n.js
 * either. The planner (app.js) consumes the cart on load: it pours items
 * into the first empty slots and shows a bulk-undo toast.
 *
 * Intuitiveness rules (spec, decided 8 iul — e-commerce cart pattern):
 *   - feedback < 1s on add: button flips to "✓ In plan", badge bounces;
 *   - the badge does NOT exist while the cart is empty (earns existence);
 *   - tap badge → mini-list (name + ✕) + CTA "Build my plan (N) →";
 *   - no dialogs anywhere.
 *
 * Progressive enhancement: without JS (or without this config element) the
 * .btn-recipe-primary links keep their original ?meal= navigation untouched.
 */
(function () {
  'use strict';

  var KEY = 'mp:plan-cart';
  var CAP = 14; // one full week (7 days × lunch + dinner)

  var cfg = document.getElementById('plan-cart-config');
  if (!cfg) return; // page wasn't generated with cart support → do nothing

  var L = {
    app:   cfg.getAttribute('data-app')   || '/',
    added: cfg.getAttribute('data-added') || '✓ In plan',
    open:  cfg.getAttribute('data-open')  || 'Build my plan',
    yours: cfg.getAttribute('data-yours') || 'Your recipes'
  };

  /* ── storage ──────────────────────────────────────────────────────────
     Shape: JSON array of { en: <EN recipe name>, display: <localized name> }.
     `en` is the stable cross-language key (app.js resolves it against every
     name locale); `display` is only for showing the list in the panel. */
  function readCart() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (!Array.isArray(v)) return [];
      return v.filter(function (x) {
        return x && typeof x.en === 'string' && x.en;
      }).slice(0, CAP);
    } catch (e) { return []; }
  }
  function writeCart(items) {
    try {
      if (items.length) localStorage.setItem(KEY, JSON.stringify(items.slice(0, CAP)));
      else localStorage.removeItem(KEY);
    } catch (e) { /* private mode / quota — cart simply won't persist */ }
  }
  function cartIndex(items, en) {
    var low = en.toLowerCase();
    for (var i = 0; i < items.length; i++) {
      if (items[i].en.toLowerCase() === low) return i;
    }
    return -1;
  }

  /* ── add buttons (recipe pages only; hubs just carry the badge) ────────
     The generator gives each button data-display="<localized name>" and an
     href ending in ?meal=<EN name> — the same URL non-JS users navigate to. */
  var buttons = [];
  function initButtons() {
    var links = document.querySelectorAll('a.btn-recipe-primary[href*="meal="]');
    Array.prototype.forEach.call(links, function (a) {
      var en = null;
      try {
        en = new URL(a.getAttribute('href'), location.origin).searchParams.get('meal');
      } catch (e) { /* malformed href → leave the link alone */ }
      if (!en) return;
      buttons.push({
        el: a,
        en: en,
        display: a.getAttribute('data-display') || en,
        orig: a.innerHTML // restored when the recipe is removed from the cart
      });
      a.addEventListener('click', function (ev) {
        ev.preventDefault(); // cart toggle instead of leaving the page
        var items = readCart();
        var at = cartIndex(items, en);
        if (at >= 0) {
          items.splice(at, 1);
          writeCart(items);
          render(items, false);
        } else if (items.length >= CAP) {
          render(items, true); // full week: just pulse the badge, no add
        } else {
          items.push({ en: en, display: a.getAttribute('data-display') || en });
          writeCart(items);
          render(items, true); // < 1s feedback: ✓ button + badge bounce
        }
      });
    });
  }
  function syncButtons(items) {
    buttons.forEach(function (b) {
      var isIn = cartIndex(items, b.en) >= 0;
      if (isIn && !b.el.classList.contains('pw-cart-in')) {
        b.el.classList.add('pw-cart-in');
        b.el.textContent = L.added;
      } else if (!isIn && b.el.classList.contains('pw-cart-in')) {
        b.el.classList.remove('pw-cart-in');
        b.el.innerHTML = b.orig;
      }
    });
  }

  /* ── floating badge + mini-panel ──────────────────────────────────────
     Created only while the cart is non-empty; removed entirely when it
     empties again. All touch targets ≥ 44px (CSS). */
  var badge = null, panel = null, panelOpen = false;

  function closePanel() {
    panelOpen = false;
    if (panel) panel.classList.remove('pw-cart-open');
    if (badge) badge.setAttribute('aria-expanded', 'false');
  }
  function togglePanel() {
    panelOpen = !panelOpen;
    panel.classList.toggle('pw-cart-open', panelOpen);
    badge.setAttribute('aria-expanded', String(panelOpen));
  }

  function ensureBadge() {
    if (badge) return;
    badge = document.createElement('button');
    badge.type = 'button';
    badge.id = 'pw-cart-badge';
    badge.className = 'pw-cart-badge';
    badge.setAttribute('aria-expanded', 'false');
    badge.setAttribute('aria-controls', 'pw-cart-panel');
    badge.addEventListener('click', function (ev) {
      ev.stopPropagation();
      togglePanel();
    });

    panel = document.createElement('div');
    panel.id = 'pw-cart-panel';
    panel.className = 'pw-cart-panel';
    panel.setAttribute('aria-label', L.yours);
    panel.addEventListener('click', function (ev) { ev.stopPropagation(); });

    document.body.appendChild(panel);
    document.body.appendChild(badge);

    // Close on outside click / Escape — same dismissal grammar as the picker.
    document.addEventListener('click', function () { if (panelOpen) closePanel(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && panelOpen) { closePanel(); badge.focus(); }
    });
  }
  function removeBadge() {
    closePanel();
    if (badge) { badge.remove(); badge = null; }
    if (panel) { panel.remove(); panel = null; }
  }

  function renderPanel(items) {
    panel.textContent = ''; // rebuild — list is tiny (≤14)

    var title = document.createElement('p');
    title.className = 'pw-cart-title';
    title.textContent = L.yours;
    panel.appendChild(title);

    var ul = document.createElement('ul');
    ul.className = 'pw-cart-list';
    items.forEach(function (item) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.className = 'pw-cart-item-name';
      name.textContent = item.display || item.en;
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'pw-cart-remove';
      rm.textContent = '✕';
      rm.setAttribute('aria-label', '✕ ' + (item.display || item.en));
      rm.addEventListener('click', function () {
        var next = readCart();
        var at = cartIndex(next, item.en);
        if (at >= 0) next.splice(at, 1);
        writeCart(next);
        render(next, false);
      });
      li.appendChild(name);
      li.appendChild(rm);
      ul.appendChild(li);
    });
    panel.appendChild(ul);

    var cta = document.createElement('a');
    cta.className = 'pw-cart-cta';
    cta.href = L.app;
    var arrow = document.documentElement.dir === 'rtl' ? '←' : '→';
    cta.textContent = L.open + ' (' + items.length + ') ' + arrow;
    panel.appendChild(cta);
  }

  function render(items, bounce) {
    syncButtons(items);
    if (!items.length) { removeBadge(); return; }
    ensureBadge();
    badge.textContent = '🥗 ' + items.length;
    badge.setAttribute('aria-label', L.yours + ' (' + items.length + ')');
    renderPanel(items);
    if (bounce) {
      badge.classList.remove('pw-cart-bounce');
      void badge.offsetWidth; // restart the animation
      badge.classList.add('pw-cart-bounce');
    }
  }

  initButtons();
  render(readCart(), false);
})();
