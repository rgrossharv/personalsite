(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      const theme = localStorage.getItem("theme");
      return theme === "dark" || theme === "light" ? theme : null;
    } catch (_) {
      return null;
    }
  }

  function systemTheme() {
    return systemPreference.matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (!toggle) return;

    const isDark = theme === "dark";
    toggle.setAttribute("aria-checked", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  applyTheme(storedTheme() || systemTheme());

  if (toggle) {
    toggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", nextTheme);
      } catch (_) {
        // The choice still applies for the current visit when storage is unavailable.
      }
      applyTheme(nextTheme);
    });
  }

  systemPreference.addEventListener("change", () => {
    if (!storedTheme()) applyTheme(systemTheme());
  });
})();
