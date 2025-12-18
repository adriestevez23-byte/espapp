// js/logs.js
// Manejo de logs, modal dinámico y descargas
import { state, addLog as cfgAddLog } from './config.js';

export function addAppLog(msg) {
  cfgAddLog(msg);
}
window.addAppLog = addAppLog; // hacer accesible globalmente (evita circular imports)

export function ensureLogsUI() {
  const headerRight = document.querySelector(".header-right");
  if (headerRight && !document.getElementById("logs-btn")) {
    const btn = document.createElement("button");
    btn.id = "logs-btn";
    btn.title = "Ver logs";
    btn.textContent = "📝";
    btn.style.fontSize = "1.1rem";
    btn.onclick = abrirLogs;
    headerRight.insertBefore(btn, headerRight.children[headerRight.children.length - 1]);
  }

  if (!document.getElementById("logsModal")) {
    const modal = document.createElement("div");
    modal.id = "logsModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:800px;">
        <button class="close-btn" onclick="cerrarLogs()">✖</button>
        <h3>Ver Logs</h3>
        <div style="display:flex; gap:12px; margin-bottom:12px;">
          <button onclick="showLogs('esp32')">ESP32</button>
          <button onclick="showLogs('app')">App</button>
          <!-- Botón Mediciones/PDF eliminado -->
        </div>
        <div id="logsContent" style="max-height:400px; overflow:auto; text-align:left; background:var(--card); padding:12px; border-radius:6px;"></div>
        <div id="logsFooter" style="margin-top:12px; text-align:right;"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!document.getElementById("confirmModal")) {
    const modal = document.createElement("div");
    modal.id = "confirmModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:400px; text-align:center;">
        <h3>Confirmación</h3>
        <p id="confirmText">¿Estás seguro?</p>
        <div style="margin-top:16px;">
          <button id="confirmYes" style="margin-right:12px;">Sí</button>
          <button id="confirmNo">No</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("confirmNo").onclick = () => modal.style.display = "none";
  }
}

export function abrirLogs() {
  ensureLogsUI();
  const m = document.getElementById("logsModal");
  if (m) m.style.display = "flex";
  showLogs("esp32");
}

export function cerrarLogs() {
  const m = document.getElementById("logsModal");
  if (m) m.style.display = "none";
}

export async function showLogs(tipo) {
  const content = document.getElementById("logsContent");
  const footer = document.getElementById("logsFooter");
  if (!content || !footer) return;
  content.innerHTML = "Cargando…";
  footer.innerHTML = "";

  if (tipo === 'app') {
    content.innerHTML = `<pre>${escapeHtml(state.appLogs.join("\n"))}</pre>`;
    footer.innerHTML = ``;
  } else if (tipo === 'esp32') {
    try {
      let logs = "";
      if (window.pywebview?.api?.get_esp32_logs) {
        const res = await window.pywebview.api.get_esp32_logs();
        logs = Array.isArray(res) ? res.join("\n") : JSON.stringify(res, null, 2);
      } else if (state.ESP32_IP) {
        const r = await fetch(`http://${state.ESP32_IP}/logs`);
        logs = await r.text();
      } else { content.innerHTML = "ESP32 no conectado"; return; }
      content.innerHTML = `<pre>${escapeHtml(logs)}</pre>`;
      footer.innerHTML = `<button onclick="downloadEspLogs()">Descargar logs ESP32</button>`;
    } catch (e) {
      content.innerHTML = "Error obteniendo logs: " + escapeHtml(String(e));
    }
  }
}

/* Descarga de logs de la app, permitiendo elegir ubicación en PyWebView */
export async function downloadAppLogs() {
  const data = state.appLogs.join("\n");
  if (window.pywebview?.api?.save_file) {
    // Pregunta al usuario dónde guardar
    await window.pywebview.api.save_file(data, "app_logs.txt");
  } else {
    const blob = new Blob([data], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "app_logs.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

/* Descarga de logs del ESP32, con elección de ubicación si es escritorio */
export async function downloadEspLogs() {
  try {
    let content = "";
    if (window.pywebview?.api?.get_esp32_logs) {
      const res = await window.pywebview.api.get_esp32_logs();
      content = Array.isArray(res) ? res.join("\n") : JSON.stringify(res, null, 2);
    } else if (state.ESP32_IP) {
      const r = await fetch(`http://${state.ESP32_IP}/logs`);
      content = await r.text();
    } else {
      alert("No hay ESP32 conectado");
      return;
    }

    if (window.pywebview?.api?.save_file) {
      await window.pywebview.api.save_file(content, "esp32_logs.txt");
    } else {
      const blob = new Blob([content], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "esp32_logs.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    }
  } catch (e) {
    alert("Error descargando logs: " + e);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m])
  );
}

/* Exponer funciones globales que HTML usa vía onclick */
window.ensureLogsUI = ensureLogsUI;
window.abrirLogs = abrirLogs;
window.cerrarLogs = cerrarLogs;
window.showLogs = showLogs;
window.downloadAppLogs = downloadAppLogs;
window.downloadEspLogs = downloadEspLogs;
window.addAppLog = addAppLog;
