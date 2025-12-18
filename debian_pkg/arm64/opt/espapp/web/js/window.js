// js/window.js
// Funciones para controlar la ventana frameless

export function minimizeWindow() {
  if (window.pywebview?.api) {
    window.pywebview.api.minimize_window();
  }
}

export function maximizeWindow() {
  if (window.pywebview?.api) {
    window.pywebview.api.toggle_maximize_window();
  }
}

export function closeWindow() {
  if (window.pywebview?.api) {
    window.pywebview.api.close_window();
  }
}

// Exponer funciones globalmente
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.closeWindow = closeWindow;
