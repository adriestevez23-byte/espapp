# 👨‍💻 Guía para Desarrolladores

## 🏗️ Arquitectura

### Visión General

```
┌─────────────────────────────────────────────────┐
│        ESP32 Medidor de Velocidad               │
├─────────────────────────────────────────────────┤
│ Frontend: pywebview + GTK                       │ ← UI ligera
│ Backend: Node.js (Express)                      │ ← API REST
│ Almacenamiento: Browser localStorage            │ ← Persistencia local
│ Comunicación: HTTP + WebSocket (opcional)       │
└─────────────────────────────────────────────────┘
```

### Arquitectura Híbrida (v2.0)

**Ventajas:**
- ✅ Compatible con Windows, Linux, macOS, Raspberry Pi
- ✅ Ligero (30MB RAM vs 150MB de Electron)
- ✅ Fácil de empaquetar (.deb, .exe, .dmg)
- ✅ Separación clara Frontend/Backend

---

## 📁 Estructura del Código

```
espapp-env/
├── main.py                 # Punto de entrada (pywebview)
├── backend_node/           # Backend API en Node.js
│   └── backend_node/
│       ├── server.js       # Express app
│       └── package.json
├── web/                    # Frontend (HTML/CSS/JS)
│   ├── index.html          # HTML principal
│   ├── style.css           # Estilos
│   └── js/
│       ├── main.js         # Lógica principal
│       ├── sections.js     # Gestión de secciones
│       ├── config.js       # Configuración
│       └── ...
├── electron/               # (Alternativo: Electron UI)
├── requirements.txt        # Dependencias Python
└── docs/                   # Documentación
```

---

## 🚀 Configuración para Desarrollo

### 1. Clonar y Preparar Entorno

```bash
# Crear entorno virtual
python3 -m venv espapp-env
source espapp-env/bin/activate

# Instalar dependencias Python
pip install -r requirements.txt

# Instalar dependencias Node.js
cd backend_node/backend_node
npm install
cd ../..
```

### 2. Ejecutar en Desarrollo

```bash
# Opción A: Modo Híbrido (recomendado)
./run-hybrid.sh

# Opción B: Solo Backend (para testing de API)
cd backend_node/backend_node
npm start

# Opción C: Solo Frontend (requiere backend corriendo)
# En navegador: http://localhost:5000
```

### 3. Debug

```bash
# Habilitar debug en pywebview
export PYWEBVIEW_DEBUG=1
./run-hybrid.sh

# Abrir DevTools: F12 en la ventana de pywebview
```

---

## 📡 API Backend (Node.js)

### Endpoints Principales

#### GET `/api/sections`
Obtiene todas las secciones guardadas.

```json
{
  "sections": [
    {
      "id": "sec1",
      "name": "Medición 1",
      "columns": [...],
      "data": [...]
    }
  ]
}
```

#### POST `/api/sections`
Crea una nueva sección.

```json
{
  "name": "Medición 2",
  "columns": [
    {"name": "Distancia", "type": "distance"},
    {"name": "Velocidad", "type": "velocity"}
  ]
}
```

#### PUT `/api/sections/:id`
Actualiza una sección existente.

#### DELETE `/api/sections/:id`
Elimina una sección.

#### POST `/api/esp32/connect`
Conecta al ESP32.

```json
{
  "ip": "192.168.1.100"
}
```

#### GET `/api/esp32/data`
Obtiene datos del ESP32.

```json
{
  "distance": 45.2,
  "temperature": 23.5,
  "pressure": 1013.25
}
```

---

## 🎨 Frontend (JavaScript)

### Archivos Principales

#### `main.js`
- Inicialización de la aplicación
- Event listeners
- Lógica principal de la UI

#### `sections.js`
- Gestión de secciones (crear, editar, borrar)
- Almacenamiento en localStorage
- Serialización/deserialización de datos

#### `esp32.js`
- Conexión con ESP32
- Obtención de datos en tiempo real
- Parseo de respuestas JSON

#### `ui.js`
- Actualización del DOM
- Animaciones
- Efectos visuales

### Almacenamiento Local (localStorage)

```javascript
// Guardar sección
localStorage.setItem('section_1', JSON.stringify(sectionData));

// Cargar sección
const data = JSON.parse(localStorage.getItem('section_1'));

// Estructura de datos
{
  "id": "sec1",
  "name": "Medición 1",
  "created": "2025-12-15T10:30:00Z",
  "columns": [
    {
      "id": "col1",
      "name": "Distancia",
      "type": "distance",
      "unit": "cm"
    }
  ],
  "data": [
    [45.2, "2025-12-15T10:35:00Z"],
    [46.1, "2025-12-15T10:36:00Z"]
  ]
}
```

---

## 🧪 Testing

### Unit Tests (Python)
```bash
pytest tests/
```

### Integration Tests (Node.js)
```bash
cd backend_node/backend_node
npm test
```

### Manual Testing
1. Abre la aplicación
2. Prueba en diferentes navegadores (si aplica)
3. Verifica en Raspberry Pi

---

## 📦 Compilación y Empaquetamiento

### Debian Package (.deb)
```bash
./build_deb.sh

# Resultado: esp32-medidor-velocidad_1.0_amd64.deb
dpkg -i esp32-medidor-velocidad_1.0_amd64.deb
```

### En Raspberry Pi (ARM64)
```bash
# Desde la Raspberry Pi
./build_deb.sh arm64

# O usa el script de instalación
./install-raspberry.sh
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# Backend Node.js
NODE_ENV=production    # Modo producción
PORT=5000             # Puerto del servidor
DEBUG=*               # Habilitar logs de debug

# pywebview
PYWEBVIEW_DEBUG=1     # Debug de interfaz gráfica
```

### Configuración de ESP32

En el ESP32, asegúrate de:
1. Responder en endpoint `/api/data` con JSON
2. Incluir campos: `distance`, `temperature` (opcional), `pressure` (opcional)
3. Estar en la misma red WiFi

Ejemplo de respuesta ESP32:
```json
{
  "distance": 45.2,
  "temperature": 23.5,
  "pressure": 1013.25,
  "timestamp": "2025-12-15T10:36:00Z"
}
```

---

## 🐛 Debugging

### Logs

```bash
# Logs Backend Node.js
tail -f backend_node.log

# Logs pywebview
tail -f pywebview.log

# Console del navegador: F12
```

### Puntos de Quiebre

En DevTools del navegador (F12):
1. Abre la pestaña "Sources"
2. Busca el archivo `.js` que necesitas debuggear
3. Haz clic en el número de línea para añadir un breakpoint
4. Recarga la página para ejecutar hasta el breakpoint

### Inspeccionar Red

En DevTools (F12) → Network tab:
1. Realiza una acción
2. Observa las peticiones HTTP
3. Verifica respuestas y headers

---

## 📚 Dependencias Clave

### Python
- `pywebview==6.1` - UI multiplataforma
- `bottle==0.13.4` - Servidor web ligero
- `requests==2.32.5` - HTTP client
- `reportlab==4.4.5` - Generación PDF

### Node.js
- `express==4.18.2` - Web framework
- `cors==2.8.5` - CORS middleware
- `node-fetch==2.6.7` - HTTP client

---

## 🚀 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Realiza cambios
4. Haz commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature/mi-feature`
6. Abre un Pull Request

---

## 📝 Notas de Versión

### v2.0 (Diciembre 2025)
- ✅ Arquitectura híbrida (pywebview + Node.js)
- ✅ Compatible con ARM/Raspberry Pi
- ✅ Eliminado Electron
- ✅ Optimizado rendimiento

### v1.0 (Octubre 2025)
- ✅ Versión inicial
- ✅ Electron + Python backend

---

**Última actualización:** 15 de diciembre de 2025
**Versión:** 2.0
