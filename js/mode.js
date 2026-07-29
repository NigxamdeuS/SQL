/**
 * 表示モード切替（補助 / 講義）＋ ダークモード切替
 */
(function () {
  "use strict";

  const createPage = document.getElementById("mode-create");
  const lessonsPage = document.getElementById("mode-lessons");
  const searchInput = document.getElementById("searchInput");
  const buttons = document.querySelectorAll(".mode-btn");
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "pg-memo-theme";
  let currentMode = null;

  function setSearchEnabled(enabled) {
    if (!searchInput) return;
    searchInput.setAttribute("aria-hidden", enabled ? "false" : "true");
    searchInput.tabIndex = enabled ? 0 : -1;
    if (!enabled) searchInput.blur();
  }

  function switchMemoMode(mode, instant) {
    if (!mode || mode === currentMode) return;
    currentMode = mode;

    const isCreate = mode === "create";
    document.body.classList.toggle("mode-create", isCreate);
    document.body.classList.toggle("mode-lessons", !isCreate);

    if (createPage) {
      createPage.classList.toggle("is-active", isCreate);
      createPage.setAttribute("aria-hidden", isCreate ? "false" : "true");
      if (instant) createPage.style.animation = "none";
    }
    if (lessonsPage) {
      lessonsPage.classList.toggle("is-active", !isCreate);
      lessonsPage.setAttribute("aria-hidden", isCreate ? "true" : "false");
      if (instant) lessonsPage.style.animation = "none";
    }

    if (instant) {
      // 初回表示はアニメなし。次の切替から効かせる
      requestAnimationFrame(function () {
        if (createPage) createPage.style.animation = "";
        if (lessonsPage) lessonsPage.style.animation = "";
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setSearchEnabled(!isCreate);

    buttons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.mode === mode);
    });
  }

  window.switchMemoMode = switchMemoMode;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchMemoMode(btn.dataset.mode);
    });
  });

  if (location.hash && location.hash.startsWith("#lesson")) {
    switchMemoMode("lessons", true);
  } else {
    switchMemoMode("create", true);
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
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(!isDark());
    });
    applyTheme(isDark());
  }
})();
