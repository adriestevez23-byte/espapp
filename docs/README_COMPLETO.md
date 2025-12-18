# 🌍 ESP32 App - Gestor de Sensores

**Aplicación multiplataforma para medir y gestionar datos de sensores conectados a ESP32 en tiempo real.**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características

✅ **Interfaz web moderna** - Responsive y con tema claro/oscuro  
✅ **Conexión WiFi a ESP32** - Escaneo y conexión automáticos  
✅ **Gestión de secciones** - Crea secciones y columnas personalizadas  
✅ **Tablas en tiempo real** - Captura datos de sensores  
✅ **Exportar/Importar** - Datos en JSON y PDF  
✅ **Persistencia local** - Guarda automáticamente los datos  
✅ **Multiplataforma** - Windows, Linux, Raspberry Pi, macOS  

## 🚀 Inicio Rápido

### Opción 1: Ejecutable directo (Recomendado)

```bash
cd /home/alumnado/Adrian/espapp-env
./START.sh
# Selecciona opción 1 (Servidor Web)
```

### Opción 2: Desde línea de comandos

```bash
cd /home/alumnado/Adrian/espapp-env
source bin/activate
USE_WEB=1 python main.py
```

Luego abre: **http://localhost:8000**

## 📖 Guía de uso

### 1. Conectar a ESP32

1. Abre el menú **Ajustes** (⚙️) en la esquina superior derecha
2. Haz clic en **"🔄 Escanear redes"**
3. Selecciona la red `ESP32-SENSORES` u otra red ESP32
4. Si es necesario, ingresa la contraseña WiFi
5. Haz clic en **"Conectar"**
6. El indicador en el header se pondrá **verde** cuando esté conectado

### 2. Crear Secciones

1. Haz clic en el botón **"📋"** (Gestionar secciones) en el header
2. Rellena el formulario:
   - **Nombre**: Ej. "Velocidad de agua"
   - **Columnas**: Especifica qué datos capturar (ej. "Tiempo;Velocidad;Distancia")
   - **Tipo de columna**: Número, Texto, etc.
3. Haz clic en **"Crear Sección"**

### 3. Medir

1. Selecciona una sección en la barra lateral
2. **Captura automática**: Los datos de ESP32 se cargan automáticamente
3. **Captura manual**: Usa el botón **"+ Añadir medición"** para ingresar datos manualmente
4. Los datos se guardan automáticamente

### 4. Exportar datos

1. Abre el gestor de secciones (**📋**)
2. Selecciona una sección
3. Usa los botones:
   - **📥 Exportar** → Descarga como JSON
   - **📄 PDF** → Crea un informe

## 📁 Estructura del Proyecto

```
espapp-env/
├── main.py                 # Aplicación principal
├── requirements.txt        # Dependencias Python
├── config.py              # Configuración
├── run.sh                 # Script para ejecutar (Linux/Mac)
├── START.sh               # Interfaz interactiva
├── build_windows.py       # Constructor para Windows
├── build_all.sh           # Constructor multiplataforma
│
├── web/                   # Interfaz web
│   ├── index.html
│   ├── style.css
│   └── js/                # Módulos JavaScript
│
├── backend/               # Backend Flask (alternativo)
│   └── api_server.py
│
├── docs/                  # Documentación
│   ├── BUILD_WINDOWS.md   # Instrucciones Windows
│   └── ...
│
└── debian_pkg/            # Paquetes para Linux
    ├── amd64/
    ├── arm64/
    └── armv7l/
```

## 🛠️ Instalación en Windows 10

### Método 1: Instalador automático (Recomendado)

```bash
# En Linux, crea el instalador:
python build_windows.py

# Descarga espapp-setup-1.0.0.exe de windows_installer/
```

En Windows:
1. Descarga `espapp-setup-1.0.0.exe`
2. Ejecuta el instalador
3. Sigue los pasos del asistente
4. Abre desde el menú Inicio o escritorio

### Método 2: Versión portable (Sin instalación)

1. Descarga `espapp-portable-1.0.0.zip`
2. Extrae en una carpeta
3. Ejecuta `espapp.exe`

## 🐧 Instalación en Linux / Raspberry Pi

### Opción 1: Desde fuente (Desarrollo)

```bash
# Clonar o descargar el proyecto
cd espapp-env

# Crear entorno virtual
python3 -m venv --system-site-packages venv
source bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
./START.sh
```

### Opción 2: Paquete .deb (Ubuntu/Debian)

```bash
sudo apt install ./esp32-medidor-velocidad_1.0_amd64.deb
espapp  # Ejecutar desde terminal
```

### Opción 3: Raspberry Pi

```bash
# Para ARM32
sudo apt install ./esp32-medidor-velocidad_1.0_armv7l.deb

# Para ARM64
sudo apt install ./esp32-medidor-velocidad_1.0_arm64.deb
```

## 🔌 Compatibilidad con ESP32

La app espera un servidor HTTP en el ESP32 que proporcione:

### Endpoints requeridos

```
GET  /data              → Devuelve JSON con mediciones
POST /add               → Añade una medición
GET  /clear             → Limpia las mediciones
GET  /set_distancia     → Establece distancia
GET  /logs              → Obtiene logs
GET  /status            → Estado del ESP32
```

Ver ejemplo en `web/index.html` → sección "Código ejemplo del ESP32"

## ⚙️ Configuración

Edita `config.py` para personalizar:

```python
SERVER_PORT = 8000              # Puerto del servidor
WINDOW_WIDTH = 1280             # Ancho de la ventana GUI
MAX_MEASUREMENTS = 10000        # Máximo de mediciones
ENABLE_EXPORT_PDF = True        # Exportar a PDF
```

## 🐛 Solución de problemas

### "❌ [WARN] GTK no disponible"
**Solución**: Ejecutar en modo web (es más estable)
```bash
USE_WEB=1 python main.py
```

### "❌ ESP32 no detectado"
1. Verifica que el ESP32 esté encendido y en rango WiFi
2. Intenta conectar manualmente con la IP del ESP32
3. Revisa los logs del ESP32

### "❌ pyinstaller no encontrado"
```bash
pip install pyinstaller
```

### "❌ Port 8000 already in use"
```bash
# Cambiar puerto en config.py o usar:
lsof -i :8000
kill -9 <PID>
```

## 📦 Dependencias

- **Python 3.8+**
- **pywebview** - Interfaz gráfica
- **bottle** - Servidor web
- **requests** - Cliente HTTP
- **reportlab** - Generación PDF
- **Pillow** - Procesamiento de imágenes

Instalar: `pip install -r requirements.txt`

## 🏗️ Construcción

### Windows
```bash
python build_windows.py
```

### Linux/Debian
```bash
bash build_deb.sh
```

### Multiplataforma
```bash
bash build_all.sh all
```

## 📄 Licencia

MIT License - Ver `LICENSE` para detalles

## 👨‍💻 Desarrollador

**Diseñado por Adrián**

---

## 📚 Más información

- `docs/BUILD_WINDOWS.md` - Instrucciones detalladas para Windows
- `docs/DESENVOLVEDIOR.md` - Guía para desarrolladores
- `web/index.html` - Referencia de API
- `backend/api_server.py` - Servidor backend alternativo

**¿Preguntas?** Abre un issue o revisa la documentación en `docs/`

