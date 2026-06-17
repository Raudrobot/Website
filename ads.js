(function () {
  "use strict";

  // ads.js - lightweight adblock "bait" detector (CSP-friendly, no network requests)
  // If adblock is detected, ensure the banner has a visible close button so users
  // can dismiss it. This script does not block or change other content.

  function ensureCloseButtonOnBanner() {
    try {
      var banner = document.querySelector('.kao-banner');
      if (!banner) return;
      // If a close button already exists, nothing to do.
      if (banner.querySelector('.kao-banner-close')) return;

      var btn = document.createElement('button');
      btn.className = 'kao-banner-close';
      btn.setAttribute('aria-label', 'Close');
      btn.textContent = '\u2715';
      // Minimal inline styling so it looks like the banner's button.
      btn.style.cssText = 'position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:0.8em;cursor:pointer;opacity:0.7;padding:0.25rem 0.5rem;line-height:1;text-shadow:none;';
      btn.addEventListener('click', function () {
        banner.style.display = 'none';
        try {
          localStorage.setItem('kao-banner-hidden', String(Date.now()));
        } catch (e) {}
      });
      banner.appendChild(btn);
    } catch (e) {
      // fail silently
    }
  }

  function detectAdblock(callback, timeout) {
    timeout = typeof timeout === 'number' ? timeout : 50;
    try {
      var bait = document.createElement('div');
      // common ad-related classname that many blockers target
      bait.className = 'adsbox bait-detect';
      // keep off-screen and tiny so it won't affect layout
      bait.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(bait);

      window.setTimeout(function () {
        var blocked = false;
        try {
          var cs = window.getComputedStyle ? getComputedStyle(bait) : bait.currentStyle;
          if (
            bait.offsetParent === null ||
            bait.offsetHeight === 0 ||
            bait.offsetWidth === 0 ||
            cs.display === 'none' ||
            cs.visibility === 'hidden'
          ) {
            blocked = true;
          }
        } catch (e) {
          // ignore
        }

        try {
          bait.parentNode.removeChild(bait);
        } catch (e) {}

        callback(Boolean(blocked));
      }, timeout);
    } catch (e) {
      // on error, assume not blocked
      callback(false);
    }
  }

  // Run after DOM is ready; banner.js also runs at page load and inserts the banner
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      detectAdblock(function (isBlocked) {
        // Regardless of detection result, ensure there's a close button so users can
        // dismiss the banner. If you only want the button when blocked, wrap this
        // call inside `if (isBlocked) { ... }`.
        ensureCloseButtonOnBanner();
      });
    });
  } else {
    detectAdblock(function (isBlocked) {
      ensureCloseButtonOnBanner();
    });
  }
})();
