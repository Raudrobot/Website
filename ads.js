(function () {
  "use strict";

  // ads.js - improved adblock "bait" detector (CSP-friendly, no network requests)
  // This version creates multiple bait elements with various common ad-related
  // classnames/attributes and treats adblock as present when a majority are
  // hidden/removed. It always ensures the banner has a close button so users
  // can dismiss it. The script does not block or modify other site content.
  // Additionally: when adblock is detected it shows a small dismissable modal
  // (stored in localStorage for 30 days) to ask the user to consider whitelisting.

  var POPUP_STORAGE_KEY = 'kao-adblock-dismissed';
  var POPUP_DISMISS_DAYS = 30;

  function ensureCloseButtonOnBanner() {
    try {
      var banner = document.querySelector('.kao-banner');
      if (!banner) return;
      if (banner.querySelector('.kao-banner-close')) return;

      var btn = document.createElement('button');
      btn.className = 'kao-banner-close';
      btn.setAttribute('aria-label', 'Close');
      btn.textContent = '\u2715';
      btn.style.cssText = 'position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:0.8em;cursor:pointer;opacity:0.7;padding:0.25rem 0.5rem;line-height:1;text-shadow:none;';
      btn.addEventListener('click', function () {
        banner.style.display = 'none';
        try { localStorage.setItem('kao-banner-hidden', String(Date.now())); } catch (e) {}
      });
      banner.appendChild(btn);
    } catch (e) {
      // fail silently
    }
  }

  function showAdblockPopup() {
    try {
      // Respect previous dismissal
      try {
        var dismissed = localStorage.getItem(POPUP_STORAGE_KEY);
        if (dismissed) {
          var elapsed = Date.now() - Number(dismissed);
          if (elapsed < POPUP_DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
        }
      } catch (e) {}

      // Don't show if banner already hidden
      var banner = document.querySelector('.kao-banner');
      if (!banner) return;
      if (banner.style && banner.style.display === 'none') return;

      // Create styles
      var style = document.createElement('style');
      style.textContent = '' +
        '.kao-adblock-modal{position:fixed;left:50%;top:20%;transform:translateX(-50%);max-width:520px;width:90%;background:#fff;color:#111;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:2147483647;padding:16px;font-family:Arial,Helvetica,sans-serif}' +
        '.kao-adblock-modal h3{margin:0 0 8px;font-size:1rem}' +
        '.kao-adblock-modal p{margin:0 0 12px;font-size:0.95rem;color:#333}' +
        '.kao-adblock-modal .kao-adblock-actions{display:flex;justify-content:flex-end;gap:8px}' +
        '.kao-adblock-btn{background:#d32f2f;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:700}' +
        '.kao-adblock-btn--ghost{background:transparent;color:#333;border:1px solid #ccc;padding:6px 10px;border-radius:4px;cursor:pointer}';
      document.head.appendChild(style);

      // Create modal
      var modal = document.createElement('div');
      modal.className = 'kao-adblock-modal';

      var title = document.createElement('h3');
      title.textContent = 'Ad blocker detected';
      modal.appendChild(title);

      var msg = document.createElement('p');
      msg.textContent = 'We noticed you are using an ad blocker. If you find this site useful, please consider whitelisting it — it helps keep the site running.';
      modal.appendChild(msg);

      var actions = document.createElement('div');
      actions.className = 'kao-adblock-actions';

      var closeBtn = document.createElement('button');
      closeBtn.className = 'kao-adblock-btn--ghost';
      closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', function () {
        try { localStorage.setItem(POPUP_STORAGE_KEY, String(Date.now())); } catch (e) {}
        try { modal.parentNode && modal.parentNode.removeChild(modal); } catch (e) {}
        try { style.parentNode && style.parentNode.removeChild(style); } catch (e) {}
      });

      var learnBtn = document.createElement('button');
      learnBtn.className = 'kao-adblock-btn';
      learnBtn.textContent = 'How to whitelist';
      learnBtn.addEventListener('click', function () {
        // Open a helpful page in a new tab. Keep on-site to avoid external dependencies.
        // This links to a GitHub relative page; you can change it to any helpful resource.
        try { window.open('https://html-online.com/articles/detect-adblock-javascript/', '_blank', 'noopener'); } catch (e) {}
      });

      actions.appendChild(closeBtn);
      actions.appendChild(learnBtn);
      modal.appendChild(actions);

      document.body.appendChild(modal);
    } catch (e) {
      // Fail silently — don't break the page
    }
  }

  function detectAdblock(callback, timeout) {
    timeout = typeof timeout === 'number' ? timeout : 400;
    try {
      var baitNames = [
        'adsbygoogle','doubleclick','googlesyndication','ad','ads','adsbox','ad-slot',
        'ad-slot--right','ad-container','adbanner','ad-banner','ad_unit','sponsored',
        'advert', 'advertisement', 'ad_iframe', 'google_ad', 'ad-placeholder'
      ];

      var baits = [];
      var removedSet = new Set();

      // Create many baits with different classnames/attributes
      for (var i = 0; i < baitNames.length; i++) {
        var name = baitNames[i];
        var el = document.createElement('div');
        el.className = name + ' bait-detect';
        el.id = 'bait-' + i;
        // Add a few ad-like attributes some blockers target
        el.setAttribute('data-ad', name);
        el.setAttribute('role', 'complementary');
        // Small, off-screen, but attempt to force visible via inline !important
        el.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;';
        try {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
        } catch (e) {}

        document.body.appendChild(el);
        baits.push(el);
      }

      // add an iframe bait with ad-like title (srcdoc to avoid network)
      try {
        var ifr = document.createElement('iframe');
        ifr.id = 'bait-iframe';
        ifr.title = 'Advertisement';
        ifr.setAttribute('aria-label', 'ads');
        ifr.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;border:0;';
        // use srcdoc so no network request (CSP-friendly)
        ifr.srcdoc = '<!doctype html><html><body>ad</body></html>';
        document.body.appendChild(ifr);
        baits.push(ifr);
      } catch (e) {}

      // Watch for removals
      var observer = new MutationObserver(function (mutations) {
        for (var m = 0; m < mutations.length; m++) {
          var rem = mutations[m].removedNodes;
          for (var r = 0; r < rem.length; r++) {
            var node = rem[r];
            if (node && node.id && node.id.indexOf('bait-') === 0) removedSet.add(node.id);
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      window.setTimeout(function () {
        var hidden = 0;
        for (var j = 0; j < baits.length; j++) {
          var b = baits[j];
          var isHidden = false;
          try {
            // removed from DOM
            if (!b.parentNode) {
              isHidden = true;
            } else {
              var rects = b.getClientRects ? b.getClientRects() : [];
              var cs = window.getComputedStyle ? getComputedStyle(b) : b.currentStyle;

              if (
                removedSet.has(b.id) ||
                b.offsetParent === null ||
                b.offsetHeight === 0 ||
                b.offsetWidth === 0 ||
                rects.length === 0 ||
                (cs && (cs.display === 'none' || cs.visibility === 'hidden'))
              ) {
                isHidden = true;
              }
            }
          } catch (e) {
            isHidden = true;
          }

          if (isHidden) hidden++;
        }

        // cleanup
        try { observer.disconnect(); } catch (e) {}
        for (var k = 0; k < baits.length; k++) {
          try { baits[k].parentNode && baits[k].parentNode.removeChild(baits[k]); } catch (e) {}
        }

        // Consider adblock present when a majority of baits are hidden/removed
        var blocked = hidden >= Math.ceil(baits.length / 2);
        callback(Boolean(blocked));
      }, timeout);
    } catch (e) {
      callback(false);
    }
  }

  // Simple "wrapfabtest" check (vanilla JS) modeled after the jQuery example.
  // Creates a wrapper with a single .adBar element and checks its height.
  function simpleAdbarCheck() {
    try {
      var wrap = document.getElementById('wrapfabtest');
      var created = false;
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'wrapfabtest';
        var ad = document.createElement('div');
        ad.className = 'adBar';
        // Off-screen + tiny so it doesn't affect layout; style includes dimensions so it has height
        ad.style.cssText = 'background-color:transparent;height:1px;width:1px;position:absolute;left:-9999px;top:-9999px;display:block!important;visibility:visible!important;';
        wrap.appendChild(ad);
        try { document.body.appendChild(wrap); } catch (e) {}
        created = true;
      }

      window.setTimeout(function () {
        try {
          var el = wrap.querySelector('.adBar');
          var h = 0;
          if (el) {
            h = (typeof el.offsetHeight === 'number' ? el.offsetHeight : 0) ||
                (el.getBoundingClientRect ? Math.round(el.getBoundingClientRect().height) : 0) ||
                (window.getComputedStyle ? parseInt(getComputedStyle(el).height, 10) || 0 : 0);
          }

          if (!(h > 0)) {
            // Detected a blocking/hidden adBar by height
            try { window.__kao_adblock = true; } catch (e) {}
            try { ensureCloseButtonOnBanner(); } catch (e) {}
            try { showAdblockPopup(); } catch (e) {}
          }
        } catch (e) {}

        // Cleanup if we created the wrapper
        try {
          if (created) {
            var adEl = wrap.querySelector('.adBar');
            if (adEl && adEl.parentNode) adEl.parentNode.removeChild(adEl);
            if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
          }
        } catch (e) {}
      }, 250);
    } catch (e) {}
  }

  // Run after DOM ready
  function run() {
    detectAdblock(function (isBlocked) {
      // always ensure a close button so user can dismiss the banner
      ensureCloseButtonOnBanner();

      // If blocked, show a dismissable modal (one per POPUP_DISMISS_DAYS)
      if (isBlocked) {
        showAdblockPopup();
      }

      // expose for debugging/testing
      try { window.__kao_adblock = !!isBlocked; } catch (e) {}

      // Run the simple adBar check as an extra heuristic (runs in parallel)
      try { simpleAdbarCheck(); } catch (e) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
