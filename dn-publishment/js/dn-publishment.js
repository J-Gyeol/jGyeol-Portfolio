(function () {
  "use strict";

  var STORAGE_KEY = "dn-publishment-theme";
  var header = document.querySelector(".js-ns-header");
  var revealEls = document.querySelectorAll(".js-ns-reveal");
  var themeToggle = document.querySelector(".js-ns-theme-toggle");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
      );
      themeToggle.setAttribute("title", theme === "dark" ? "라이트 모드" : "다크 모드");
    }
    setStoredTheme(theme);
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
    } else {
      applyTheme("light");
    }
  }

  function onScroll() {
    if (!header) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("ns-header--scrolled", y > 8);
  }

  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      applyTheme(isDark ? "light" : "dark");
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("ns-reveal--visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("ns-reveal--visible");
    });
  }
})();
