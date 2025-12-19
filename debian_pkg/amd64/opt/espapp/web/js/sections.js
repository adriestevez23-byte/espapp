// js/sections.js
// Sistema de secciones personalizables con tablas dinámicas

import { state as globalState, addLog } from './config.js';

/**
 * ESTRUCTURA DE SECCIÓN:
 * {
 *   id: "seccion_1",
 *   nombre: "Mediciones",
 *   columnas: [
 *     { id: "col_1", nombre: "Tiempo", tipo: "defecto", propiedad: "tiempo" },
 *     { id: "col_2", nombre: "Velocidad", tipo: "esp32", propiedad: "velocidad" },
 *     { id: "col_3", nombre: "Resultado", tipo: "calculado", formula: "col_1 * col_2" }
 *   ],
 *   datos: []
 * }
 */

export const sectionManager = {
  secciones: [],
  seccionActiva: null,

  // Crear nueva sección
  crearSeccion(nombre) {
    const id = `seccion_${Date.now()}`;
    const seccion = {
      id,
      nombre,
      columnas: [],
      datos: []
    };
    this.secciones.push(seccion);
    this.guardarSecciones();
    return seccion;
  },

  // Obtener sección por ID
  obtenerSeccion(id) {
    return this.secciones.find(s => s.id === id);
  },

  // Eliminar sección
  eliminarSeccion(id) {
    this.secciones = this.secciones.filter(s => s.id !== id);
    if (this.seccionActiva?.id === id) {
      this.seccionActiva = this.secciones[0] || null;
    }
    this.guardarSecciones();
  },

  // Establecer sección activa
  establecerSeccionActiva(id) {
    this.seccionActiva = this.obtenerSeccion(id);
    try {
      if (localStorage && localStorage.setItem) {
        localStorage.setItem('seccionActiva', id);
      }
    } catch (e) {
      console.warn('[SECTIONS] No se pudo guardar seccionActiva en localStorage:', e);
    }
  },

  // ===== GESTIÓN DE COLUMNAS =====
  agregarColumna(seccionId, columna) {
    const seccion = this.obtenerSeccion(seccionId);
    if (seccion) {
      columna.id = columna.id || `col_${Date.now()}`;
      seccion.columnas.push(columna);
      console.log(`[SECTIONS] agregarColumna -> seccion=${seccionId} colId=${columna.id} nombre=${columna.nombre}`);
      this.guardarSecciones();
      return columna;
    }
  },

  eliminarColumna(seccionId, colId) {
    const seccion = this.obtenerSeccion(seccionId);
    if (seccion) {
      seccion.columnas = seccion.columnas.filter(c => c.id !== colId);
      console.log(`[SECTIONS] eliminarColumna -> seccion=${seccionId} colId=${colId}`);
      this.guardarSecciones();
    }
  },

  reordenarColumnas(seccionId, nuevaOrden) {
    const seccion = this.obtenerSeccion(seccionId);
    if (seccion) {
      seccion.columnas = nuevaOrden;
      this.guardarSecciones();
    }
  },

  // ===== GESTIÓN DE DATOS =====
  agregarDato(seccionId, dato) {
    const seccion = this.obtenerSeccion(seccionId);
    if (seccion) {
      // Calcular columnas calculadas
      const datoConCalculos = this.procesarCalculos(seccion, dato);
      seccion.datos.push(datoConCalculos);
      // Mantener límite de datos
      if (seccion.datos.length > 10000) {
        seccion.datos.shift();
      }
      this.guardarSecciones();
      return datoConCalculos;
    }
  },

  procesarCalculos(seccion, dato) {
    const resultado = { ...dato };
    // Si el dato trae una marca temporal desde el ESP, usarla (ts en segundos o timestamp)
    const tsRaw = dato?.ts || dato?.timestamp || dato?.time || null;
    const ahora = tsRaw ? new Date(Number(tsRaw) * 1000) : new Date();
    
    for (const col of seccion.columnas) {
      if (col.tipo === 'calculado' && col.formula) {
        try {
          resultado[col.id] = this.evaluarFormula(col.formula, resultado, seccion);
        } catch (e) {
          console.error('[CALC]', e);
          resultado[col.id] = null;
        }
      } else if (col.tipo === 'defecto') {
        // Generar valor automático de fecha/hora. Preferir la marca temporal del ESP (si existe).
        if (col.subtipo === 'fecha') {
          resultado[col.id] = ahora.toLocaleDateString('es-ES');
        } else if (col.subtipo === 'hora') {
          resultado[col.id] = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (col.subtipo === 'fecha-hora') {
          resultado[col.id] = `${ahora.toLocaleDateString('es-ES')} ${ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        }
      }
    }
    return resultado;
  },

  evaluarFormula(formula, dato, seccion) {
    // Reemplazar referencias de columnas por sus valores
    let expr = formula;
    const reemplazos = {};
    const unidades = {};
    
    // Reemplazar por ID de columna (ej: col_123 → valor)
    for (const col of seccion.columnas) {
      // Buscar valor: primero por propiedad ESP32, luego por ID
      let valor = dato[col.propiedad];
      if (valor === undefined || valor === null) {
        valor = dato[col.id];
      }
      // Guardar unidad si existe
      if (col.unidad) {
        unidades[col.id] = col.unidad;
      }
      // Si encontramos un valor, registrar el reemplazo
      if (valor !== undefined && valor !== null) {
        // Convertir a número si es posible
        const numValue = Number(valor);
        if (!isNaN(numValue)) {
          reemplazos[col.id] = numValue;
          expr = expr.replace(new RegExp(`\\b${col.id}\\b`, 'g'), numValue);
          console.log(`[FORMULA] ${col.id} = ${numValue} (${col.unidad || 'sin unidad'})`);
        }
      }
    }
    // Advertencia si hay mezcla de unidades
    const unidadesUnicas = Object.values(unidades).filter(u => !!u);
    if (unidadesUnicas.length > 1 && new Set(unidadesUnicas).size > 1) {
      console.warn('[FORMULA] ¡Advertencia! Mezcla de unidades en la fórmula:', unidadesUnicas);
    }
    console.log(`[FORMULA] Original: "${formula}"`);
    console.log(`[FORMULA] Evaluable: "${expr}"`);
    // Validar que la expresión solo tiene caracteres matemáticos seguros
    if (/^[\d\+\-\*\/\(\)\.\s]+$/.test(expr)) {
      try {
        const resultado = eval(expr);
        console.log(`[FORMULA] Resultado: ${resultado}`);
        return resultado;
      } catch (e) {
        console.error('[EVAL ERROR]', e, 'expr:', expr, 'formula original:', formula, 'reemplazos:', reemplazos);
        return null;
      }
    }
    console.warn('[EVAL] Fórmula rechazada (caracteres inválidos):', expr, 'reemplazos intentados:', reemplazos);
    return null;
  },

  limpiarDatos(seccionId) {
    const seccion = this.obtenerSeccion(seccionId);
    if (seccion) {
      seccion.datos = [];
      this.guardarSecciones();
    }
  },

  // ===== PERSISTENCIA =====
  guardarSecciones() {
    // Guardar secciones en disco usando la API Python
    if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.save_sections_to_disk === 'function') {
      window.pywebview.api.save_sections_to_disk(JSON.stringify(this.secciones))
        .then(res => {
          if (res && res.ok) {
            console.log('[SECTIONS] Guardadas en disco correctamente');
          } else {
            console.warn('[SECTIONS] Error guardando en disco:', res && res.msg);
          }
        })
        .catch(e => {
          console.error('[SECTIONS] Error guardando en disco:', e);
        });
    }
    // Guardar también la sección activa actual en localStorage (solo el id)
    if (this.seccionActiva) {
      localStorage.setItem('seccionActiva', this.seccionActiva.id);
    }
  },

  async cargarSecciones() {
    // Cargar secciones desde disco usando la API Python
    if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.load_sections_from_disk === 'function') {
      try {
        const res = await window.pywebview.api.load_sections_from_disk();
        if (res && res.ok && res.secciones) {
          this.secciones = JSON.parse(res.secciones);
          console.log('[SECTIONS] Cargadas desde disco:', this.secciones);
        } else {
          this.secciones = [];
          console.warn('[SECTIONS] No se pudieron cargar desde disco:', res && res.msg);
        }
      } catch (e) {
        this.secciones = [];
        console.error('[SECTIONS] Error cargando desde disco:', e);
      }
    } else {
      this.secciones = [];
      console.warn('[SECTIONS] API Python no disponible para cargar secciones');
    }
    
    // Cargar sección activa (con fallback si localStorage no está disponible)
    let seccionActivaId = null;
    try {
      if (localStorage && localStorage.getItem) {
        seccionActivaId = localStorage.getItem('seccionActiva');
      }
    } catch (e) {
      console.warn('[SECTIONS] localStorage.getItem falló:', e);
    }
    
    if (seccionActivaId && this.obtenerSeccion(seccionActivaId)) {
      this.seccionActiva = this.obtenerSeccion(seccionActivaId);
      console.info('[SECTIONS] Sección activa restaurada:', seccionActivaId);
    } else if (this.secciones.length > 0) {
      this.seccionActiva = this.secciones[0];
      console.info('[SECTIONS] Primera sección establecida como activa');
    } else {
      this.seccionActiva = null;
      console.warn('[SECTIONS] No hay secciones disponibles');
    }
  },

  exportarSeccion(seccionId) {
    const seccion = this.obtenerSeccion(seccionId);
    return seccion ? JSON.stringify(seccion, null, 2) : null;
  },

  importarSeccion(json) {
    try {
      const seccion = JSON.parse(json);
      seccion.id = `seccion_${Date.now()}`;
      this.secciones.push(seccion);
      this.guardarSecciones();
      return seccion;
    } catch (e) {
      console.error('[IMPORT]', e);
      return null;
    }
  }
};

// ===== TIPOS DE COLUMNAS PREDEFINIDAS =====
export const tiposColumnasDefecto = {
  fecha: { nombre: 'Fecha', tipo: 'defecto', propiedad: 'fecha', formato: () => new Date().toLocaleDateString() },
  hora: { nombre: 'Hora', tipo: 'defecto', propiedad: 'hora', formato: () => new Date().toLocaleTimeString() },
  timestamp: { nombre: 'Timestamp', tipo: 'defecto', propiedad: 'timestamp', formato: () => Date.now() },
  contador: { nombre: 'Número', tipo: 'defecto', propiedad: 'contador', formato: (_, idx) => idx + 1 }
};

// ===== OPERADORES PARA COLUMNAS CALCULADAS =====
export const operadoresDisponibles = [
  { nombre: 'Suma (+)', simbolo: '+', ejemplo: 'col_1 + col_2' },
  { nombre: 'Resta (-)', simbolo: '-', ejemplo: 'col_1 - col_2' },
  { nombre: 'Multiplicación (*)', simbolo: '*', ejemplo: 'col_1 * col_2' },
  { nombre: 'División (/)', simbolo: '/', ejemplo: 'col_1 / col_2' },
  { nombre: 'Potencia', simbolo: '**', ejemplo: 'col_1 ** 2' }
];
