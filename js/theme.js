// Centralized theme toggle: royal (default), deep, dark, light
(function () {
  const THEMES = ["royal", "deep", "dark", "light"];

  function applyThemeToDocument(doc, theme) {
    if (!doc) return;
    if (doc.documentElement) {
      doc.documentElement.setAttribute("data-theme", theme);
    }
    if (doc.body) {
      doc.body.setAttribute("data-theme", theme);
    }
  }

  function setTheme(theme) {
    if (!THEMES.includes(theme)) return;

    // Apply to current document
    applyThemeToDocument(document, theme);

    // Also update parent window if in iframe
    try {
      if (window.parent && window.parent !== window) {
        applyThemeToDocument(window.parent.document, theme);
      }
    } catch (e) {
      // Cross-origin iframe, silently fail
    }
  }

  function updateToggleLabel(btn) {
    const theme =
      document.documentElement.getAttribute("data-theme") ||
      document.body.getAttribute("data-theme") ||
      "royal";
    const pretty = theme.charAt(0).toUpperCase() + theme.slice(1);
    btn.textContent = `Theme: ${pretty}`;
    btn.setAttribute("aria-label", `Current theme ${pretty}`);
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") ||
      document.body.getAttribute("data-theme") ||
      "royal";
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
