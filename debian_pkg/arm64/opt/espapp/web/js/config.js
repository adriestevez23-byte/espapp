// js/config.js
export const state = {
  ESP32_IP: null,              // IP dinámica al conectar
  redesEscaneadas: [],         // info de redes con seguridad
  tcpSocket: null,             // WebSocket opcional
  appLogs: [],                 // logs locales
  tablaHistorial: [],          // historial de mediciones (compatibilidad hacia atrás)
  distanciaEntreSensores: null // distancia en cm (usuario)
};

export function setEsp32Ip(ip) { state.ESP32_IP = ip; }
export function setRedes(lista) { state.redesEscaneadas = lista; }
export function setTcpSocket(s) { state.tcpSocket = s; }

export function addLog(msg) {
  const t = new Date().toLocaleString();
  state.appLogs.push(`[${t}] ${msg}`);
  if (state.appLogs.length > 1000) state.appLogs.shift();
  // Nota: no llamar a window.addAppLog aquí para evitar recursión.
}

export function addMedicion(m) {
  state.tablaHistorial.push(m);
}

export function resetTabla() {
  state.tablaHistorial = [];
}
