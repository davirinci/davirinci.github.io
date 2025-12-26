// Centralized theme toggle: royal (default), deep, dark, light
(function () {
  const THEMES = ["royal", "deep", "dark", "light"];
  const saved = localStorage.getItem("theme");
  const initial = saved && THEMES.includes(saved) ? saved : "royal";
  document.body.setAttribute("data-theme", initial);

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
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    const btn = document.getElementById("theme-toggle");
    if (btn) updateToggleLabel(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      updateToggleLabel(btn);
      btn.addEventListener("click", toggleTheme);
    }
  });
})();
