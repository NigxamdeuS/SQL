/**
 * 表示モード切替 ＋ ダークモード
 */
(function () {
  "use strict";

  var MODES = ["home", "create", "lessons", "insert", "format", "errors"];
  var MODE_LABELS = {
    home: "トップ",
    create: "SQL補助",
    lessons: "講義",
    insert: "SQL生成",
    format: "SQL整形",
    errors: "エラー検索辞典",
  };

  var pages = {};
  MODES.forEach(function (mode) {
    pages[mode] = document.getElementById("mode-" + mode);
  });

  var searchInput = document.getElementById("searchInput");
  var themeToggle = document.getElementById("themeToggle");
  var navLinks = document.querySelectorAll("#g-nav a[data-mode]");
  var THEME_KEY = "pg-memo-theme";
  var currentMode = null;

  function setSearchEnabled(enabled) {
    if (!searchInput) return;
    searchInput.setAttribute("aria-hidden", enabled ? "false" : "true");
    searchInput.tabIndex = enabled ? 0 : -1;
    if (!enabled) searchInput.blur();
  }

  function switchMemoMode(mode, instant) {
    if (!mode || MODES.indexOf(mode) === -1) return;
    if (mode === currentMode && !instant) return;
    currentMode = mode;

    MODES.forEach(function (id) {
      document.body.classList.toggle("mode-" + id, id === mode);
      var page = pages[id];
      if (!page) return;
      var active = id === mode;
      page.classList.toggle("is-active", active);
      page.setAttribute("aria-hidden", active ? "false" : "true");
      if (instant) page.style.animation = "none";
    });

    if (instant) {
      requestAnimationFrame(function () {
        MODES.forEach(function (id) {
          if (pages[id]) pages[id].style.animation = "";
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setSearchEnabled(mode === "lessons");

    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-mode") === mode);
    });

    if (mode === "home" && typeof window.startParticleHome === "function") {
      setTimeout(window.startParticleHome, 40);
    }
  }

  window.switchMemoMode = switchMemoMode;
  window.MODE_LABELS = MODE_LABELS;

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = document.querySelector(".openbtn");
    var nav = document.getElementById("g-nav");
    var circle = document.querySelector(".circle-bg");
    if (openBtn) openBtn.classList.remove("active");
    if (nav) nav.classList.remove("panelactive");
    if (circle) circle.classList.remove("circleactive");
  });

  if (location.hash && location.hash.startsWith("#lesson")) {
    switchMemoMode("lessons", true);
  } else {
    switchMemoMode("home", true);
  }

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch (e) {}
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        dark ? "ライトモードに切替" : "ダークモードに切替"
      );
      themeToggle.title = dark ? "ライトモード" : "ダークモード";
    }
    window.dispatchEvent(new CustomEvent("pg-theme-change", { detail: { dark: dark } }));
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(!isDark());
    });
    applyTheme(isDark());
  }

  var titleLink = document.querySelector(".site-title-link");
  if (titleLink) {
    titleLink.addEventListener("click", function (e) {
      e.preventDefault();
      switchMemoMode("home");
      var openBtn = document.querySelector(".openbtn");
      var nav = document.getElementById("g-nav");
      var circle = document.querySelector(".circle-bg");
      if (openBtn) openBtn.classList.remove("active");
      if (nav) nav.classList.remove("panelactive");
      if (circle) circle.classList.remove("circleactive");
    });
  }
})();
