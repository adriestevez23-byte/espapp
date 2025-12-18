# 📚 Documentación Completa - ESP32 App

**Versión**: 1.0.0  
**Última actualización**: 18 de diciembre de 2025  
**Estado**: ✅ Listo para producción

---

## 📋 Tabla de contenidos

1. [Inicio Rápido](#-inicio-rápido)
2. [Instalación](#-instalación)
3. [Uso](#-uso)
4. [Características](#-características)
5. [Distribución](#-distribución)
6. [Solución de problemas](#-solución-de-problemas)
7. [Desarrollo](#-desarrollo)

---

## ⚡ Inicio Rápido

### Opción 1: Comando simple (Recomendado)

```bash
cd /home/alumnado/Adrian/espapp-env
./start
# Selecciona opción 1 (Servidor web)
```

### Opción 2: Desde línea de comandos

```bash
cd /home/alumnado/Adrian/espapp-env
source bin/activate
python main.py
```

Accede a: **http://localhost:8000**

### Opción 3: Con interfaz gráfica

```bash
./start gui
```

---

## 💾 Instalación

### Linux / macOS

```bash
# Clonar o descargar proyecto
cd espapp-env

# Crear entorno virtual
python3 -m venv . --system-site-packages

# Activar
source bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
./start
```

### Windows 10

**Opción A: Desde código fuente**
```powershell
python -m venv venv --system-site-packages
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Opción B: Instalador profesional**
```bash
python build_windows.py
# Genera: windows_installer\espapp-setup-1.0.0.exe
```

**Opción C: Versión portable**
```bash
python build_windows.py
# Genera: windows_installer\espapp-portable-1.0.0.zip
```

### Raspberry Pi

```bash
# ARMv7 (Pi 3, Zero)
sudo apt install ./esp32-medidor-velocidad_1.0_armv7l.deb

# ARM64 (Pi 4, Pi 5)
sudo apt install ./esp32-medidor-velocidad_1.0_arm64.deb

# Ejecutar
espapp
```

---

## 🎯 Uso

### Paso 1: Conectar a ESP32 (2 min)

1. Click en **⚙️ Ajustes** (esquina superior derecha)
2. Click en **"🔄 Escanear redes"**
3. Selecciona tu red ESP32
4. Ingresa contraseña (si requiere)
5. Click **"Conectar"**
6. ✅ Indicador se pone verde

### Paso 2: Crear sección (1 min)

1. Click en **📋 Gestionar secciones**
2. Nombre: "Mi proyecto"
3. Columnas: "Tiempo;Valor;Unidad"
4. Click **"Crear Sección"**

### Paso 3: Capturar datos (30 seg)

1. Selecciona sección en barra lateral
2. Click **"+ Añadir medición"**
3. Ingresa valores
4. ✅ Guardado automático

### Paso 4: Exportar (30 seg)

1. Abre **📋 Gestionar secciones**
2. Click **📥 JSON** o **📄 PDF**
3. ¡Listo!

---

## ✨ Características

### Funcionalidades principales

✅ **Interfaz web responsive** - Funciona en cualquier navegador  
✅ **Conexión WiFi** - Escaneo automático de redes  
✅ **Gestión de secciones** - Crea secciones y columnas personalizadas  
✅ **Captura en tiempo real** - Datos de sensores automáticamente  
✅ **Exportar/Importar** - JSON y PDF  
✅ **Tema personalizable** - Claro y oscuro  
✅ **Persistencia** - Guardan localmente  
✅ **Multiplataforma** - Windows, Linux, Raspberry Pi  

### Endpoints ESP32 requeridos

```
GET  /data              → Devuelve JSON con mediciones
POST /add               → Añade una medición
GET  /clear             → Limpia las mediciones
GET  /set_distancia     → Establece distancia
GET  /logs              → Obtiene logs del ESP32
GET  /status            → Estado del ESP32
```

Ver ejemplo en `web/index.html` (sección código ESP32)

---

## 📦 Distribución

### Windows 10

**Instalador profesional** (RECOMENDADO):
```bash
python build_windows.py
# Genera: espapp-setup-1.0.0.exe
# Instalación en Program Files, menú Inicio, etc.
```

**Versión portable** (Sin instalación):
```bash
# Genera: espapp-portable-1.0.0.zip
# Solo extraer y ejecutar espapp.exe
```

### Linux / Debian / Ubuntu

```bash
bash scripts/build_deb.sh
# Genera paquetes .deb para amd64, arm64, armv7l
```

Instalar:
```bash
sudo apt install ./esp32-medidor-velocidad_1.0_amd64.deb
```

### Raspberry Pi

```bash
# ARMv7 (Pi 3, Zero)
sudo apt install ./esp32-medidor-velocidad_1.0_armv7l.deb

# ARM64 (Pi 4, Pi 5)
sudo apt install ./esp32-medidor-velocidad_1.0_arm64.deb
```

---

## 🐛 Solución de problemas

| Problema | Solución |
|----------|----------|
| ❌ "GTK no disponible" | Ejecutar: `python main.py` (usa web automáticamente) |
| ❌ "Puerto 8000 ocupado" | `lsof -i :8000` → `kill -9 <PID>` |
| ❌ "ESP32 no detectado" | Verificar WiFi, revisar IP con `nmcli` |
| ❌ "Interfaz en blanco" | Refrescar navegador: `Ctrl+F5` |
| ❌ "pyinstaller no encontrado" | `pip install pyinstaller` |
| ❌ "No se conecta a ESP32" | Comprobar que el ESP32 está en la misma red WiFi |

### Ver logs

**Linux:**
```bash
cat ~/.espapp/logs/app.log
```

**Windows:**
```cmd
type %APPDATA%\espapp\logs\app.log
```

---

## 🔧 Desarrollo

### Estructura del proyecto

```
espapp-env/
├── start                    # Script principal de inicio
├── main.py                  # Aplicación principal
├── config.py                # Configuración centralizada
├── requirements.txt         # Dependencias Python
│
├── web/                     # Interfaz web
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── main.js
│       ├── ui.js
│       ├── sections.js
│       └── ... (módulos)
│
├── scripts/                 # Scripts de compilación
│   └── build_deb.sh
│
├── docs_project/            # Documentación
│   └── README.md           # Este archivo
│
├── docs/                    # Documentación técnica
│   ├── BUILD_WINDOWS.md
│   └── ... (más docs)
│
└── backend/                 # Backend alternativo (Flask)
    └── api_server.py
```

### Editar configuración

Archivo: `config.py`

```python
SERVER_PORT = 8000              # Puerto del servidor
WINDOW_WIDTH = 1280             # Ancho de ventana GUI
MAX_MEASUREMENTS = 10000        # Máximo de mediciones
ENABLE_EXPORT_PDF = True        # Exportar PDF
```

### Agregar nuevas funciones

1. **Backend**: Editar `main.py` - clase `API`
2. **Frontend**: Editar archivos en `web/js/`
3. **Estilos**: Editar `web/style.css`

---

## 📊 Versiones soportadas

| Sistema | Versión |
|---------|---------|
| Python | 3.8+ |
| Windows | 10, 11 (64-bit) |
| Linux | Ubuntu, Debian, etc. |
| Raspberry Pi | Pi 3, Pi 4, Pi 5 |
| macOS | 10.15+ |

---

## 📝 Licencia

MIT License - Ver archivo `LICENSE` para detalles

---

## 👨‍💻 Créditos

**Desarrollado por**: Adrián  
**Basado en**: pywebview, Bottle, reportlab

---

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Revisa los logs
2. Intenta con `./start help`
3. Consulta `QUICKSTART.md` para inicio rápido

---

**¿Listo para empezar?** 🚀

```bash
./start
```

Accede a: http://localhost:8000

¡Disfruta ESP32 App!
