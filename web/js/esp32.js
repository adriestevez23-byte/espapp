// js/esp32.js
import { state, setEsp32Ip } from './config.js';
import { addAppLog } from './logs.js';
import { addMeasurement } from './table.js';
import { showStatus, setConnectionIndicator } from './ui.js';

let pollingHandle = null;

export async function conectarESP32() {
  if (!window.pywebview) { alert("Disponible solo en desktop"); return; }
  const status = document.getElementById("conectar-status");
  const ssidEl = document.getElementById("esp32-ssid");
  const pwdEl = document.getElementById("esp32-password");
  const ssid = ssidEl ? ssidEl.value : "";
  const pwd = pwdEl ? pwdEl.value : "";
  if (!ssid) { if (status) status.textContent = "Introduce un SSID"; return; }

  if (status) status.textContent = "Conectando...";
  try {
    const r = await window.pywebview.api.connect_to_esp32(ssid, pwd);
    if (r.ok) {
      state.ESP32_IP = r.ip.replace(/^http:\/\//, "").replace(/^https:\/\//, "");
      setEsp32Ip(state.ESP32_IP);
      if (status) status.textContent = `Conectado a ${ssid}`;
      if (showStatus) showStatus("Conectado");
      if (setConnectionIndicator) setConnectionIndicator(true, false);
      if (addAppLog) addAppLog("Conectado a ESP32 IP: " + state.ESP32_IP);
      
      // Enviar la distancia de la sección activa al ESP
      try {
        const { sectionManager } = await import('./sections.js');
        const seccionActiva = sectionManager.seccionActiva;
        if (seccionActiva && seccionActiva.distancia) {
          const { valor, unidad } = seccionActiva.distancia;
          console.debug('[ESP32] Enviando distancia:', valor, unidad);
          const distRes = await window.pywebview.api.send_distance_to_esp32(valor, unidad);
          if (distRes && distRes.ok) {
            addAppLog(`Distancia enviada al ESP: ${valor} ${unidad} = ${distRes.metros}m`);
          } else {
            addAppLog(`Error enviando distancia: ${distRes?.msg || 'Error desconocido'}`);
          }
        } else {
          addAppLog('No hay distancia configurada en esta sección.');
        }
      } catch (e) {
        console.warn('[ESP32] Error al enviar distancia:', e);
        addAppLog('Error al enviar distancia: ' + String(e));
      }
      
      // start polling immediately
      obtenerDatos();
      startPolling();
    } else {
      if (status) status.textContent = `Error: ${r.msg}`;
      state.ESP32_IP = null;
      if (addAppLog) addAppLog("Error conectar ESP32: " + r.msg);
    }
  } catch (e) {
    if (status) status.textContent = "Error al conectar";
    state.ESP32_IP = null;
    if (addAppLog) addAppLog("Error conectar ESP32: " + String(e));
  }
}

export async function obtenerDatos() {
  try {
    if (!window.pywebview?.api?.fetch_data_from_esp32) throw new Error("API fetch_data_from_esp32 no disponible");
    const res = await window.pywebview.api.fetch_data_from_esp32();
    
    if (res && res.ok && Array.isArray(res.measurements) && res.measurements.length > 0) {
      // El ESP devuelve un array de mediciones
      // Tomar la última medición sin procesar (para no duplicar)
      const measurements = res.measurements;
      const lastIdx = measurements.length - 1;
      const m = measurements[lastIdx];
      
      // Las mediciones del ESP ya tienen: tiempo, velocidad, metros
      if (m && typeof m.tiempo === 'number' && m.tiempo > 0) {
        const nueva = { 
          tiempo: m.tiempo, 
          velocidad: m.velocidad || 0, 
          metros: m.metros || 0 
        };
        console.debug("[ESP32][POLL] Medición recibida:", nueva);
        addMeasurement(nueva);
        if (setConnectionIndicator) setConnectionIndicator(true, true);
        if (showStatus) showStatus("Conectado");
        if (addAppLog) addAppLog(`Medición: t=${nueva.tiempo.toFixed(3)}s v=${nueva.velocidad.toFixed(2)}m/s dist=${nueva.metros.toFixed(2)}m`);
      } else {
        // Array vacío o medición inválida
        if (state.ESP32_IP) {
          if (setConnectionIndicator) setConnectionIndicator(true, false);
        }
      }
    } else if (res && !res.ok) {
      // Si hay respuesta pero no está ok, probablemente desconectado
      if (setConnectionIndicator) setConnectionIndicator(false, false);
      if (showStatus) showStatus("Desconectado");
    } else {
      // Si hay respuesta pero sin datos válidos, mantener conectado (puede ser que no haya mediciones)
      if (state.ESP32_IP) {
        if (setConnectionIndicator) setConnectionIndicator(true, false);
      }
    }
  } catch (e) {
    if (setConnectionIndicator) setConnectionIndicator(false, false);
    if (showStatus) showStatus("Desconectado");
    if (addAppLog) addAppLog("Error fetch ESP32: " + String(e));
  }
}

export function startPolling(interval = 1000) {
  if (pollingHandle) clearInterval(pollingHandle);
  pollingHandle = setInterval(obtenerDatos, interval);
}

export function stopPolling() {
  if (pollingHandle) { clearInterval(pollingHandle); pollingHandle = null; }
}

/* TCP / WebSocket realtime */
export function iniciarTCP() {
  if (!state.ESP32_IP) return;
  try {
    const url = `ws://${state.ESP32_IP}:5001`;
    const ws = new WebSocket(url);
    state.tcpSocket = ws;
    ws.onopen = () => { if (addAppLog) addAppLog("TCP conectado"); };
    ws.onmessage = evt => {
      try {
        const d = JSON.parse(evt.data);
        if (d.tiempo && d.velocidad && d.metros) {
          console.debug("[ESP32][TCP] Medición recibida:", d);
          addMeasurement({ tiempo: d.tiempo, velocidad: d.velocidad, metros: d.metros });
          if (setConnectionIndicator) setConnectionIndicator(true, true);
          if (addAppLog) addAppLog(`Medición TCP: t=${d.tiempo} v=${d.velocidad}`);
        }
      } catch (e) { if (addAppLog) addAppLog("Error parseando TCP: " + String(e)); }
    };
    ws.onclose = () => { if (setConnectionIndicator) setConnectionIndicator(false, false); if (addAppLog) addAppLog("TCP desconectado"); };
    ws.onerror = e => { if (addAppLog) addAppLog("Error TCP: " + String(e)); };
  } catch (e) { if (addAppLog) addAppLog("No se pudo conectar TCP: " + String(e)); }
}

/* Exponer globales */
window.conectarESP32 = conectarESP32;
window.obtenerDatos = obtenerDatos;
window.iniciarTCP = iniciarTCP;
window.startPolling = startPolling;
window.stopPolling = stopPolling;
