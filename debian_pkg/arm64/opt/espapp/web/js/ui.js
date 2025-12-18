// js/ui.js
// UI helpers (sidebar, indicators, status, minor DOM utilities)

import { addLog } from './config.js'; // we only import a named helper; but avoid calling it here
// We'll call window.addAppLog which main.js guarantees to exist after import ordering.

export function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  const main = document.querySelector("main");
  if (sidebar) sidebar.classList.toggle("closed");
  if (main) main.classList.toggle("full");
  if (window.addAppLog) window.addAppLog("Menu toggled");
}

export function showStatus(txt) {
  const st = document.getElementById("status-text");
  if (st) st.textContent = txt;
}

export function setConnectionIndicator(isConnected, isReceivingData) {
  const el = document.getElementById("conn-indicator");
  const dot = document.getElementById("conn-dot");
  const txt = document.getElementById("conn-text");
  if (!el || !dot || !txt) return;
  if (isConnected) {
    el.classList.remove("disconnected");
    el.classList.add("connected");
    txt.textContent = isReceivingData ? "Recibiendo datos" : "Conectado";
    dot.style.color = isReceivingData ? "var(--accent)" : "var(--subtext)";
    el.classList.toggle("receiving", isReceivingData);
  } else {
    el.classList.remove("connected", "receiving");
    el.classList.add("disconnected");
    txt.textContent = "Desconectado";
    dot.style.color = "var(--subtext)";
  }
}
