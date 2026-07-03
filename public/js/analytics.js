// public/js/analytics.js
// Funnel Analytics MVP — lightweight, first-party, no third-party tools,
// NO cookies, NO PII.
//
// Defines window.mpTrack(event, props) and auto-fires page_view on load.
// Sends to /api/event via navigator.sendBeacon (fetch keepalive fallback).
// The only identifier is an anonymous, random id kept in localStorage —
// never an email. subscription_active is recorded server-side by the Stripe
// webhook, not here.
(function () {
  'use strict';

  var ENDPOINT = '/api/event';
  // Whitelist mirrors the server. subscription_active is server-only.
  var ALLOWED = { page_view: 1, plan_generated: 1, pdf_click: 1, email_submitted: 1, checkout_started: 1 };

  function anonId() {
    try {
      var k = 'mp:anon';
      var v = localStorage.getItem(k);
      if (!v) {
        v = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'a-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(k, v);
      }
      return v;
    } catch (_) {
      // Private mode / storage blocked → stay anonymous, no id.
      return null;
    }
  }

  function detectLang() {
    var l = (document.documentElement.getAttribute('lang') || '').slice(0, 2);
    if (l) return l;
    var seg = (location.pathname.split('/')[1] || '');
    return /^[a-z]{2}$/.test(seg) ? seg : 'ro';
  }

  // Locale-complete, path-segment-anchored URL patterns covering all 14 slugs
  // (see PRICING_SLUGS / RECIPE_LANG / LANG_CONFIGS in generate-content.mjs).
  // Dead legacy patterns removed: abonament, preturi, prețuri, prix, rețete.
  var PRICING_RE = /\/(pricing|premium|precios|precos|tarifs|preise|tseny|asaar|jiage|fiyatlar|prezzi)(?:\/|$)/i;
  var RECIPE_RE  = /\/(recipes|retete|recetas|recettes|rezepte|receitas|retsepty|wasafat|shipu|reshipi|tarifler|ricette)\//i;
  var PLAN_RE    = /\/(meniu-saptamanal|weekly-meal-plan|plan-semanal|plan-semaine|wochenplan|plano-semanal|nedelnoe-menyu|khitat-usbuiya|zhoujicaidan|weekly-menu|weekly-plan|haftalik-menu|piano-settimanale|jugan-menu)(?:\/|$)/i;

  // Generated SEO pages declare their type via data-page-type on the analytics
  // <script> tag — authoritative, so /ro/premium/ (and every localized slug) is
  // classified correctly regardless of URL. Hand-maintained homepages carry no
  // attribute and fall through to the URL patterns below (→ 'home').
  function declaredPageType() {
    try {
      var el = document.querySelector('script[data-page-type][src*="/js/analytics"]');
      var v = el && el.getAttribute('data-page-type');
      return v || null;
    } catch (_) { return null; }
  }

  function pageType() {
    var declared = declaredPageType();
    if (declared) return declared;
    var p = location.pathname;
    if (PRICING_RE.test(p)) return 'pricing';
    if (RECIPE_RE.test(p)) return 'recipe';
    if (PLAN_RE.test(p)) return 'plan';
    if (p === '/' || /^\/[a-z]{2}\/?$/.test(p)) return 'home';
    return 'other';
  }

  function send(event, props) {
    if (!ALLOWED[event]) return; // never POST a disallowed/server-only event
    // Drop browser-automation traffic (scrapers, headless bots, test runners)
    // so the funnel — now firing on ~3,900 SEO pages — isn't inflated by
    // non-human page loads. Real browsers report navigator.webdriver falsy.
    // Note: this only catches flagged automation; JS-rendering crawlers that
    // do not set the flag still count (mitigate server-side if needed).
    try { if (navigator.webdriver) return; } catch (_) {}
    try {
      var json = JSON.stringify({
        event: event,
        ts: Date.now(),
        anon_id: anonId(),
        lang: detectLang(),
        path: location.pathname,
        props: props || {}
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([json], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: json,
          keepalive: true
        });
      }
    } catch (_) {
      // Analytics must never break the page.
    }
  }

  window.mpTrack = send;
  // Reused by checkout.js so checkout_started.source uses the SAME corrected
  // page-type detection, and so the anonymous id can be passed into the Stripe
  // Checkout session as client_reference_id — the only join key between the
  // anonymous client funnel and the server-side subscription_active row. This
  // id is a random UUID, never an email.
  window.mpPageType = pageType;
  window.mpAnonId = anonId;

  function firePageView() { send('page_view', { pageType: pageType() }); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', firePageView);
  } else {
    firePageView();
  }
})();
