// js/theme.js
export function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.classList.toggle("light");
  const btn = document.getElementById("theme-btn");
  if (btn) btn.textContent = isLight ? "☀️" : "🌙";
  if (window.addAppLog) window.addAppLog(`Tema cambiado a ${isLight ? "claro" : "oscuro"}`);
}
