// Shared dark/light theme toggle.
// The inline script in each page's <head> sets the initial theme before
// first paint; this wires up the header button and persists the choice.
function initThemeToggle() {
  const toggle = document.querySelector(".theme-toggle") as HTMLButtonElement;
  if (toggle === null) {
    return;
  }

  function applyTheme(theme: string) {
    document.documentElement.dataset.theme = theme;
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  toggle.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("pcm-theme", next);
    applyTheme(next);
  });

  applyTheme(document.documentElement.dataset.theme ?? "light");
}

export { initThemeToggle };
