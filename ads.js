(function () {
  "use strict";

  // ads.js - improved adblock "bait" detector (CSP-friendly, no network requests)
  // This version creates multiple bait elements with various common ad-related
  // classnames/attributes and treats adblock as present when a majority are
  // hidden/removed. It always ensures the banner has a close button so users
  // can dismiss it. The script does not block or modify other site content.

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

  function detectAdblock(callback, timeout) {
    timeout = typeof timeout === 'number' ? timeout : 200;
    try {
      var baitNames = [
        'ad', 'ads', 'adsbox', 'ad-banner', 'adbox', 'ad_unit', 'pub',
        'advert', 'advertisement', 'google-ads', 'sponsored', 'doubleclick',
        'banner-ad', 'ytd-ads' , 'ad-placeholder'
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

  // Run after DOM ready
  function run() {
    detectAdblock(function (isBlocked) {
      // keep behaviour: always ensure a close button so user can dismiss the banner
      ensureCloseButtonOnBanner();

      // expose for debugging/testing
      try { window.__kao_adblock = !!isBlocked; } catch (e) {}

      // If you prefer to only add the close button when blocked, change the
      // call above to `if (isBlocked) ensureCloseButtonOnBanner();`
      // For debugging you can check `window.__kao_adblock` in console.
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
