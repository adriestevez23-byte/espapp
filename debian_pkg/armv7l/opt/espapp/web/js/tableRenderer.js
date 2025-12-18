// js/tableRenderer.js
// Renderiza las tablas según la configuración dinámica de secciones

import { sectionManager, tiposColumnasDefecto } from './sections.js';
import { state } from './config.js';

export const tableRenderer = {
  
  // Renderizar tabla completa según la sección activa
  renderizarTablaActiva() {
    const seccion = sectionManager.seccionActiva;
    if (!seccion) return;

    const tabla = document.getElementById('tabla');
    if (!tabla) {
      this.crearTabla();
      return;
    }

    // Renderizar encabezados
    const thead = tabla.closest('table')?.querySelector('thead');
    if (thead) {
      const tr = thead.querySelector('tr');
      if (tr) {
        tr.innerHTML = seccion.columnas.map(col => 
          `<th>${col.nombre}</th>`
        ).join('');
      }
    }

    // Renderizar datos
    const tbody = tabla;
    if (seccion.datos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="' + seccion.columnas.length + '">Sin datos</td></tr>';
    } else {
      tbody.innerHTML = seccion.datos.slice(-100).reverse().map(dato => {
        return '<tr>' + seccion.columnas.map(col => {
          const valor = this.obtenerValorColumna(dato, col);
          return `<td>${this.formatearValor(valor, col)}</td>`;
        }).join('') + '</tr>';
      }).join('');
    }
  },

  // Obtener valor de una columna según su tipo
  obtenerValorColumna(dato, columna) {
    if (columna.tipo === 'esp32') {
      // Buscar por propiedad del ESP32
      return dato[columna.propiedad] !== undefined ? dato[columna.propiedad] : '-';
    } else if (columna.tipo === 'calculado') {
      // Ya está calculado en el dato
      return dato[columna.id] !== undefined ? dato[columna.id] : '-';
    } else if (columna.tipo === 'defecto') {
      // Ya fue generado automáticamente en procesarCalculos
      return dato[columna.id] !== undefined ? dato[columna.id] : '-';
    }
    return '-';
  },

  // Formatear valor según tipo
  formatearValor(valor, columna) {
    if (valor === null || valor === undefined || valor === '-') return '-';

    // Si es número, aplicar formato según nombre de columna
    if (typeof valor === 'number') {
      if (columna.nombre.includes('Tiempo') || columna.nombre.includes('tiempo')) {
        return valor.toFixed(3) + ' s';
      } else if (columna.nombre.includes('Velocidad') || columna.nombre.includes('velocidad')) {
        return valor.toFixed(2) + ' m/s';
      } else if (columna.nombre.includes('Centímetro') || columna.nombre.includes('metros')) {
        return (valor * 100).toFixed(1) + ' cm';
      } else {
        return valor.toFixed(2);
      }
    }

    return String(valor);
  },

  // Crear tabla completa en el DOM
  crearTabla() {
    const seccion = sectionManager.seccionActiva;
    if (!seccion) return;

    const container = document.querySelector('table');
    if (!container) return;

    container.innerHTML = `
      <thead>
        <tr>
          ${seccion.columnas.map(col => `<th>${col.nombre}</th>`).join('')}
        </tr>
      </thead>
      <tbody id="tabla">
        <tr><td colspan="${seccion.columnas.length}">Sin datos</td></tr>
      </tbody>
    `;
  },

  // Agregar dato a la tabla actual
  agregarDato(dato) {
    const seccion = sectionManager.seccionActiva;
    if (!seccion) return;

    // Procesar y guardar en el gestor de secciones
    sectionManager.agregarDato(seccion.id, dato);

    // Actualizar la visualización (para la sección personalizada)
    this.renderizarTablaPersonalizada(seccion.id);
  },

  // Generar HTML de tabla para PDF
  generarHTMLPara(formato = 'pdf') {
    const seccion = sectionManager.seccionActiva;
    if (!seccion || seccion.datos.length === 0) {
      return '<p>Sin datos para generar ' + formato.toUpperCase() + '</p>';
    }

    // Para PDF, mostrar TODOS los datos (no limitar a 100)
    const filas = seccion.datos.reverse().map(dato => {
      return '<tr>' + seccion.columnas.map(col => {
        const valor = this.obtenerValorColumna(dato, col);
        return `<td>${this.formatearValor(valor, col)}</td>`;
      }).join('') + '</tr>';
    }).join('');

    return `
      <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-family:monospace;">
        <thead>
          <tr>
            ${seccion.columnas.map(col => `<th>${col.nombre}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>
    `;
  },

  // Limpiar datos de la sección actual
  limpiarDatos() {
    const seccion = sectionManager.seccionActiva;
    if (seccion) {
      sectionManager.limpiarDatos(seccion.id);
      this.renderizarTablaActiva();
    }
  },

  // Exportar datos como JSON
  exportarJSON() {
    const seccion = sectionManager.seccionActiva;
    if (!seccion) return null;

    return {
      seccion: seccion.nombre,
      columnas: seccion.columnas,
      datos: seccion.datos
    };
  },

  // Importar datos desde JSON
  importarJSON(json) {
    try {
      const data = JSON.parse(json);
      const seccion = sectionManager.seccionActiva;
      if (seccion && Array.isArray(data.datos)) {
        sectionManager.limpiarDatos(seccion.id);
        data.datos.forEach(dato => {
          sectionManager.agregarDato(seccion.id, dato);
        });
        this.renderizarTablaActiva();
        return true;
      }
    } catch (e) {
      console.error('[IMPORT]', e);
      return false;
    }
  },

  // Renderizar tabla para sección personalizada
  renderizarTablaPersonalizada(seccionId) {
    const seccion = sectionManager.obtenerSeccion(seccionId);
    if (!seccion) return;

    const tbody = document.getElementById(`tabla-${seccionId}`);
    if (!tbody) return;

    if (seccion.datos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="' + seccion.columnas.length + '">Sin datos</td></tr>';
    } else {
      tbody.innerHTML = seccion.datos.slice(-100).reverse().map(dato => {
        return '<tr>' + seccion.columnas.map(col => {
          const valor = this.obtenerValorColumna(dato, col);
          return `<td>${this.formatearValor(valor, col)}</td>`;
        }).join('') + '</tr>';
      }).join('');
    }
  }
};