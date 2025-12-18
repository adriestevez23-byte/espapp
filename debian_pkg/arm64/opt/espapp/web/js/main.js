// js/main.js
// Entrada principal: importa módulos y expone funciones globales para el HTML (onClick)

import * as ui from './ui.js';
import { toggleTheme } from './theme.js';
import { mostrarSeccion } from './navigation.js';
import * as modals from './modals.js';
import * as logs from './logs.js';
import * as wifi from './wifi.js';
import * as esp from './esp32.js';
import * as table from './table.js';
import { escapeHtml } from './utils.js';
import * as windowCtrl from './window.js';
import { sectionsUI } from './sectionsUI.js';
import { sectionManager } from './sections.js';
import { tableRenderer } from './tableRenderer.js';
import { testSections } from './test_sections.js'; // Para pruebas
import { state } from './config.js';

// Exponer funciones globalmente para que los onclick="" del HTML sigan funcionando:
window.toggleMenu = ui.toggleMenu;
window.toggleTheme = toggleTheme;
window.mostrarSeccion = mostrarSeccion;
window.abrirAjustes = modals.abrirAjustes;
window.cerrarAjustes = modals.cerrarAjustes;
window.abrirModal = modals.abrirModal;
window.cerrarModal = modals.cerrarModal;
window.abrirGmail = modals.abrirGmail;

window.ensureLogsUI = logs.ensureLogsUI;
window.abrirLogs = logs.abrirLogs;
window.cerrarLogs = logs.cerrarLogs;
window.showLogs = logs.showLogs;
window.downloadAppLogs = logs.downloadAppLogs;
window.downloadEspLogs = logs.downloadEspLogs;
window.downloadTablaPDF = logs.downloadTablaPDF;

window.escaneaRedes = wifi.escaneaRedes;
window.clickRed = wifi.clickRed;
window.togglePassword = wifi.togglePassword;

window.conectarESP32 = esp.conectarESP32;
window.obtenerDatos = esp.obtenerDatos;
window.iniciarTCP = esp.iniciarTCP;

window.actualizarTabla = table.actualizarTabla;
window.generarHTMLTablaParaPDF = table.generarHTMLTablaParaPDF;
window.confirmarBorrarTabla = table.confirmarBorrarTabla;
window.addMeasurement = table.addMeasurement;

// Exponer funciones de exportación, importación y PDF
window.exportarTabla = table.exportarTabla;
window.descargarPDF = table.descargarPDF;
window.importarTabla = table.importarTabla;

// Exponer gestor de secciones globalmente
window.sectionManager = sectionManager;
window.tableRenderer = tableRenderer;

window.escapeHtml = escapeHtml; // utilidad global (si la necesitas)

document.addEventListener("DOMContentLoaded", async () => {
  // Aseguramos UI mínima
  logs.ensureLogsUI();
  // Inicializar estado de conexión como "Desconectado"
  ui.setConnectionIndicator(false, false);
  // No lanzamos polling automático aquí: se inicia al conectar al ESP32
  // Verificar si ya hay una IP guardada del ESP32
  if (state.ESP32_IP) {
    ui.setConnectionIndicator(true, false);
  }
  // Esperar a cargar secciones desde disco antes de inicializar la UI
  if (window.sectionManager && typeof window.sectionManager.cargarSecciones === 'function') {
    await window.sectionManager.cargarSecciones();
    console.log('[SECTIONS] Secciones cargadas al iniciar la app');
  }
  // Inicializar sistema de secciones SOLO después de cargar
  sectionsUI.inicializar();

  // Atajos globales: ESC para cerrar modales/menús, ENTER para aceptar
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (window.cerrarAjustes) window.cerrarAjustes();
      if (window.cerrarModal) window.cerrarModal();
      if (window.cerrarLogs) window.cerrarLogs();
      // Cerrar gestor de secciones si está abierto
      const modal = document.getElementById('sectionsModal');
      if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    }
    if (e.key === 'Enter') {
      // Si hay algún modal visible, aceptar
      const ajustes = document.getElementById('settingsModal');
      if (ajustes && ajustes.style.display !== 'none') {
        const btn = ajustes.querySelector('button[type="button"], button');
        if (btn) btn.click();
      }
      const modal = document.getElementById('aboutModal');
      if (modal && modal.style.display !== 'none') {
        window.cerrarModal && window.cerrarModal();
      }
      // Gestor de secciones: guardar cambios si está abierto
      const seccionesModal = document.getElementById('sectionsModal');
      if (seccionesModal && seccionesModal.style.display !== 'none') {
        const btnGuardar = seccionesModal.querySelector('.btn-guardar-seccion');
        if (btnGuardar) btnGuardar.click();
      }
    }
  });
});

// Guardar las secciones al cerrar la aplicación/ventana para evitar pérdida de datos
window.addEventListener('beforeunload', () => {
  try {
    if (window.sectionManager && typeof window.sectionManager.guardarSecciones === 'function') {
      window.sectionManager.guardarSecciones();
      console.log('[SECCIONES] guardadas antes de unload');
    }
  } catch (e) {
    console.warn('Error guardando secciones en unload', e);
  }
});

// Guardar secciones antes de cerrar la app
window.onbeforeunload = function() {
  if (window.sectionManager && typeof window.sectionManager.guardarSecciones === 'function') {
    window.sectionManager.guardarSecciones();
    console.log('[SECTIONS] Guardado automático antes de cerrar la app');
  }
};

// Global error handlers to capture unexpected exceptions and unhandled rejections
window.onerror = function(message, source, lineno, colno, error) {
  try {
    console.error('[GLOBAL ERROR]', message, source, lineno, colno, error);
    if (window.addAppLog) window.addAppLog(`[GLOBAL ERROR] ${message} ${source}:${lineno}`);
  } catch (e) { console.error('Error reporting global error', e); }
};

window.addEventListener('unhandledrejection', function(evt) {
  try {
    console.error('[UNHANDLED REJECTION]', evt.reason);
    if (window.addAppLog) window.addAppLog(`[UNHANDLED REJECTION] ${String(evt.reason)}`);
  } catch (e) { console.error('Error reporting unhandled rejection', e); }
});

// Función para copiar código ESP32
window.copiarCodigoESP32 = () => {
  const codeElement = document.getElementById('code-esp32-example');
  const button = document.querySelector('.btn-copy-code');
  
  if (codeElement) {
    const texto = codeElement.innerText;
    navigator.clipboard.writeText(texto).then(() => {
      // Cambiar texto y color del botón
      const originalText = button.innerHTML;
      button.innerHTML = '✓ ¡Copiado!';
      button.classList.add('copied');
      
      // Restaurar después de 2 segundos
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('Error al copiar. Intenta manualmente.');
    });
  }
};
