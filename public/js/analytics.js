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

  function pageType() {
    var p = location.pathname;
    if (/(pricing|abonament|preturi|prețuri|preise|precios|prix|prezzi|fiyat)/i.test(p)) return 'pricing';
    if (/(\/recipes\/|\/retete\/|\/rețete\/|\/rezepte\/|\/recetas\/|\/recettes\/)/i.test(p)) return 'recipe';
    if (/\/plan/i.test(p)) return 'plan';
    if (p === '/' || /^\/[a-z]{2}\/?$/.test(p)) return 'home';
    return 'other';
  }

  function send(event, props) {
    if (!ALLOWED[event]) return; // never POST a disallowed/server-only event
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

  function firePageView() { send('page_view', { pageType: pageType() }); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', firePageView);
  } else {
    firePageView();
  }
})();
