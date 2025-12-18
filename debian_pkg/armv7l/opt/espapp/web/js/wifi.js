// js/wifi.js
import { state, setRedes } from './config.js';
import { escapeHtml } from './utils.js';

let _escaneando = false;

export async function escaneaRedes() {
  if (_escaneando) {
    console.debug("escaneaRedes: ya en progreso, ignorando llamada reentrante");
    return;
  }
  _escaneando = true;
  const listEl = document.getElementById("lista-wifi");
  if (listEl) {
    listEl.innerHTML = "<li>Buscando redes…</li>";
  }
  const scanBtn = document.getElementById("scan-btn");
  if (scanBtn) scanBtn.disabled = true;
  
  try {
    console.debug("[WIFI] window.pywebview disponible:", !!window.pywebview);
    console.debug("[WIFI] window.pywebview.api disponible:", !!window.pywebview?.api);
    console.debug("[WIFI] window.pywebview.api.scan_wifi disponible:", !!window.pywebview?.api?.scan_wifi);
    if (!window.pywebview?.api?.scan_wifi) throw new Error("API scan_wifi no disponible");
    const resRaw = await window.pywebview.api.scan_wifi();
    console.debug("[WIFI] scan_wifi raw result type:", typeof resRaw);
    try { console.debug('[WIFI] scan_wifi raw preview:', (typeof resRaw === 'string') ? resRaw.slice(0,200) : JSON.stringify(resRaw).slice(0,200)); } catch(e){ console.debug('[WIFI] preview error', e); }

    // Manejar respuesta que puede venir como string JSON (evitar Proxy)
    let resLimpia = null;
    try {
      if (typeof resRaw === 'string') {
        resLimpia = JSON.parse(resRaw);
      } else if (resRaw && typeof resRaw === 'object') {
        // si por alguna razón es objeto, convertir solo la parte útil de forma segura
        try {
          const lista = [];
          if (Array.isArray(resRaw.networks)) {
            for (let i = 0; i < resRaw.networks.length; i++) {
              const n = resRaw.networks[i];
              if (!n) continue;
              lista.push({
                ssid: String(n.ssid || ""),
                secure: Boolean(n.secure),
                signal: Number(n.signal || 0)
              });
            }
          }
          resLimpia = { ok: Boolean(resRaw.ok), msg: String(resRaw.msg || ''), networks: lista };
        } catch (err) {
          console.warn('[WIFI] Fallback al parse completo debido a:', err);
          // Intenta convertir a JSON string primero, luego parsear
          resLimpia = JSON.parse(JSON.stringify(resRaw));
        }
      } else {
        throw new Error('scan_wifi retornó formato inesperado: ' + typeof resRaw);
      }
    } catch (err) {
      console.error('[WIFI] Error parseando respuesta de scan_wifi:', err);
      console.error('[WIFI] resRaw value:', resRaw);
      console.trace();
      throw err;
    }
    
    console.debug("scan_wifi networks count:", resLimpia.networks?.length || 0);

    if (!resLimpia.ok) throw resLimpia.msg || "Error escaneando";
    
    // Usar lista limpia de objetos primitivos (ya deserialized)
    const redes = resLimpia.networks || [];
    try {
      state.redesEscaneadas = redes;
      if (typeof setRedes === 'function') setRedes(redes);
    } catch (err) {
      console.error('[WIFI] Error asignando redes al estado:', err);
      console.trace();
      throw err;
    }
    
    if (listEl) {
      // Construir la lista usando elementos DOM
      listEl.innerHTML = "";
      redes.forEach(n => {
        const li = document.createElement('li');
        const icon = n.secure ? '🔒' : '🔓';
        li.textContent = `${icon} ${n.ssid}`;
        li.dataset.ssid = String(n.ssid || "");
        li.addEventListener('click', () => {
          try { clickRed(li.dataset.ssid); } catch (err) { console.error('clickRed error', err); }
        });
        listEl.appendChild(li);
      });
    }
    if (window.addAppLog) window.addAppLog("Escaneo de redes completado");
  } catch (e) {
    console.error("[WIFI] Error en escaneaRedes:", e);
    console.error("[WIFI] Error stack:", e.stack);
    console.error("[WIFI] Error name:", e.name);
    if (listEl) listEl.innerHTML = "<li>Error al escanear</li>";
    if (window.addAppLog) window.addAppLog("Error escaneando redes: " + String(e));
  } finally {
    if (scanBtn) scanBtn.disabled = false;
    _escaneando = false;
  }
}

export function clickRed(ssid) {
  const red = (state.redesEscaneadas || []).find(r => r.ssid === ssid);
  if (!red) return;
  const ssidInput = document.getElementById("esp32-ssid");
  const pwdContainer = document.getElementById("password-container");
  const pwdInput = document.getElementById("esp32-password");
  if (!ssidInput || !pwdContainer || !pwdInput) return;
  ssidInput.value = ssid;
  if (red.secure) {
    pwdContainer.style.display = "flex";
    pwdInput.value = "";
  } else {
    pwdContainer.style.display = "none";
    // connect automatically if unsecure
    if (window.conectarESP32) window.conectarESP32();
  }
}

export function togglePassword() {
  const input = document.getElementById("esp32-password");
  if (!input) return;
  input.type = (input.type === "password") ? "text" : "password";
}

/* Exponer globalmente para onclicks */
window.escaneaRedes = escaneaRedes;
window.clickRed = clickRed;
window.togglePassword = togglePassword;
