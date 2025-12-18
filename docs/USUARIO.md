# 👤 Guía de Usuario - ESP32 Medidor de Velocidad

## ⏱️ 5 Minutos para Empezar

### 1. Inicia la Aplicación
```bash
./run-hybrid.sh
```
Se abrirá la interfaz gráfica automáticamente.

### 2. Conecta al ESP32
- Abre la sección **"Conectar"**
- Ingresa la IP del ESP32 (ej: `192.168.1.100`)
- Haz clic en **"Conectar"**

### 3. Crea tu Primera Sección
1. Haz clic en **"+ Nueva Sección"**
2. Dale un nombre (ej: "Medición 1")
3. Añade columnas según necesites:
   - **Distancia**: para medir (en unidades)
   - **Velocidad**: calcula automáticamente
   - **Tiempo**: registra fecha/hora
4. Guarda los cambios

### 4. Comienza a Medir
- El programa registrará automáticamente los datos del ESP32
- Visualiza en tiempo real en la tabla
- Los datos se guardan automáticamente

---

## 📊 Tipos de Columnas

### Distancia (D)
- Mide la distancia en unidades configuradas
- Rango: 0 a 9999 cm
- Se sincroniza automáticamente con sensores ultrasónicos

### Velocidad (V)
- Calcula automáticamente: `velocidad = distancia / tiempo`
- Unidad: cm/s
- Se actualiza en tiempo real

### Tiempo (T)
- Registra marca de tiempo automática
- Formato: `YYYY-MM-DD HH:MM:SS`
- Útil para análisis temporal

### Temperatura (Temp)
- Si el ESP32 tiene sensor de temperatura
- Rango: -40°C a +125°C

### Presión (P)
- Si el ESP32 tiene sensor de presión
- Rango: 300 a 1100 hPa

---

## 📊 Operaciones Matemáticas

Puedes crear columnas calculadas:

```
Aceleración = (Velocidad_2 - Velocidad_1) / Tiempo
Distancia_Total = SUM(Distancia)
Velocidad_Promedio = AVG(Velocidad)
```

**Operadores soportados:**
- `+` Suma
- `-` Resta
- `*` Multiplicación
- `/` División
- `SUM()` Sumar todos los valores
- `AVG()` Promedio
- `MAX()` Valor máximo
- `MIN()` Valor mínimo

---

## 💾 Exportar y Descargar

### Exportar a CSV
1. Haz clic en **"Descargar"**
2. Elige formato **CSV**
3. Se descargará el archivo automáticamente

### Exportar a PDF
1. Haz clic en **"Descargar"**
2. Elige formato **PDF**
3. Se generará un reporte imprimible

### Exportar Configuración
1. Haz clic en **"⚙️ Configuración"**
2. Elige **"Descargar configuración"**
3. Guarda el archivo `.json`

### Importar Configuración
1. Haz clic en **"⚙️ Configuración"**
2. Elige **"Importar configuración"**
3. Selecciona el archivo `.json`

---

## 🔧 Configuración

### Tema
- **Claro**: Fondo blanco, texto oscuro (día)
- **Oscuro**: Fondo oscuro, texto claro (noche)

### Zona Horaria
Selecciona tu zona horaria para registros de tiempo exactos

### Unidades
- **Distancia**: cm, m, mm
- **Velocidad**: cm/s, m/s, km/h
- **Temperatura**: °C, °F

---

## ❓ Preguntas Frecuentes

### ¿Cómo conecto al ESP32?
1. Asegúrate de que el ESP32 esté en la misma red WiFi
2. Abre la sección "Conectar"
3. Ingresa la IP del ESP32 (puedes verla en el monitor serial)
4. Haz clic en "Conectar"

### ¿Los datos se pierden si cierro el programa?
No. Los datos se guardan automáticamente en el navegador. Al reabre, aparecerán los datos anteriores.

### ¿Puedo usar múltiples dispositivos a la vez?
Sí, pero desde diferentes secciones. Cada sección representa una medición independiente.

### ¿Qué es la "Distancia Inicial"?
Es el punto de referencia. Si estableces 0 cm, midiendo 10 cm la distancia será 10. Si estableces 50 cm, será -40 cm.

### ¿Cómo borro datos?
Haz clic en el botón **"🗑️ Borrar"** para limpiar la sección actual. Se pedirá confirmación.

---

## 🆘 Problemas Comunes

### "No conecto al ESP32"
- ✅ Verifica que el ESP32 esté encendido
- ✅ Comprueba que esté en la misma red WiFi
- ✅ Revisa la IP en el monitor serial del ESP32
- ✅ Abre TROUBLESHOOTING.md

### "Los datos no se actualizan"
- ✅ Verifica la conexión WiFi
- ✅ Reinicia el ESP32
- ✅ Cierra y reabre la aplicación

### "El gráfico no se muestra"
- ✅ Añade al menos 2 puntos de datos
- ✅ Asegúrate de tener datos en columnas numéricas
- ✅ Abre TROUBLESHOOTING.md

### "La aplicación va lenta"
- ✅ Si tienes >1000 registros, considera crear una nueva sección
- ✅ Cierra otras pestañas del navegador
- ✅ Reinicia la aplicación

---

## 💡 Consejos y Buenas Prácticas

✅ **Nombra tus secciones claramente**
- Ej: "Medición_Sensor1_15dic" en lugar de "Datos1"

✅ **Añade una columna de tiempo**
- Facilita análisis posterior

✅ **Regularmente descarga backups**
- Exporta como CSV cada semana

✅ **Usa el tema oscuro en la noche**
- Menos fatiga visual

✅ **Revisa la configuración del ESP32**
- Asegúrate de que envía datos válidos

✅ **Agrupa mediciones relacionadas**
- Usa secciones para distintos experimentos

---

**Última actualización:** 15 de diciembre de 2025
**Versión:** 2.0

Para problemas, abre TROUBLESHOOTING.md
