(function () {
  "use strict";

  // ── Localized banner strings ──────────────────────────────────────────
  var messages = {
    fa:      "اندروید، یک سکّوی بسته خواهد شد!",
    ar:      "سيصبح نظام أندرويد منصة مغلقة في",
    he:      "אנדרואיד תהפוך לפלטפורמה נעולה בעוד",
    en:      "Android will become a locked-down platform in",
    ca:      "Android es convertirà en una plataforma tancada",
    cs:      "Android se stane uzamčenou platformou za",
    de:      "Android wird eine geschlossene Plattform werden.",
    da:      "Android vil blive en lukket platform om",
    nl:      "Android zal een gesloten platform worden over",
    el:      "Το Android θα γίνει μία κλειστή πλατφόρμα",
    es:      "Android se convertirá en una plataforma cerrada en",
    fr:      "Android va devenir une plateforme fermée dans",
    id:      "Android akan menjadi platform yang terkunci.",
    it:      "Android diventerà una piattaforma bloccata",
    ko:      "Android가 폐쇄된 플랫폼이 되기까지 남은 시간:",
    pl:      "Android stanie się platformą zamkniętą za",
    "pt-BR": "O Android se tornará uma plataforma fechada em",
    ru:      "Android станет закрытой платформой через",
    sk:      "Android sa stane uzamknutou platformou",
    th:      "Androidจะเป็นแพลตฟอร์มที่ถูกล็อก",
    tr:      "Android kısıtlı bir platform haline gelecek.",
    uk:      "Android стане закритою платформою",
    "zh-CN": "安卓将成为一个封闭平台",
    "zh-TW": "Android 將成為一個封閉平台",
    ja:      "Androidは閉鎖的なプラットフォームになろうとしています",
    fi:      "Androidista tulee suljettu alusta",
    hu:      "Az Android egy lezárt platform lesz",
    vi:      "Android sẽ trở thành một hệ điều hành đóng",
    bg:      "Android ще стане заключена платформа след",
    be:      "Android станe закрытай плафтормай"
  };

  // ── Parse query parameters from the script's own src URL ──────────────
  function getScriptParams() {
    var params = {};
    try {
      var src = document.currentScript && document.currentScript.src;
      if (!src) return params;
      var q = src.indexOf("?");
      if (q === -1) return params;
      var pairs = src.substring(q + 1).split("&");
      for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split("=");
        params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      }
    } catch (e) {}
    return params;
  }

  var params = getScriptParams();

  // ── Determine locale ──────────────────────────────────────────────────
  function resolveLocale(tag) {
    if (!tag) return "en";
    if (messages[tag]) return tag;
    var lower = tag.toLowerCase();
    for (var key in messages) {
      if (key.toLowerCase() === lower) return key;
    }
    var base = lower.split("-")[0];
    for (var key2 in messages) {
      if (key2.toLowerCase() === base) return key2;
    }
    for (var key3 in messages) {
      if (key3.toLowerCase().split("-")[0] === base) return key3;
    }
    return "en";
  }

  var locale = resolveLocale(
    params.lang ||
    document.documentElement.lang ||
    navigator.language ||
    navigator.userLanguage
  );

  // ── Size variant ──────────────────────────────────────────────────────
  var size = params.size === "mini" ? "mini"
      : params.size === "minimal"
        ? "minimal"
        : "normal";

  // ── Link ────────────────────────────────────────────────────────────
  var linkParam = params.link;
  var defaultLink = "https://keepandroidopen.org" + (locale === "en" ? "" : "/" + locale + "/");
  var linkUrl = linkParam === "none" ? null : (linkParam || defaultLink);

  // ── Close button ────────────────────────────────────────────────────
  var showClose = params.hidebutton !== "off";
  var storageKey = "kao-banner-hidden";
  var dismissDays = 30;

  // ── Inject CSS ────────────────────────────────────────────────────────
  var cssNormal =
    ".kao-banner{" +
      "position:relative;" +
      "font-variant-numeric:tabular-nums;" +
      "background:linear-gradient(180deg,#d32f2f 0%,#b71c1c 100%);" +
      "border-bottom:4px solid #801313;" +
      "color:#fff;" +
      "font-family:'Arial Black',sans-serif;" +
      "font-weight:900;" +
      "text-transform:uppercase;" +
      "letter-spacing:2px;" +
      "font-size:1.5rem;" +
      "text-align:center;" +
      "text-shadow:" +
        "0px 1px 0px #9e1a1a," +
        "0px 2px 0px #8a1515," +
        "0px 3px 0px #751111," +
        "0px 4px 0px #5e0d0d," +
        "0px 6px 10px rgba(0,0,0,0.5);" +
      "padding:0.5rem 2.5rem;" +
      "line-height:1.6;" +
      "box-sizing:border-box;" +
    "}";

  var cssMini =
    ".kao-banner{" +
      "position:relative;" +
      "font-variant-numeric:tabular-nums;" +
      "background:linear-gradient(180deg,#d32f2f 0%,#b71c1c 100%);" +
      "border-bottom:2px solid #801313;" +
      "color:#fff;" +
      "font-family:'Arial Black',sans-serif;" +
      "font-weight:900;" +
      "text-transform:uppercase;" +
      "letter-spacing:1px;" +
      "font-size:0.75rem;" +
      "text-align:center;" +
      "text-shadow:" +
        "0px 1px 0px #9e1a1a," +
        "0px 2px 0px #8a1515," +
        "0px 3px 5px rgba(0,0,0,0.4);" +
      "padding:0.25rem 1.5rem;" +
      "line-height:1.4;" +
      "box-sizing:border-box;" +
    "}";

  var cssCommon =
    ".kao-banner a{color:#fff;text-decoration:none;}" +
    ".kao-banner a:hover{text-decoration:underline;}" +
    ".kao-banner-close{" +
      "position:absolute;" +
      "right:0.5rem;" +
      "top:50%;" +
      "transform:translateY(-50%);" +
      "background:none;" +
      "border:none;" +
      "color:#fff;" +
      "font-size:0.8em;" +
      "cursor:pointer;" +
      "opacity:0.7;" +
      "padding:0.25rem 0.5rem;" +
      "line-height:1;" +
      "text-shadow:none;" +
    "}" +
    ".kao-banner-close:hover{opacity:1;}";

  var cssKaoPulse =
    ".kao-banner:not(.no-animation) { animation:kao-pulse 2s infinite; }" +
    "@keyframes kao-pulse{" +
      "0%{box-shadow:0 0 0 0 rgba(211,47,47,0.7)}" +
      "70%{box-shadow:0 0 0 15px rgba(211,47,47,0)}" +
      "100%{box-shadow:0 0 0 0 rgba(211,47,47,0)}" +
    "}";

  var style = document.createElement("style");
  style.textContent = (size === "mini" ? cssMini : cssNormal)
    + (params.animation === "off" ? "" : cssKaoPulse)
    + cssCommon;
  document.head.appendChild(style);

  // ── Check if previously dismissed (reappears after dismissDays) ─────
  if (showClose) {
    try {
      var dismissed = localStorage.getItem(storageKey);
      if (dismissed) {
        var elapsed = Date.now() - Number(dismissed);
        if (elapsed < dismissDays * 24 * 60 * 60 * 1000) return;
        localStorage.removeItem(storageKey);
      }
    } catch (e) {}
  }

  // ── Create banner DOM ─────────────────────────────────────────────────
  var banner = document.createElement("div");
  banner.className = params.animation === "off" ? "kao-banner no-animation" : "kao-banner";

  var messageText = messages[locale] || messages.en;

  if (linkUrl) {
    var link = document.createElement("a");
    link.href = linkUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = messageText;
    banner.appendChild(link);
  } else {
    banner.appendChild(document.createTextNode(messageText));
  }

  banner.appendChild(document.createElement("br"));

  var countdownSpan = document.createElement("span");
  countdownSpan.textContent = " ";
  banner.appendChild(countdownSpan);

  // Close button
  if (showClose) {
    var closeBtn = document.createElement("button");
    closeBtn.className = "kao-banner-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", function () {
      banner.style.display = "none";
      try { localStorage.setItem(storageKey, String(Date.now())); } catch (e) {}
    });
    banner.appendChild(closeBtn);
  }

  // Insert into target element (by id) or prepend to <body>
  var targetId = params.id;
  if (targetId) {
    var target = document.getElementById(targetId);
    if (target) {
      target.appendChild(banner);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // ── Countdown logic ───────────────────────────────────────────────────
  var countDownDate = new Date("Sep 1, 2026 00:00:00").getTime();

  var unitFormatters = {
    day: new Intl.NumberFormat(locale, { style: "unit", unit: "day", unitDisplay: "narrow" }),
    hour: new Intl.NumberFormat(locale, { style: "unit", unit: "hour", unitDisplay: "narrow" }),
    minute: new Intl.NumberFormat(locale, { style: "unit", unit: "minute", unitDisplay: "narrow" }),
    second: new Intl.NumberFormat(locale, { style: "unit", unit: "second", unitDisplay: "narrow" })
  };

  function formatUnit(value, unit) {
    return unitFormatters[unit].format(value);
  }

  var remaining = new Array(7);
  var separator = " ";
  var timer = null;

  function updateBanner() {
    var now = new Date().getTime();
    var distance = countDownDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var parts = 0;
    remaining[0] = days > 0 ? formatUnit(days, "day") : null;
    if (remaining[0]) parts++;
    remaining[1] = parts ? separator : null;
    remaining[2] = parts || hours > 0 ? formatUnit(hours, "hour") : null;
    if (remaining[2]) parts++;
    remaining[3] = parts ? separator : null;
    remaining[4] = parts || minutes > 0 ? formatUnit(minutes, "minute") : null;
    if (remaining[4]) parts++;
    remaining[5] = parts ? separator : null;
    remaining[6] = formatUnit(seconds, "second");

    countdownSpan.textContent = remaining.join("");

    if (distance < 0) {
      clearInterval(timer);
    }
  }

  timer = setInterval(updateBanner, 1000);
  updateBanner();
})();