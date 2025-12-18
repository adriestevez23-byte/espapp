// js/sectionsUI.js
// Interfaz de usuario para gestionar secciones

import { sectionManager, tiposColumnasDefecto, operadoresDisponibles } from './sections.js';
import { state, addLog } from './config.js';

export const sectionsUI = {
  modalActual: null,

  // ===== RENDERIZAR INTERFAZ =====
  inicializar() {
    this.crearMenuSecciones();
    this.crearModalSecciones();
    sectionManager.cargarSecciones();
    
    // NOTA: Ya no se crea automáticamente sección 'Mediciones'
    // El usuario debe crear sus propias secciones desde el gestor (botón 📋)
  },

  crearMenuSecciones() {
    // Crear botón en el header
    const header = document.querySelector('.header-right');
    if (header) {
      const btnSecciones = document.createElement('button');
      btnSecciones.id = 'sections-btn';
      btnSecciones.title = 'Gestionar secciones';
      btnSecciones.textContent = '📋';
      btnSecciones.className = 'header-icon-btn';
      btnSecciones.onclick = () => this.abrirGestorSecciones();
      
      // Insertar ANTES del botón de settings (ajustes)
      const settingsBtn = header.querySelector('#settings-btn');
      if (settingsBtn) {
        // Insertar justo antes de settings
        settingsBtn.parentNode.insertBefore(btnSecciones, settingsBtn);
      } else {
        // Fallback: insertar después del conn indicator
        const connIndicator = header.querySelector('.conn');
        if (connIndicator) {
          connIndicator.parentNode.insertBefore(btnSecciones, connIndicator.nextSibling);
        } else {
          header.insertBefore(btnSecciones, header.firstChild);
        }
      }
    }
  },

  crearModalSecciones() {
    const modal = document.createElement('div');
    modal.id = 'sectionsModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content sections-modal-content">
        <button class="close-btn" onclick="closeModal()">✖</button>
        <h3>📋 Gestor de Secciones</h3>
        
        <div class="sections-new-btn-container">
          <button class="sections-new-btn" onclick="crearNuevaSeccion()">+ Crear nueva sección</button>
        </div>

        <div id="seccionesList" class="sections-list">
          <!-- Se llena dinámicamente -->
        </div>

        <!-- Modal de edición de sección -->
        <div id="editSeccionModal" class="edit-seccion-modal" style="display: none;">
          <h4>✏️ Editar Sección</h4>
          <input type="text" id="seccionNombre" placeholder="Nombre de la sección" class="section-name-input">
          <div style="margin-top:8px;">
            <label style="font-size:13px;"><input type="checkbox" id="seccionMostrarDistancia" style="margin-right:6px;"> Mostrar configurador de distancia en la tabla</label>
          </div>
          
          <h5>Columnas</h5>
          <div id="columnasContainer" class="columnas-container">
            <!-- Se llena dinámicamente -->
          </div>

          <button class="btn-agregar-columna" onclick="agregarNuevaColumna()">+ Agregar columna</button>
          <button class="btn-guardar-seccion" onclick="guardarCambiosSecciones()">✓ Guardar cambios</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  actualizarMenuSecciones() {
    const lista = document.getElementById('seccionesList');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (sectionManager.secciones.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'sections-empty';
      emptyMsg.textContent = 'No hay secciones. Crea una nueva para comenzar.';
      lista.appendChild(emptyMsg);
      return;
    }
    
    sectionManager.secciones.forEach(sec => {
      const div = document.createElement('div');
      const isActive = sectionManager.seccionActiva?.id === sec.id;
      div.className = 'section-item ' + (isActive ? 'active' : '');
      
      div.innerHTML = `
        <div class="section-item-content">
          <div class="section-info" onclick="establecerSeccionActiva('${sec.id}')">
            <div class="section-name">${sec.nombre}</div>
            <div class="section-stats">${sec.datos.length} registros • ${sec.columnas.length} columnas</div>
          </div>
          <div class="section-actions">
            <button class="section-btn edit-btn" title="Editar sección" onclick="editarSeccion('${sec.id}')">✏️</button>
            <button class="section-btn delete-btn" title="Eliminar sección" onclick="eliminarSeccion('${sec.id}')">🗑️</button>
          </div>
        </div>
      `;
      lista.appendChild(div);
    });
  },

  abrirGestorSecciones() {
    const modal = document.getElementById('sectionsModal');
    if (modal) {
      modal.style.display = 'flex';
      this.actualizarMenuSecciones();
    }
  },

  cerrarGestorSecciones() {
    const modal = document.getElementById('sectionsModal');
    if (modal) {
      modal.style.display = 'none';
      document.getElementById('editSeccionModal').style.display = 'none';
    }
  },

  editarSeccion(seccionId) {
    const seccion = sectionManager.obtenerSeccion(seccionId);
    if (!seccion) return;

    document.getElementById('editSeccionModal').style.display = 'block';
    document.getElementById('seccionNombre').value = seccion.nombre;
    // Restaurar estado del checkbox de mostrar configurador de distancia
    const chk = document.getElementById('seccionMostrarDistancia');
    if (chk) chk.checked = !!seccion.mostrarDistancia;
    window.seccionEditandoId = seccionId;

    this.renderizarColumnasEditor(seccion);
  },

  renderizarColumnasEditor(seccion) {
    const container = document.getElementById('columnasContainer');
    container.innerHTML = '';

    seccion.columnas.forEach((col, idx) => {
      const div = document.createElement('div');
      div.className = 'column-editor-item';
      div.dataset.colId = col.id;
      
      let tipoHTML = '';
      if (col.tipo === 'esp32') {
        tipoHTML = `
          <label>Propiedad del ESP32:</label>
            <input type="text" class="col_propiedad col_propiedad_${col.id}" value="${col.propiedad || 'dato'}" 
                 placeholder="ej: velocidad, temperatura">
        `;
      } else if (col.tipo === 'calculado') {
        // Mostrar opciones para columnas calculadas
        const columnasDisponibles = seccion.columnas.filter(c => c.id !== col.id && c.tipo !== 'calculado');
        tipoHTML = `
          <div class="calculado-container">
            <div class="calc-row">
              <div class="calc-field">
                <label>Columna 1:</label>
                <select class="col_col1 col_col1_${col.id}">
                  <option value="">-- Seleccionar --</option>
                  ${columnasDisponibles.map(c => `
                    <option value="${c.id}" ${col.col1 === c.id ? 'selected' : ''}>${c.nombre}</option>
                  `).join('')}
                </select>
              </div>
              <div class="calc-field">
                <label>Operación:</label>
                <select class="col_operacion col_operacion_${col.id}">
                  ${operadoresDisponibles.map(o => `
                    <option value="${o.simbolo}" ${col.operacion === o.simbolo ? 'selected' : ''}>${o.nombre}</option>
                  `).join('')}
                </select>
              </div>
              <div class="calc-field">
                <label>Columna 2:</label>
                <select class="col_col2 col_col2_${col.id}">
                  <option value="">-- Seleccionar --</option>
                  ${columnasDisponibles.map(c => `
                    <option value="${c.id}" ${col.col2 === c.id ? 'selected' : ''}>${c.nombre}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            <div class="calc-formula">
              <label>Fórmula personalizada (opcional):</label>
              <input type="text" class="col_formula col_formula_${col.id}" value="${col.formula || ''}" 
                     placeholder="ej: col_1 * col_2 + 10">
              <small>Si dejas esto vacío, se usará: Columna1 Operación Columna2</small>
            </div>
          </div>
        `;
      } else if (col.tipo === 'defecto') {
        tipoHTML = `
          <label>Tipo de Fecha/Hora:</label>
          <select class="col_subtipo col_subtipo_${col.id}">
            <option value="fecha" ${col.subtipo === 'fecha' ? 'selected' : ''}>Fecha (DD/MM/YYYY)</option>
            <option value="hora" ${col.subtipo === 'hora' ? 'selected' : ''}>Hora (HH:MM)</option>
            <option value="fecha-hora" ${col.subtipo === 'fecha-hora' ? 'selected' : ''}>Fecha y Hora</option>
          </select>
          <small>Se capturará automáticamente cuando se registre un dato</small>
        `;
      }

      div.innerHTML = `
        <div class="column-editor-header">
          <div class="column-editor-fields">
            <div class="field-group">
              <label>Nombre:</label>
              <input type="text" class="col_nombre col_nombre_${col.id}" value="${col.nombre}">
            </div>
            <div class="field-group">
              <label>Tipo:</label>
              <select class="col_tipo col_tipo_${col.id}" onchange="actualizarTipoColumna('${col.id}', this.value)">
                <option value="esp32" ${col.tipo === 'esp32' ? 'selected' : ''}>Dato del ESP32</option>
                <option value="calculado" ${col.tipo === 'calculado' ? 'selected' : ''}>Columna calculada</option>
                <option value="defecto" ${col.tipo === 'defecto' ? 'selected' : ''}>Fecha/Hora automática</option>
              </select>
            </div>
            <button class="column-delete-btn" onclick="eliminarColumnaUI('${col.id}')">🗑️</button>
          </div>
        </div>
        <div class="column-editor-extra">
          ${tipoHTML}
        </div>
      `;
      container.appendChild(div);
    });
  },

  actualizarTipoColumna(colId, nuevoTipo) {
    // Se ejecuta desde la UI
    const seccionId = window.seccionEditandoId;
    const seccion = sectionManager.obtenerSeccion(seccionId);
    if (!seccion) return;
    
    const col = seccion.columnas.find(c => c.id === colId);
    if (col) {
      // ANTES de cambiar tipo, guardar el nombre actual del DOM si existe
      const itemDiv = document.querySelector(`.column-editor-item[data-col-id="${colId}"]`);
      if (itemDiv) {
        const nombreInput = itemDiv.querySelector('.col_nombre');
        if (nombreInput && nombreInput.value && nombreInput.value !== 'Nueva columna') {
          col.nombre = nombreInput.value;
        }
      }
      
      col.tipo = nuevoTipo;
      // Re-renderizar para mostrar los campos específicos del tipo (pero con nombre preservado)
      this.renderizarColumnasEditor(seccion);
    }
  },

  guardarCambiosSecciones() {
    const seccionId = window.seccionEditandoId;
    const seccion = sectionManager.obtenerSeccion(seccionId);
    if (!seccion) return;

    // Registrar IDs/nombres antes de guardar para detectar duplicados/creaciones
    const before = seccion.columnas.map(c => ({ id: c.id, nombre: c.nombre, tipo: c.tipo }));
    console.debug('[SECTIONS UI] Antes de guardar columnas:', JSON.parse(JSON.stringify(before)));

    // Actualizar nombre
    const nombreInput = document.getElementById('seccionNombre');
    if (nombreInput) seccion.nombre = nombreInput.value;

    // Actualizar columnas leyendo los valores desde cada editor DOM (más robusto)
    try {
      const container = document.getElementById('columnasContainer');
      const items = container ? Array.from(container.querySelectorAll('.column-editor-item')) : [];
      items.forEach(item => {
        const colId = item.dataset.colId;
        if (!colId) return;
        const col = seccion.columnas.find(c => c.id === colId);
        if (!col) return;

        const nombre = item.querySelector('.col_nombre')?.value || col.nombre;
        const tipo = item.querySelector('.col_tipo')?.value || col.tipo;
        col.nombre = nombre;
        col.tipo = tipo;

        if (tipo === 'esp32') {
          col.propiedad = item.querySelector('.col_propiedad')?.value || col.propiedad || 'dato';
          delete col.formula; delete col.col1; delete col.col2; delete col.operacion; delete col.subtipo;
        } else if (tipo === 'calculado') {
          const formulaInput = item.querySelector('.col_formula')?.value || '';
          const col1 = item.querySelector('.col_col1')?.value || '';
          const col2 = item.querySelector('.col_col2')?.value || '';
          const operacion = item.querySelector('.col_operacion')?.value || '+';

          if (formulaInput) {
            col.formula = formulaInput;
          } else if (col1 && col2) {
            col.formula = `${col1} ${operacion} ${col2}`;
          } else {
            col.formula = '';
          }

          col.col1 = col1; col.col2 = col2; col.operacion = operacion;
          delete col.propiedad; delete col.subtipo;
        } else if (tipo === 'defecto') {
          col.subtipo = item.querySelector('.col_subtipo')?.value || 'fecha-hora';
          delete col.propiedad; delete col.formula; delete col.col1; delete col.col2; delete col.operacion;
        }
      });
    } catch (e) {
      console.warn('[SECTIONS UI] Error leyendo valores del editor de columnas:', e);
    }

    // Normalizar y deduplicar columnas por `id` antes de persistir
    try {
      const map = {};
      seccion.columnas.forEach(c => {
        // Asegurar que exista un id estable
        if (!c.id) c.id = `col_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        // Si ya existe una columna con este id, fusionar propiedades (priorizar las actuales)
        if (map[c.id]) {
          map[c.id] = Object.assign({}, map[c.id], c);
        } else {
          map[c.id] = c;
        }
      });
      const normalized = Object.keys(map).map(k => map[k]);
      if (normalized.length !== seccion.columnas.length) {
        console.warn('[SECTIONS UI] Se detectaron columnas duplicadas; se han fusionado antes de guardar. Antes:', seccion.columnas.length, 'Después:', normalized.length);
      }
      seccion.columnas = normalized;
    } catch (e) {
      console.warn('[SECTIONS UI] Error normalizando columnas antes de guardar:', e);
    }

    // Guardar opción de mostrar configurador de distancia por sección
    const mostrar = document.getElementById('seccionMostrarDistancia')?.checked;
    seccion.mostrarDistancia = !!mostrar;
    // Depuración: mostrar en consola y en log local el objeto sección antes de guardar
    console.debug('[SECCIONES] Guardando sección:', seccion);
    addLog('Guardando sección: ' + seccion.nombre + ' (' + seccion.columnas.length + ' columnas)');
    sectionManager.guardarSecciones();
    // Forzar flush a localStorage y mostrar estado posterior
    try {
      const afterRaw = localStorage.getItem('secciones');
      const parsed = JSON.parse(afterRaw || '[]');
      const sAfter = parsed.find(s => s.id === seccionId) || null;
      const after = sAfter ? sAfter.columnas.map(c => ({ id: c.id, nombre: c.nombre, tipo: c.tipo })) : [];
      console.debug('[SECTIONS UI] Después de guardar columnas:', JSON.parse(JSON.stringify(after)));
      // Si detectamos que alguna columna nueva fue creada inesperadamente, loggear advertencia
      const newCols = after.filter(a => !before.some(b => b.id === a.id));
      if (newCols.length > 0) {
        console.warn('[SECTIONS UI] Columnas nuevas detectadas tras guardar:', newCols);
      }
    } catch (e) {
      console.warn('[SECTIONS UI] Error comprobando localStorage tras guardar:', e);
    }
    this.actualizarMenuSecciones();
    // Actualizar enlace del sidebar si existe
    const link = document.getElementById(`link-seccion-${seccionId}`);
    if (link) link.textContent = `📊 ${seccion.nombre}`;
    document.getElementById('editSeccionModal').style.display = 'none';
    addLog('Sección actualizada: ' + seccion.nombre);
  },

  agregarSeccionAlSidebar(seccion) {
    const nav = document.querySelector('aside.sidebar nav');
    if (!nav) return;

    // Crear enlace de navegación para la sección
    const link = document.createElement('a');
    link.id = `link-seccion-${seccion.id}`;
    link.href = '#';
    link.className = 'seccion-nav-link';
    link.textContent = `📊 ${seccion.nombre}`;
    link.onclick = (e) => {
      e.preventDefault();
      this.mostrarSeccionPersonalizada(seccion.id);
    };

    // Insertar antes de los links de utilidad (Enviar correo, Acerca)
    const enlaceCorreo = nav.querySelector('a[onclick*="abrirGmail"]');
    if (enlaceCorreo) {
      enlaceCorreo.parentNode.insertBefore(link, enlaceCorreo);
    } else {
      nav.appendChild(link);
    }
  },

  mostrarSeccionPersonalizada(seccionId) {
    const seccion = sectionManager.obtenerSeccion(seccionId);
    if (!seccion) return;

    // Establecer como activa
    sectionManager.establecerSeccionActiva(seccionId);

    // Ocultar todas las secciones
    document.querySelectorAll('section.section').forEach(s => {
      s.classList.remove('active');
    });

    // Mostrar o crear la sección
    let seccionDiv = document.getElementById(`seccion-${seccionId}`);
    
    if (!seccionDiv) {
      // Crear la sección si no existe
      seccionDiv = document.createElement('section');
      seccionDiv.id = `seccion-${seccionId}`;
      seccionDiv.className = 'section';
      // Mostrar configurador de distancia sólo si la sección tiene activada la opción
      const distanciaHTML = seccion.mostrarDistancia ? `
          <div class="input-row distancia-wrapper">
            <fieldset class="distancia-fieldset">
              <legend><strong>⚙️ Configurar Distancia entre Sensores</strong></legend>
              <div class="distancia-controls">
                <div class="distancia-control-item">
                  <label for="distancia-valor-${seccionId}">Valor:</label>
                  <input id="distancia-valor-${seccionId}" type="number" step="0.01" min="0.01" placeholder="100" class="distancia-input" />
                </div>
                <div class="distancia-control-item">
                  <label for="distancia-unidad-${seccionId}">Unidad:</label>
                  <select id="distancia-unidad-${seccionId}" class="distancia-select">
                    <option value="cm" selected>Centímetros (cm)</option>
                    <option value="m">Metros (m)</option>
                    <option value="mm">Milímetros (mm)</option>
                    <option value="in">Pulgadas (in)</option>
                  </select>
                </div>
                <button class="btn-guardar-distancia" onclick="confirmarDistanciaSeccion('${seccionId}')">✓ Guardar</button>
              </div>
              <div id="tabla-distancia-${seccionId}" class="tabla-distancia"></div>
            </fieldset>
          </div>
      ` : '';

      seccionDiv.innerHTML = `
        <div class="container">
          <h2>${seccion.nombre}</h2>

          <h3 style="margin-top:10px;">Administrar registros</h3>
            <div class="button-row">
            <button class="danger" title="Borrar toda la tabla" onclick="confirmarBorrarSeccion('${seccionId}')">🗑 Borrar</button>
            <button title="Exportar tabla como JSON" onclick="exportarSeccion('${seccionId}')">💾 Exportar</button>
            <label class="importar-btn button" title="Importar datos desde JSON">
              📁 Importar
              <input type="file" class="file-import-${seccionId}" style="display:none;" onchange="importarSeccion(event, '${seccionId}')" />
            </label>
            <button title="Descargar tabla en PDF" onclick="descargarSeccionPDF('${seccionId}')">📄 Descargar PDF</button>
          </div>

          ${distanciaHTML}

          <table>
            <thead id="thead-${seccionId}">
              <tr>
                ${seccion.columnas.map(col => `<th>${col.nombre}</th>`).join('')}
              </tr>
            </thead>
            <tbody id="tabla-${seccionId}">
              <tr><td colspan="${seccion.columnas.length}">Sin datos</td></tr>
            </tbody>
          </table>
        </div>
      `;
      
      // Insertar la nueva sección antes del footer para que el footer quede siempre abajo
      const mainEl = document.querySelector('main');
      const footer = mainEl.querySelector('.footer');
      if (footer) mainEl.insertBefore(seccionDiv, footer);
      else mainEl.appendChild(seccionDiv);

      // Si la sección tiene configurador de distancia activo y un valor guardado, restaurarlo en la UI
        if (seccion.mostrarDistancia && seccion.distancia) {
        const valorInput = document.getElementById(`distancia-valor-${seccionId}`);
        const unidadSel = document.getElementById(`distancia-unidad-${seccionId}`);
        if (valorInput) valorInput.value = seccion.distancia.valor;
        if (unidadSel) unidadSel.value = seccion.distancia.unidad;
      }
    }

    seccionDiv.classList.add('active');
    
    // Renderizar tabla
    tableRenderer.renderizarTablaPersonalizada(seccionId);

    // Actualizar links del sidebar
    document.querySelectorAll('aside.sidebar nav a').forEach(a => {
      a.classList.remove('active');
    });
    document.getElementById(`link-seccion-${seccionId}`)?.classList.add('active');
  }
};

// ===== FUNCIONES GLOBALES PARA LA UI =====
window.abrirGestorSecciones = () => sectionsUI.abrirGestorSecciones();
window.cerrarGestorSecciones = () => sectionsUI.cerrarGestorSecciones();
window.crearNuevaSeccion = () => {
  // Mostrar modal personalizado elegante para crear sección
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop-crear-seccion';
  backdrop.id = 'modal-crear-seccion-backdrop';
  
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-crear-seccion';
  modalDiv.innerHTML = `
    <div class="modal-crear-seccion-content">
      <h3>📝 Nueva Sección</h3>
      <p>Ingresa un nombre descriptivo para tu nueva sección</p>
      <input type="text" id="input-seccion-nombre" placeholder="Ej: Temperatura, Humedad, Velocidad..." class="input-crear-seccion" />
      <div class="ejemplo-nombres">📋 Ejemplos: Temperatura • Humedad • Velocidad • Presión • Luz</div>
      <div class="modal-crear-seccion-buttons">
        <button class="btn-cancelar-seccion" onclick="document.getElementById('modal-crear-seccion-backdrop')?.remove()">Cancelar</button>
        <button class="btn-aceptar-seccion" onclick="confirmarCrearSeccion()">Crear Sección</button>
      </div>
    </div>
  `;
  
  backdrop.appendChild(modalDiv);
  document.body.appendChild(backdrop);
  
  // Focus en input y permitir Enter
  const input = document.getElementById('input-seccion-nombre');
  input?.focus();
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmarCrearSeccion();
    if (e.key === 'Escape') document.getElementById('modal-crear-seccion-backdrop')?.remove();
  });
};

window.confirmarCrearSeccion = () => {
  const input = document.getElementById('input-seccion-nombre');
  const nombre = input?.value?.trim();
  
  if (!nombre) {
    input?.focus();
    return;
  }
  
  const seccion = sectionManager.crearSeccion(nombre);
  sectionsUI.agregarSeccionAlSidebar(seccion);
  sectionsUI.actualizarMenuSecciones();
  addLog('Sección creada: ' + nombre);
  // Cerrar el modal
  const backdrop = document.getElementById('modal-crear-seccion-backdrop');
  if (backdrop) backdrop.remove();
};
window.editarSeccion = (id) => sectionsUI.editarSeccion(id);
window.eliminarSeccion = (id) => {
  // Mostrar modal de confirmación estilizado
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop-confirmar';
  backdrop.id = `modal-confirmar-backdrop-${id}`;
  
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-confirmar-content';
  modalDiv.innerHTML = `
    <div class="confirmar-dialog">
      <h3>⚠️ Eliminar Sección</h3>
      <p>¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer.</p>
      <div class="confirmar-buttons">
        <button class="btn-cancelar-confirmar" onclick="document.getElementById('modal-confirmar-backdrop-${id}')?.remove()">Cancelar</button>
        <button class="btn-aceptar-confirmar" onclick="confirmarEliminarSeccion('${id}')">Eliminar</button>
      </div>
    </div>
  `;
  
  backdrop.appendChild(modalDiv);
  document.body.appendChild(backdrop);
};

window.confirmarEliminarSeccion = (id) => {
  const sec = sectionManager.obtenerSeccion(id);
  sectionManager.eliminarSeccion(id);
  
  // Eliminar del sidebar
  const linkSidebar = document.getElementById(`link-seccion-${id}`);
  if (linkSidebar) linkSidebar.remove();
  
  // Eliminar la sección del DOM
  const seccionDiv = document.getElementById(`seccion-${id}`);
  if (seccionDiv) seccionDiv.remove();
  
  sectionsUI.actualizarMenuSecciones();
  // No crear sección por defecto automáticamente; dejar que el usuario gestione sus secciones
  addLog('Sección eliminada');
  
  // Cerrar modal
  document.getElementById(`modal-confirmar-backdrop-${id}`)?.remove();
};
window.establecerSeccionActiva = (id) => {
  sectionManager.establecerSeccionActiva(id);
  sectionsUI.actualizarMenuSecciones();
};
window.agregarNuevaColumna = () => {
  const seccionId = window.seccionEditandoId;
  const seccion = sectionManager.obtenerSeccion(seccionId);
  if (!seccion) return;
  
  // Guardar valores de todas las columnas existentes leyendo del DOM (más robusto)
  try {
    const container = document.getElementById('columnasContainer');
    const items = container ? Array.from(container.querySelectorAll('.column-editor-item')) : [];
    items.forEach(item => {
      const cid = item.dataset.colId;
      if (!cid) return;
      const col = seccion.columnas.find(c => c.id === cid);
      if (!col) return;
      const nombre = item.querySelector('.col_nombre')?.value;
      const tipo = item.querySelector('.col_tipo')?.value;
      if (nombre) col.nombre = nombre;
      if (tipo) col.tipo = tipo;

      if (tipo === 'esp32') {
        const prop = item.querySelector('.col_propiedad')?.value;
        if (prop) col.propiedad = prop;
        delete col.formula; delete col.col1; delete col.col2; delete col.operacion; delete col.subtipo;
      } else if (tipo === 'calculado') {
        const formulaInput = item.querySelector('.col_formula')?.value || '';
        const col1 = item.querySelector('.col_col1')?.value || '';
        const col2 = item.querySelector('.col_col2')?.value || '';
        const operacion = item.querySelector('.col_operacion')?.value || '+';
        if (formulaInput) col.formula = formulaInput;
        if (col1) col.col1 = col1;
        if (col2) col.col2 = col2;
        if (operacion) col.operacion = operacion;
        if (!col.formula && col1 && col2) col.formula = `${col1} ${operacion} ${col2}`;
        delete col.propiedad; delete col.subtipo;
      } else if (tipo === 'defecto') {
        const subtipo = item.querySelector('.col_subtipo')?.value || 'fecha';
        col.subtipo = subtipo;
        delete col.propiedad; delete col.formula; delete col.col1; delete col.col2; delete col.operacion;
      }
    });
  } catch (e) {
    console.warn('[SECTIONS UI] Error guardando estado previo al agregar columna:', e);
  }
  
  // Guardar los cambios previos a agregar la nueva
  sectionManager.guardarSecciones();
  
  // Ahora agregar la nueva columna
  const nueva = sectionManager.agregarColumna(seccionId, { nombre: 'Nueva columna', tipo: 'esp32', propiedad: 'dato' });
  // Asegurar persistencia y re-render
  sectionManager.guardarSecciones();
  console.debug('[SECTIONS UI] Nueva columna añadida:', nueva);
  const seccionActualizada = sectionManager.obtenerSeccion(seccionId);
  sectionsUI.renderizarColumnasEditor(seccionActualizada);
};
window.eliminarColumnaUI = (colId) => {
  const seccionId = window.seccionEditandoId;
  const seccion = sectionManager.obtenerSeccion(seccionId);
  if (!seccion) return;

  // Guardar el estado actual de TODOS los inputs del editor antes de eliminar (leer desde DOM)
  try {
    const container = document.getElementById('columnasContainer');
    const items = container ? Array.from(container.querySelectorAll('.column-editor-item')) : [];
    items.forEach(item => {
      const cid = item.dataset.colId;
      if (!cid) return;
      const col = seccion.columnas.find(c => c.id === cid);
      if (!col) return;
      const nombre = item.querySelector('.col_nombre')?.value;
      const tipo = item.querySelector('.col_tipo')?.value;
      if (nombre) col.nombre = nombre;
      if (tipo) col.tipo = tipo;

      if (tipo === 'esp32') {
        const prop = item.querySelector('.col_propiedad')?.value;
        if (prop) col.propiedad = prop;
        delete col.formula; delete col.col1; delete col.col2; delete col.operacion; delete col.subtipo;
      } else if (tipo === 'calculado') {
        const formulaInput = item.querySelector('.col_formula')?.value || '';
        const col1 = item.querySelector('.col_col1')?.value || '';
        const col2 = item.querySelector('.col_col2')?.value || '';
        const operacion = item.querySelector('.col_operacion')?.value || '+';

        if (formulaInput) col.formula = formulaInput;
        col.col1 = col1; col.col2 = col2; col.operacion = operacion;
        if (!col.formula && col1 && col2) col.formula = `${col1} ${operacion} ${col2}`;
        delete col.propiedad; delete col.subtipo;
      } else if (tipo === 'defecto') {
        const subtipo = item.querySelector('.col_subtipo')?.value || 'fecha';
        col.subtipo = subtipo;
        delete col.propiedad; delete col.formula; delete col.col1; delete col.col2; delete col.operacion;
      }
    });
  } catch (e) {
    console.warn('[SECTIONS UI] Error guardando estado antes de eliminar columna:', e);
  }

  // Persistir cambios antes de eliminar
  sectionManager.guardarSecciones();

  // Ahora eliminar la columna y re-renderizar el editor
  sectionManager.eliminarColumna(seccionId, colId);
  // Forzar persistencia y re-render
  sectionManager.guardarSecciones();
  console.debug('[SECTIONS UI] Columna eliminada:', colId);
  const seccionAfter = sectionManager.obtenerSeccion(seccionId);
  sectionsUI.renderizarColumnasEditor(seccionAfter);
};
window.guardarCambiosSecciones = () => sectionsUI.guardarCambiosSecciones();
window.actualizarTipoColumna = (colId, nuevoTipo) => sectionsUI.actualizarTipoColumna(colId, nuevoTipo);
window.closeModal = () => sectionsUI.cerrarGestorSecciones();

// Funciones para gestionar secciones personalizadas
window.confirmarBorrarSeccion = (seccionId) => {
  // Mostrar modal de confirmación estilizado
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop-confirmar';
  backdrop.id = `modal-borrar-datos-backdrop-${seccionId}`;
  
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-confirmar-content';
  modalDiv.innerHTML = `
    <div class="confirmar-dialog">
      <h3>🗑️ Borrar Todos los Datos</h3>
      <p>¿Deseas borrar todos los registros de esta sección? Esta acción no se puede deshacer.</p>
      <div class="confirmar-buttons">
        <button class="btn-cancelar-confirmar" onclick="document.getElementById('modal-borrar-datos-backdrop-${seccionId}')?.remove()">Cancelar</button>
        <button class="btn-aceptar-confirmar" onclick="borrarDatosSeccion('${seccionId}')">Borrar Datos</button>
      </div>
    </div>
  `;
  
  backdrop.appendChild(modalDiv);
  document.body.appendChild(backdrop);
};

window.borrarDatosSeccion = (seccionId) => {
  const seccion = sectionManager.obtenerSeccion(seccionId);
  if (seccion) {
    if (seccion.datos.length === 0) {
      addLog('⚠️ No hay datos para borrar en: ' + seccion.nombre);
    } else {
      seccion.datos = [];
      sectionManager.guardarSecciones();
      tableRenderer.renderizarTablaPersonalizada(seccionId);
      addLog('✓ Datos borrados: ' + seccion.nombre);
    }
  }
  document.getElementById(`modal-borrar-datos-backdrop-${seccionId}`)?.remove();
};

window.exportarSeccion = (seccionId) => {
  const seccion = sectionManager.obtenerSeccion(seccionId);
  if (!seccion) return;
  
  if (seccion.datos.length === 0) {
    addLog('⚠️ No hay datos para exportar en: ' + seccion.nombre);
    return;
  }
  
  // Exportar los datos de la sección como JSON
  // Llamar a la función global que exporta (table.js o main.js exponen `window.exportarTabla`)
  const prevActive = sectionManager.seccionActiva;
  try {
    sectionManager.establecerSeccionActiva(seccionId);
    if (window.exportarTabla && typeof window.exportarTabla === 'function') {
      try { window.exportarTabla(); } catch (e) { console.warn('exportarTabla error', e); }
    } else {
      // Fallback: descarga local
      const jsonData = JSON.stringify(sectionManager.obtenerSeccion(seccionId).datos, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sectionManager.obtenerSeccion(seccionId).nombre}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addLog('✓ Sección exportada (fallback): ' + sectionManager.obtenerSeccion(seccionId).nombre);
    }
  } finally {
    if (prevActive) sectionManager.establecerSeccionActiva(prevActive.id);
    else sectionManager.seccionActiva = null;
  }
};

window.importarSeccion = (event, seccionId) => {
  // Si viene del input file, event.target.files está disponible
  if (!event) return;
  if (event.target && event.target.files && event.target.files[0]) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const seccion = sectionManager.obtenerSeccion(seccionId);
        if (!seccion) return;

        // Si el archivo es una exportación de la sección (contiene columnas+datos)
        if (json && json.columnas && Array.isArray(json.datos)) {
          // Importar solo los datos a la sección actual
          seccion.datos = json.datos;
          sectionManager.guardarSecciones();
          if (window.tableRenderer) window.tableRenderer.renderizarTablaPersonalizada(seccionId);
          addLog('Sección importada (formato sección): ' + seccion.nombre);
          if (window.showStatus) window.showStatus('Sección importada: ' + seccion.nombre);
          return;
        }

        // Si es un array de mediciones directamente
        if (Array.isArray(json)) {
          const seccion = sectionManager.obtenerSeccion(seccionId);
          if (seccion) {
            seccion.datos = json;
            sectionManager.guardarSecciones();
            if (window.tableRenderer) window.tableRenderer.renderizarTablaPersonalizada(seccionId);
            addLog('Sección importada: ' + seccion.nombre + ' (' + json.length + ' registros)');
            if (window.showStatus) window.showStatus('Sección importada: ' + seccion.nombre);
          }
          return;
        }

        throw new Error('Formato de archivo desconocido');
      } catch (err) {
        addLog('Error al importar: ' + (err.message || err));
        if (window.showStatus) window.showStatus('Error al importar: ' + (err.message || err));
      }
    };
    reader.readAsText(file);
    // limpiar el input
    event.target.value = '';
    } else {
      // fallback: delegar a la función global importadora si existe
      try {
        if (window.importarTabla && typeof window.importarTabla === 'function') window.importarTabla();
      } catch (e) {
        console.warn('Fallback importarTabla falló', e);
      }
    }
};

window.descargarSeccionPDF = async (seccionId) => {
  const seccion = sectionManager.obtenerSeccion(seccionId);
  if (!seccion) return;
  if (!seccion.datos || seccion.datos.length === 0) {
    addLog('⚠️ No hay datos para descargar PDF en: ' + seccion.nombre);
    return;
  }
  const prevActive = sectionManager.seccionActiva;
  try {
    sectionManager.establecerSeccionActiva(seccionId);
    // Usar la función global descargarPDF (viene de table.js)
    if (window.descargarPDF && typeof window.descargarPDF === 'function') {
      await window.descargarPDF();
    } else {
      addLog('❌ Función descargarPDF no disponible');
    }
  } catch (e) {
    console.warn('Error en descargarSeccionPDF:', e);
    addLog('❌ Error al descargar PDF: ' + String(e));
  } finally {
    if (prevActive) sectionManager.establecerSeccionActiva(prevActive.id);
    else sectionManager.seccionActiva = null;
  }
};

window.confirmarDistanciaSeccion = (seccionId) => {
  const valor = parseFloat(document.getElementById(`distancia-valor-${seccionId}`)?.value || 0);
  const unidad = document.getElementById(`distancia-unidad-${seccionId}`)?.value || 'cm';
  
  if (valor > 0) {
    // Convertir a metros internamente para cálculos
    let metros = valor;
    if (unidad === 'cm') metros = valor / 100;
    else if (unidad === 'mm') metros = valor / 1000;
    else if (unidad === 'in') metros = valor * 0.0254;
    
    // Guardar en la sección (crear propiedad si no existe)
    const seccion = sectionManager.obtenerSeccion(seccionId);
    if (seccion) {
      seccion.distancia = { valor, unidad, metros };
      sectionManager.guardarSecciones();
      addLog(`✓ Distancia guardada: ${valor} ${unidad} (${metros.toFixed(4)}m)`);

      // Si la app está conectada a un ESP, notificar la nueva distancia al ESP
      try {
        if (state?.ESP32_IP) {
          const ip = state.ESP32_IP.replace(/^https?:\/\//, '');
          const url = `http://${ip}/set_distancia?d=${encodeURIComponent(metros)}`;
          fetch(url).then(r => r.json?.() ?? r.text()).then(res => {
            console.debug('[ESP] set_distancia response', res);
            addLog('Enviado set_distancia al ESP: ' + (res && res.ok ? 'OK' : JSON.stringify(res)));
          }).catch(err => {
            console.warn('[ESP] error set_distancia', err);
            addLog('Error enviando set_distancia: ' + String(err));
          });
        }
      } catch (e) {
        console.warn('Error al notificar distancia al ESP', e);
      }
    }
  } else {
    addLog('⚠️ Introduce un valor de distancia válido');
  }
};
