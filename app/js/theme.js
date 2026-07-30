(() => {
  const KEY = "erpTheme_v2";

  function preferredTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
    document.querySelectorAll("[data-theme-icon]").forEach(icon => {
      icon.textContent = theme === "dark" ? "☀" : "☾";
    });
    document.querySelectorAll("[data-theme-label]").forEach(label => {
      label.textContent = theme === "dark" ? "Modo claro" : "Modo escuro";
    });
    document.dispatchEvent(new CustomEvent("erp:themechange", { detail: { theme } }));
  }

  applyTheme(preferredTheme());

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(document.documentElement.dataset.theme || preferredTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        window.ERP?.toast(
          next === "dark" ? "Modo escuro ativado" : "Modo claro ativado",
          "A preferência foi salva neste navegador.",
          "processing"
        );
      });
    });
  });

  window.ERP_THEME = { applyTheme };
})();
