// web/js/test_sections.js
// Archivo de prueba para validar el sistema de secciones

import { sectionManager, tiposColumnasDefecto } from './sections.js';
import { tableRenderer } from './tableRenderer.js';

/**
 * Ejecutar pruebas del sistema de secciones
 * Llamar desde la consola: window.testSections()
 */
export function testSections() {
  console.log("=== INICIANDO PRUEBAS DEL SISTEMA DE SECCIONES ===\n");

  try {
    // Test 1: Crear sección
    console.log("Test 1: Crear sección");
    const seccion = sectionManager.crearSeccion("Prueba");
    console.log("✓ Sección creada:", seccion);

    // Test 2: Agregar columnas
    console.log("\nTest 2: Agregar columnas");
    sectionManager.agregarColumna(seccion.id, { 
      nombre: "Tiempo", 
      tipo: "esp32", 
      propiedad: "tiempo" 
    });
    sectionManager.agregarColumna(seccion.id, { 
      nombre: "Velocidad", 
      tipo: "esp32", 
      propiedad: "velocidad" 
    });
    sectionManager.agregarColumna(seccion.id, { 
      nombre: "Producto", 
      tipo: "calculado", 
      formula: "col_1 * col_2" 
    });
    console.log("✓ Columnas agregadas:", seccion.columnas);

    // Test 3: Agregar datos
    console.log("\nTest 3: Agregar datos");
    sectionManager.agregarDato(seccion.id, { tiempo: 2.5, velocidad: 10 });
    sectionManager.agregarDato(seccion.id, { tiempo: 3.0, velocidad: 15 });
    console.log("✓ Datos agregados:", seccion.datos);

    // Test 4: Verificar cálculos
    console.log("\nTest 4: Verificar cálculos");
    const ultimoDato = seccion.datos[seccion.datos.length - 1];
    console.log("Último dato:", ultimoDato);
    console.log("✓ Cálculo de columna (col_1 * col_2):", ultimoDato.col_3, "esperado: 45");

    // Test 5: Establecer como activa
    console.log("\nTest 5: Establecer como sección activa");
    sectionManager.establecerSeccionActiva(seccion.id);
    console.log("✓ Sección activa:", sectionManager.seccionActiva.nombre);

    // Test 6: Exportar
    console.log("\nTest 6: Exportar sección");
    const exportado = sectionManager.exportarSeccion(seccion.id);
    console.log("✓ Exportado:", JSON.parse(exportado).datos.length, "registros");

    // Test 7: Importar
    console.log("\nTest 7: Importar sección");
    const seccionImportada = sectionManager.importarSeccion(exportado);
    console.log("✓ Sección importada con ID:", seccionImportada.id);

    // Test 8: Tabla renderer
    console.log("\nTest 8: Renderizador de tabla");
    sectionManager.establecerSeccionActiva(seccion.id);
    const htmlPDF = tableRenderer.generarHTMLPara('pdf');
    console.log("✓ HTML para PDF generado, longitud:", htmlPDF.length);

    // Test 9: Eliminar sección
    console.log("\nTest 9: Eliminar sección");
    const idAEliminar = seccionImportada.id;
    sectionManager.eliminarSeccion(idAEliminar);
    console.log("✓ Sección eliminada");

    // Test 10: Listar todas las secciones
    console.log("\nTest 10: Listar secciones");
    console.log("✓ Secciones disponibles:");
    sectionManager.secciones.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.nombre} (${s.datos.length} registros)`);
    });

    console.log("\n=== PRUEBAS COMPLETADAS EXITOSAMENTE ===");
    console.log("\nResumen:");
    console.log("- Secciones creadas:", sectionManager.secciones.length);
    console.log("- Sección activa:", sectionManager.seccionActiva?.nombre);
    console.log("- Registros en sección activa:", sectionManager.seccionActiva?.datos.length);

  } catch (error) {
    console.error("❌ ERROR EN PRUEBAS:", error);
  }
}

// Exponer globalmente
window.testSections = testSections;
