// Centralized theme toggle: royal (default), deep, dark, light
(function () {
  const THEMES = ["royal", "deep", "dark", "light"];

  function setTheme(theme) {
    if (THEMES.includes(theme)) {
      document.body.setAttribute("data-theme", theme);
      // Also update parent window if in iframe
      try {
        if (window.parent !== window) {
          window.parent.document.body.setAttribute("data-theme", theme);
        }
      } catch (e) {
        // Cross-origin iframe, silently fail
      }
    }
  }

  function updateToggleLabel(btn) {
    const theme = document.body.getAttribute("data-theme") || "royal";
    const pretty = theme.charAt(0).toUpperCase() + theme.slice(1);
    btn.textContent = `Theme: ${pretty}`;
    btn.setAttribute("aria-label", `Current theme ${pretty}`);
  }

  function toggleTheme() {
    const current = document.body.getAttribute("data-theme") || "royal";
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
    localStorage.setItem("theme", next);
    const btn = document.getElementById("theme-toggle");
    if (btn) updateToggleLabel(btn);
  }

  // Listen for storage changes from other windows/iframes
  window.addEventListener("storage", function (e) {
    if (e.key === "theme" && e.newValue) {
      setTheme(e.newValue);
      const btn = document.getElementById("theme-toggle");
      if (btn) updateToggleLabel(btn);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const saved = localStorage.getItem("theme");
    const initial = saved && THEMES.includes(saved) ? saved : "royal";
    setTheme(initial);

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      updateToggleLabel(btn);
      btn.addEventListener("click", toggleTheme);
    }
  });
})();
