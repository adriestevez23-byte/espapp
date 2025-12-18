// js/modals.js
export function abrirAjustes() { const el = document.getElementById("settingsModal"); if (el) el.style.display = "flex"; }
export function cerrarAjustes() { const el = document.getElementById("settingsModal"); if (el) el.style.display = "none"; }
export function abrirModal() { const el = document.getElementById("aboutModal"); if (el) el.style.display = "flex"; }
export function cerrarModal() { const el = document.getElementById("aboutModal"); if (el) el.style.display = "none"; }
export function abrirGmail() { window.open("mailto:ies.escolas.proval@edu.xunta.gal"); }
