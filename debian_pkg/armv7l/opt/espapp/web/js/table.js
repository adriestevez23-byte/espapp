// js/table.js
import { state, addMedicion, resetTabla } from './config.js';
import { sectionManager } from './sections.js';
import { tableRenderer } from './tableRenderer.js';

// ===== HELPER PARA ESPERAR PYWEBVIEW =====
async function esperarPywebview(timeout = 10000) {
  const inicio = Date.now();
  while (Date.now() - inicio < timeout) {
    // Esperar a que la API de PyWebView esté expuesta (cualquier método)
    if (window.pywebview && window.pywebview.api) {
      console.log("[PYWEBVIEW] API disponible");
      return true;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  console.log("[PYWEBVIEW] Timeout, API no disponible después de", timeout, "ms");
  return false;
}

// ===== HELPER PARA MODALES =====
function _mostrarModal(titulo, mensaje, esError = false) {
  if (!document.getElementById("confirmModal") && window.ensureLogsUI) window.ensureLogsUI();
  const modal = document.getElementById("confirmModal");
  if (!modal) return;

  const content = modal.querySelector(".modal-content");
  if (content) {
    const h3 = content.querySelector("h3");
    if (h3) h3.textContent = titulo;
  }

  document.getElementById("confirmText").textContent = mensaje;
  const btnYes = document.getElementById("confirmYes");
  const btnNo = document.getElementById("confirmNo");
  
  if (btnYes) btnYes.textContent = "OK";
  if (btnNo) btnNo.style.display = "none";
  
  modal.style.display = "flex";

  if (btnYes) {
    btnYes.onclick = () => {
      modal.style.display = "none";
      if (btnNo) btnNo.style.display = "inline-block";
    };
  }
}

// ===== ACTUALIZAR TABLA EN HTML =====
export function actualizarTabla(hist) {
  const tabla = document.getElementById("tabla");
  if (!tabla) return;

  if (!hist || hist.length === 0) {
    tabla.innerHTML = "<tr><td colspan='3'>Sin datos</td></tr>";
    return;
  }

  tabla.innerHTML = hist.slice(-20).reverse().map(h => {
    const t = typeof h.tiempo === "number" ? h.tiempo.toFixed(3) + " s" : "-";
    const v = typeof h.velocidad === "number" ? h.velocidad.toFixed(2) + " m/s" : "-";
    const cm = typeof h.metros === "number" ? (h.metros * 100).toFixed(1) + " cm" : "-";
    return `<tr><td>${t}</td><td>${v}</td><td>${cm}</td></tr>`;
  }).join("");
}

// ===== GENERAR HTML PARA PDF =====
export function generarHTMLTablaParaPDF(hist) {
  if (!hist || hist.length === 0) return "<p>Sin datos</p>";

  // --- MODIFICACIÓN: incluir día y hora como columnas adicionales ---
  const rows = hist.slice(-100).reverse().map(h => {
    const dia = h.dia ?? "-";
    const hora = h.hora ?? "-";
    const t = typeof h.tiempo === "number" ? h.tiempo.toFixed(3) + " s" : "-";
    const v = typeof h.velocidad === "number" ? h.velocidad.toFixed(2) + " m/s" : "-";
    const cm = typeof h.metros === "number" ? (h.metros * 100).toFixed(1) + " cm" : "-";
    return `<tr><td>${dia}</td><td>${hora}</td><td>${t}</td><td>${v}</td><td>${cm}</td></tr>`;
  }).join("");

  return `<table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-family:monospace;">
    <thead><tr><th>Día</th><th>Hora</th><th>Tiempo</th><th>Velocidad</th><th>Centímetros</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ===== AÑADIR MEDICIÓN =====
export function addMeasurement(m) {
  // Evitar duplicados simples: si la última medición tiene el mismo tiempo, ignorar
  const last = state.tablaHistorial && state.tablaHistorial.length ? state.tablaHistorial[state.tablaHistorial.length - 1] : null;
  if (last && typeof m.tiempo !== 'undefined' && m.tiempo === last.tiempo) {
    if (window.addAppLog) window.addAppLog(`Medición duplicada ignorada t=${m.tiempo}`);
    return;
  }

  // --- MODIFICACIÓN: añadir día y hora a la medición antes de guardarla ---
  try {
    const ahora = new Date();
    m.dia = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
    m.hora = ahora.toTimeString().split(' ')[0]; // HH:MM:SS
  } catch (err) {
    // en caso de error, no bloquear la medición
    if (window.addAppLog) window.addAppLog("No se pudo añadir fecha/hora a la medición: " + String(err));
  }

  // Agregar al estado global (compatibilidad hacia atrás)
  addMedicion(m);
  
  // Agregar a la sección activa si existe
  if (sectionManager.seccionActiva) {
    tableRenderer.agregarDato(m);
  } else {
    // Si no hay sección, actualizar la tabla tradicional
    actualizarTabla(state.tablaHistorial);
  }
}

// ===== BORRAR TABLA CON MODAL =====
export function confirmarBorrarTabla() {
  if (!document.getElementById("confirmModal") && window.ensureLogsUI) window.ensureLogsUI();
  const modal = document.getElementById("confirmModal");
  if (!modal) return;

  document.getElementById("confirmText").textContent = "¿Deseas borrar la tabla de mediciones?";
  modal.style.display = "flex";

  document.getElementById("confirmYes").onclick = () => {
    resetTabla();
    if (sectionManager.seccionActiva) {
      tableRenderer.limpiarDatos();
    } else {
      actualizarTabla([]);
    }
    modal.style.display = "none";
    if (window.showStatus) window.showStatus("Tabla borrada");
    if (window.addAppLog) window.addAppLog("Tabla borrada por usuario");
  };
}

// ===== EXPORTAR TABLA COMO JSON =====
export async function exportarTabla() {
  console.log("[EXPORT] Iniciando exportarTabla");
  if (window.addAppLog) window.addAppLog("Iniciando exportarTabla");
  
  // Obtener datos según si hay sección activa o no
  let data, filename;
  if (sectionManager.seccionActiva) {
    const exportData = tableRenderer.exportarJSON();
    if (!exportData || exportData.datos.length === 0) {
      _mostrarModal("Sin datos", "No hay datos para exportar.", true);
      return;
    }
    data = JSON.stringify(exportData, null, 2);
    filename = `${sectionManager.seccionActiva.nombre}_${new Date().toISOString().split('T')[0]}.json`;
  } else {
    if (!state.tablaHistorial || state.tablaHistorial.length === 0) {
      _mostrarModal("Sin datos", "No hay datos para exportar.", true);
      return;
    }
    data = JSON.stringify(state.tablaHistorial, null, 2);
    filename = `mediciones_${new Date().toISOString().split('T')[0]}.json`;
  }

  console.log("[EXPORT] Esperando a pywebview...");
  
  try {
    // Esperar a que pywebview esté disponible
    const pywebviewReady = await esperarPywebview();
    console.log("[EXPORT] pywebviewReady:", pywebviewReady);
    console.log("[EXPORT] window.pywebview:", typeof window.pywebview);
    console.log("[EXPORT] window.pywebview.api:", typeof window.pywebview?.api);

    if (pywebviewReady && window.pywebview?.api?.save_file) {
      try {
        console.log("[EXPORT] Llamando a save_file (nativo)...");
        const result = await window.pywebview.api.save_file(data, filename);
        console.log("[EXPORT] Resultado (nativo):", result);
        if (result.ok) {
          _mostrarModal("Éxito", `Tabla exportada en:\n${result.path}`);
          if (window.showStatus) window.showStatus(`Tabla exportada en: ${result.path}`);
          if (window.addAppLog) window.addAppLog(`Tabla exportada en: ${result.path}`);
          return;
        } else {
          if (result.msg !== "Cancelado") {
            _mostrarModal("Error", `Error al guardar: ${result.msg}`, true);
          }
          if (window.addAppLog) window.addAppLog(`Exportar cancelado: ${result.msg}`);
          // continuar al fallback
        }
      } catch (e) {
        console.error("[EXPORT] Error en save_file nativo:", e);
        if (window.addAppLog) window.addAppLog("Error en save_file nativo: " + String(e));
        // continuar al fallback
      }
    } else {
      console.log("[EXPORT] pywebview no disponible, proceder con fallback navegador");
      if (window.addAppLog) window.addAppLog("pywebview no disponible para exportar, usando fallback navegador");
    }

    // Fallback: descargar directamente desde el navegador
    console.log("[EXPORT] Usando fallback: descarga desde navegador");
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    _mostrarModal("Éxito", "Tabla exportada (descarga del navegador)");
    if (window.showStatus) window.showStatus("Tabla exportada");
    if (window.addAppLog) window.addAppLog("Tabla exportada (fallback navegador)");
  } catch (e) {
    console.error("[EXPORT] Error:", e);
    console.log("[EXPORT] Usando fallback de navegador");
    
    // Fallback: descargar directamente
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    
    _mostrarModal("Éxito", "Tabla exportada (descarga del navegador)");
    if (window.showStatus) window.showStatus("Tabla exportada");
    if (window.addAppLog) window.addAppLog("Tabla exportada (fallback navegador)");
  }
}

// ===== DESCARGAR PDF =====
export async function descargarPDF() {
  // Verificar si hay datos en la sección activa o en el estado global
  const tienesDatos = sectionManager.seccionActiva ? 
    (sectionManager.seccionActiva.datos && sectionManager.seccionActiva.datos.length > 0) : 
    (state.tablaHistorial && state.tablaHistorial.length > 0);

  if (!tienesDatos) {
    _mostrarModal("Sin datos", "No hay datos para generar PDF.", true);
    return;
  }

  console.log("[PDF] Iniciando descargarPDF");
  if (window.addAppLog) window.addAppLog("Iniciando descargarPDF");

  // Generar HTML según la sección activa o datos globales
  const tablaHTML = sectionManager.seccionActiva ? 
    tableRenderer.generarHTMLPara('pdf') : 
    generarHTMLTablaParaPDF(state.tablaHistorial);

  const seccionNombre = sectionManager.seccionActiva ? 
    sectionManager.seccionActiva.nombre : 
    'Mediciones';

  const htmlContent = `
    <html>
    <head>
      <title>${seccionNombre}</title>
      <style>
        body { font-family: monospace; padding:20px; }
        table { width:100%; border-collapse: collapse; }
        th, td { border:1px solid #000; padding:8px; text-align:center; }
        th { background:#00baff; color:#000; }
      </style>
    </head>
    <body>
      <h3>${seccionNombre}</h3>
      ${tablaHTML}
      <script>window.onload=()=>setTimeout(()=>window.print(),300);</script>
    </body>
    </html>
  `;

  const filename = `${seccionNombre}_${new Date().toISOString().split('T')[0]}.pdf`;

  console.log("[PDF] Esperando a pywebview...");

  try {
    // Esperar a que pywebview esté disponible
    const pywebviewReady = await esperarPywebview();
    console.log("[PDF] pywebviewReady:", pywebviewReady);
    console.log("[PDF] window.pywebview:", typeof window.pywebview);
    console.log("[PDF] window.pywebview.api:", typeof window.pywebview?.api);
    
    // Obtener datos según la sección activa o estado global
    const datosParaPDF = sectionManager.seccionActiva ? 
      sectionManager.seccionActiva.datos : 
      state.tablaHistorial;

    if (pywebviewReady && window.pywebview?.api?.save_pdf) {
      try {
        console.log("[PDF] Llamando a save_pdf (nativo)...");
        if (window.addAppLog) window.addAppLog("Intentando save_pdf nativo");
        const result = await window.pywebview.api.save_pdf(JSON.stringify(datosParaPDF), filename);
        console.log("[PDF] Resultado save_pdf:", result);
        if (result.ok) {
          _mostrarModal("Éxito", `PDF descargado en:\n${result.path}`);
          if (window.showStatus) window.showStatus(`PDF descargado en: ${result.path}`);
          if (window.addAppLog) window.addAppLog(`PDF descargado en: ${result.path}`);
          return;
        } else {
          if (result.msg !== "Cancelado") {
            _mostrarModal("Error", `Error al guardar: ${result.msg}`, true);
          }
          if (window.addAppLog) window.addAppLog(`save_pdf falló: ${result.msg}`);
          // continuar a fallback
        }
      } catch (e) {
        console.error("[PDF] Error en save_pdf nativo:", e);
        if (window.addAppLog) window.addAppLog("Error en save_pdf nativo: " + String(e));
        // continuar al fallback
      }
    } else {
      console.log("[PDF] pywebview no disponible para save_pdf, usando fallback");
      if (window.addAppLog) window.addAppLog("pywebview no disponible para save_pdf, usando fallback");
    }

    // Fallback para navegador: abrir HTML en nueva ventana para imprimir/guardar como PDF
    console.log("[PDF] Fallback: abrir HTML en nueva ventana para imprimir");
    if (window.addAppLog) window.addAppLog("Fallback PDF: abrir HTML para imprimir a PDF");
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(htmlContent);
    w.document.close();
    _mostrarModal("Éxito", "PDF generado (abre en nueva ventana)");
    if (window.showStatus) window.showStatus("PDF generado (abre en nueva ventana)");
  } catch (e) {
    console.error("[PDF] Error en descargarPDF:", e);
    _mostrarModal("Error", `Error al descargar PDF:\n${e.message}`, true);
    if (window.addAppLog) window.addAppLog("Error al descargar PDF: " + e.message);
  }
}

// ===== IMPORTAR TABLA DESDE JSON =====
export async function importarTabla(event) {
  if (window.addAppLog) window.addAppLog("Iniciando importarTabla");
  // Si se llama desde el evento del input file, usar el archivo seleccionado
  if (event?.target?.files?.length > 0) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      if (window.addAppLog) window.addAppLog(`Archivo seleccionado en input: ${file.name}`);
      _procesar_json_import(e.target.result);
    };
    reader.onerror = err => {
      if (window.addAppLog) window.addAppLog("Error leyendo archivo local: " + String(err));
      alert("Error leyendo archivo: " + err);
    };
    reader.readAsText(file);
    event.target.value = "";
    return;
  }

  // Si no, intentar abrir con diálogo nativo
  try {
    const pywebviewReady = await esperarPywebview();
    if (pywebviewReady && window.pywebview?.api?.open_file) {
      if (window.addAppLog) window.addAppLog("Usando open_file nativo para importar");
      const result = await window.pywebview.api.open_file();
      if (result.ok) {
        if (window.addAppLog) window.addAppLog(`Archivo importado desde: ${result.path}`);
        _procesar_json_import(result.content);
      } else {
        if (result.msg && result.msg !== "No se seleccionó archivo") {
          if (window.addAppLog) window.addAppLog(`Importar cancelado: ${result.msg}`);
          _mostrarModal("Error", `Error al importar: ${result.msg}`, true);
        }
      }
      return;
    }
  } catch (e) {
    console.error("[IMPORT] Error al usar open_file nativo:", e);
    if (window.addAppLog) window.addAppLog("Error al usar open_file nativo: " + String(e));
  }

  // Fallback: usar input file normal
  if (document.getElementById("file")) {
    if (window.addAppLog) window.addAppLog("Mostrando input file (fallback)");
    document.getElementById("file").click();
    return;
  }

  alert("No hay forma de importar archivos en este entorno");
}

function _procesar_json_import(content) {
  try {
    const json = JSON.parse(content);
    
    // Detectar si es una sección completa o solo un array de datos
    if (json.seccion && json.columnas && Array.isArray(json.datos)) {
      // Es una sección exportada
      if (sectionManager.seccionActiva) {
        tableRenderer.importarJSON(JSON.stringify(json));
        if (window.addAppLog) window.addAppLog(`Tabla importada: ${json.datos.length} registros`);
        if (window.showStatus) window.showStatus(`Tabla importada: ${json.datos.length} registros`);
      }
    } else if (Array.isArray(json)) {
      // Es un array de mediciones directas (compatibilidad hacia atrás)
      resetTabla();
      json.forEach(m => addMedicion(m));
      if (sectionManager.seccionActiva) {
        json.forEach(m => sectionManager.agregarDato(sectionManager.seccionActiva.id, m));
        tableRenderer.renderizarTablaActiva();
      } else {
        actualizarTabla(state.tablaHistorial);
      }
      if (window.addAppLog) window.addAppLog(`Tabla importada: ${json.length} registros`);
      if (window.showStatus) window.showStatus(`Tabla importada: ${json.length} mediciones`);
    } else {
      throw new Error("Formato de archivo inválido");
    }
  } catch (err) {
    alert("Error al importar la tabla: " + err.message);
    if (window.addAppLog) window.addAppLog("Error al importar tabla: " + err.message);
  }
}

/* ===== CONFIRMAR DISTANCIA =====*/
export function confirmarDistancia() {
  const input = document.getElementById("distancia");
  if (!input || !input.value) {
    if (window.showStatus) window.showStatus("Por favor introduce una distancia");
    return;
  }

  const distancia = parseFloat(input.value);
  if (isNaN(distancia) || distancia <= 0) {
    if (window.showStatus) window.showStatus("La distancia debe ser un número positivo");
    return;
  }

  state.distanciaEntreSensores = distancia;
  if (window.addAppLog) window.addAppLog(`Distancia entre sensores: ${distancia} cm`);
  
  // Mostrar modal bonito de confirmación
  _mostrarModalConfirmacion(`Distancia confirmada: ${distancia} cm`);
}

function _mostrarModalConfirmacion(mensaje) {
  if (!document.getElementById("confirmModal") && window.ensureLogsUI) window.ensureLogsUI();
  const modal = document.getElementById("confirmModal");
  if (!modal) return;

  document.getElementById("confirmText").textContent = mensaje;
  // Cambiar botones: solo mostrar OK (o cambiar botón No a OK)
  const btnYes = document.getElementById("confirmYes");
  const btnNo = document.getElementById("confirmNo");
  
  if (btnYes) btnYes.textContent = "OK";
  if (btnNo) btnNo.style.display = "none";
  
  modal.style.display = "flex";

  if (btnYes) {
    btnYes.onclick = () => {
      modal.style.display = "none";
      if (btnNo) btnNo.style.display = "inline-block";
    };
  }
}

/* ===== EXPONER FUNCIONES GLOBALMENTE ===== */
window.actualizarTabla = actualizarTabla;
window.generarHTMLTablaParaPDF = generarHTMLTablaParaPDF;
window.confirmarBorrarTabla = confirmarBorrarTabla;
window.confirmarDistancia = confirmarDistancia;
window.addMeasurement = addMeasurement;
window.exportarTabla = exportarTabla;
window.descargarPDF = descargarPDF;
window.importar = importarTabla;
// Exponer también con el nombre que usa el input 'onchange' en index.html
window.importarTabla = importarTabla;
