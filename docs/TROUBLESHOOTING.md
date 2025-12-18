# 🆘 Troubleshooting y Solución de Problemas

## 🚀 La Aplicación no Inicia

### Error: "ModuleNotFoundError: No module named 'webview'"

**Causa:** pywebview no está instalado

```bash
# Solución:
source bin/activate
pip install pywebview==6.1
```

### Error: "GTK not found" (Linux)

**Causa:** Librerías GTK no instaladas

```bash
# Ubuntu/Debian
sudo apt-get install libgtk-3-0 libgtk-3-dev libcairo2-dev

# Raspberry Pi
sudo apt-get install -y \
  libgtk-3-0 libgtk-3-dev \
  libcairo2-dev libglib2.0-0 \
  libpango-1.0-0
```

### Error: "Port 5000 already in use"

**Causa:** Otro proceso está usando el puerto 5000

```bash
# Encontrar el proceso
lsof -i :5000

# Matar el proceso (reemplaza PID)
kill -9 <PID>

# O cambiar el puerto en backend_node/backend_node/server.js
```

### Error: "EACCES: permission denied"

**Causa:** Falta permiso de ejecución

```bash
chmod +x run-hybrid.sh
chmod +x install-raspberry.sh
chmod +x build_deb.sh
```

---

## 📱 Problemas de Conexión con ESP32

### "No conecto al ESP32"

**Checklist:**
1. ✅ ESP32 encendido y con WiFi conectado
2. ✅ Misma red WiFi en la que está tu computadora/Raspberry
3. ✅ Firewall permite conexión local
4. ✅ Dirección IP correcta

**Debug:**

```bash
# Desde tu computadora, intenta ping al ESP32
ping 192.168.1.100  # Reemplaza con IP del ESP32

# Si no responde, revisa monitor serial del ESP32
# Debería mostrar su IP local
```

### "Conexión inestable o interrumpida"

**Soluciones:**
1. Reinicia el ESP32
2. Acércate más al router WiFi
3. Verifica la calidad de la señal WiFi
4. Intenta cambiar el canal WiFi en el router

### "Los datos del ESP32 no llegan"

**Checklist:**
1. ✅ El ESP32 está respondiendo en endpoint `/api/data`
2. ✅ La respuesta es JSON válido
3. ✅ Los campos incluyen `distance` (obligatorio)

**Debug:**

```bash
# Verifica manualmente con curl
curl http://192.168.1.100/api/data

# Debería responder algo como:
# {"distance": 45.2, "temperature": 23.5}
```

---

## 📊 Problemas de Datos y Visualización

### "Los datos no se actualizan en tiempo real"

**Causa:** Problemas de comunicación

```bash
# Abre la consola del navegador (F12)
# Busca errores en la pestaña "Console"
# Comúnmente: Error CORS o conexión rechazada

# Verifica que el backend está corriendo:
curl http://localhost:5000/api/sections
```

### "El gráfico no se muestra"

**Requisitos:**
- ✅ Al menos 2 puntos de datos
- ✅ Columnas numéricas (distancia, velocidad, etc.)
- ✅ Datos válidos (números, sin valores nulos)

**Debug:**

```javascript
// Abre DevTools (F12) y en Console ejecuta:
console.log(localStorage)

// Verifica que los datos están guardados:
JSON.parse(localStorage.getItem('section_X'))
```

### "Los datos desaparecen al cerrar"

**Causa:** localStorage no guarda correctamente

```bash
# Abre DevTools (F12) → Application → Local Storage
# Verifica que hay datos guardados

# Si está vacío, prueba a guardar manualmente:
# Haz clic en una sección y luego en "Guardar"
```

### "Valores negativos o erráticos en velocidad"

**Causa:** Configuración incorrecta de tiempo o distancia

```
Soluciones:
1. Verifica que la distancia aumenta (no disminuye)
2. Asegúrate de que el tiempo avanza correctamente
3. Revisa la fórmula: Velocidad = Distancia / Tiempo
4. Comprueba que las unidades son consistentes
```

---

## 💾 Problemas de Almacenamiento

### "No puedo descargar el PDF"

**Causa:** Problema con generación de PDF

```bash
# Verifica que reportlab está instalado:
python3 -c "import reportlab; print('OK')"

# Si falta:
pip install reportlab==4.4.5
```

### "El archivo CSV está vacío o incompleto"

**Causa:** Datos no completamente guardados

```javascript
// Abre DevTools (F12) y en Console ejecuta:
const data = JSON.parse(localStorage.getItem('section_X'));
console.log(data.data); // Verifica que hay datos

// Si está vacío, intenta recargar la página
// y ejecutar nuevamente
```

### "Error al importar configuración"

**Requisitos:**
- ✅ Archivo JSON válido
- ✅ Exportado desde esta aplicación
- ✅ No editado manualmente

**Debug:**

```javascript
// En DevTools (F12), intenta parsear el archivo:
const json = '... contenido del archivo ...';
JSON.parse(json); // Verifica que es JSON válido
```

---

## 🐌 Rendimiento Lento

### "La app va muy lenta"

**Causas frecuentes:**
1. **Demasiados datos:** >5000 registros ralentizan la UI
2. **Navegador pesado:** Muchas pestañas abiertas
3. **Hardware débil:** Especialmente en Raspberry Pi
4. **Backend no responde:** El servidor Node.js está ocupado

**Soluciones:**

```bash
# 1. Liberar memoria
pkill -f node  # Reinicia backend
./run-hybrid.sh

# 2. Dividir datos
# Si tienes >5000 registros, crea una nueva sección

# 3. Cerrar otras aplicaciones
# Especialmente navegadores, IDEs, editores

# 4. Reiniciar Raspberry Pi
sudo reboot
```

### "Raspberry Pi se calienta o se ralentiza"

**Soluciones:**
1. Asegúrate de tener ventilación adecuada
2. Reduce brillo de pantalla (consume recursos)
3. Cierra navegadores innecesarios
4. Revisa procesos en background: `ps aux`

```bash
# Ver consumo de CPU y RAM
top
# Presiona 'q' para salir
```

---

## 🔗 Problemas de Red

### "Error CORS: No se puede conectar a API"

**Causa:** Política de CORS no configurada correctamente

```javascript
// Abre DevTools (F12) → Network
// Busca respuesta con error CORS

// El backend debe permitir CORS:
// En backend_node/backend_node/server.js:
app.use(cors());  // Debe estar presente
```

### "La red WiFi se cae"

**Debug:**

```bash
# Verifica señal WiFi
iwconfig  # Linux

# Revisa estado de red
ip addr
```

---

## 🖥️ Problemas en Raspberry Pi Específicos

### "No puedo ver la ventana gráfica"

**Causa:** X11 no está disponible o DISPLAY no configurado

```bash
# Verifica que hay servidor gráfico
echo $DISPLAY  # Debería mostrar algo como :0

# Si está vacío, probablemente estés en terminal puro
# Instala X11:
sudo apt-get install x11-common
```

### "pywebview abre pero no se ve nada"

**Soluciones:**
1. Verifica que GTK está instalado: `apt install libgtk-3-0`
2. Abre en fullscreen: Presiona F11
3. Reinicia la aplicación

### "SD card se daña rápidamente"

**Causa:** Demasiadas escrituras

```bash
# Reduce escrituras reduciendo log level
export PYWEBVIEW_DEBUG=0

# O mueve logs a RAM
# Edita run-hybrid.sh y cambia rutas de log a /tmp/
```

---

## 🔧 Verificación de Dependencias

```bash
# Script para verificar que todo está instalado
./test-architecture.sh
```

Si falta algo:

```bash
# Python
python3 --version  # Debe ser 3.8+
pip list | grep -E "pywebview|bottle|requests"

# Node.js
node --version    # Debe ser 14+
npm --version

# Librerías del sistema (Linux)
pkg-config --list-all | grep gtk
pkg-config --list-all | grep cairo
```

---

## 📝 Recopilar Información para Soporte

Si necesitas ayuda, incluye:

```bash
# 1. Tu sistema operativo
uname -a

# 2. Versiones
python3 --version
node --version
npm --version

# 3. Dependencias instaladas
pip list
npm list

# 4. Logs
tail -100 pywebview.log
tail -100 backend_node.log

# 5. Procesos corriendo
ps aux | grep -E "python|node"

# 6. Conexión de red (si es problema de ESP32)
ping 192.168.1.100
curl http://192.168.1.100/api/data
```

---

## 📞 Contacto y Soporte

Si el problema persiste:
1. Abre DevTools (F12) y copia los errores
2. Revisa los logs (`pywebview.log`, `backend_node.log`)
3. Intenta reinstalar: `pip install -r requirements.txt --force-reinstall`
4. Comparte la información anterior con soporte

---

**Última actualización:** 15 de diciembre de 2025
**Versión:** 2.0

Para más información, consulta:
- USUARIO.md - Guía de uso
- DESARROLLADOR.md - Debugging técnico
- DESPLIEGUE.md - Instalación
