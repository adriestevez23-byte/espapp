# ESPAPP - Gestor de Sensores ESP32

**Aplicación multiplataforma para gestionar y capturar datos de sensores conectados a ESP32**

---

## 📥 Descargas Rápidas

Los ejecutables compilados están disponibles en:

- **Windows (.exe)** → [GitHub Releases](https://github.com/adriestevez23-byte/espapp/releases)
- **Linux (.deb)** → [GitHub Releases](https://github.com/adriestevez23-byte/espapp/releases)

> ⭐ **Descarga desde Releases** - ¡No requiere instalación adicional!

---

## 🎯 Características Principales

✅ **Interfaz intuitiva** - Fácil de usar sin curva de aprendizaje  
✅ **Captura en tiempo real** - Datos de sensores ESP32 en vivo  
✅ **Visualización avanzada** - Tablas interactivas y gráficos  
✅ **Exportación flexible** - CSV, PDF, JSON  
✅ **Multiplataforma** - Windows, Linux, Raspberry Pi  
✅ **Cálculos automáticos** - Velocidad, aceleración, promedios  
✅ **Gestión de secciones** - Organiza tus mediciones  
✅ **Sincronización WiFi** - Conecta vía red local

---

## 🛠️ Tecnologías

- **Backend:** Python 3.12 + Bottle
- **Frontend:** JavaScript + HTML/CSS
- **GUI:** PyQt5 + PyWebView  
- **Compilación:** PyInstaller
- **Exportación:** ReportLab (PDF)

---

## 📦 Estructura del Proyecto

```
espapp-env/
├── main.py                  # Aplicación principal
├── requirements.txt         # Dependencias Python
├── web/                     # Interfaz web
│   ├── index.html
│   ├── style.css
│   └── js/                  # Módulos JavaScript
├── scripts/                 # Build y compilación
│   ├── build_windows.py     # Compilador Windows
│   ├── build_deb.sh         # Compilador DEB
│   └── build_wrapper.py
└── docs/                    # Documentación
    ├── USUARIO.md           # Guía para usuarios
    ├── QUICKSTART.md        # Inicio rápido
    └── DESARROLLADOR.md     # Guía desarrollo
```

---

## 🚀 Inicio Rápido

### Para Usuarios

**Windows o Linux - Descargar ejecutable:**
1. Ve a [Releases](https://github.com/adriestevez23-byte/espapp/releases)
2. Descarga el instalador o portable
3. ¡Ejecuta y disfruta!

**Desde código fuente:**
```bash
git clone https://github.com/adriestevez23-byte/espapp.git
cd espapp-env
source bin/activate  # Linux/Mac
./start              # Inicia aplicación
```

📖 **[Guía completa de usuario](docs/USUARIO.md)** - Aprende a usar todas las funciones  
⚡ **[Quick Start](docs/QUICKSTART.md)** - 30 segundos para empezar

---

## 💡 Casos de Uso

- 📏 Medición de distancias con sensores ultrasónicos
- ⚡ Captura de datos de velocidad
- 🌡️ Monitoreo de temperatura y presión
- 📊 Análisis de experimentos científicos
- 🔍 Debugging de sensores ESP32

---

## 🆘 Soporte

- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Solución de problemas comunes
- **[Guía de errores GTK](docs/GUIA_RAPIDA_ERROR_GTK.md)** - Problemas gráficos
- **[Guía errores Node.js](docs/GUIA_RAPIDA_ERROR_NODEJS.md)** - Problemas web

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles

---

**v1.0.0** | Actualizado: Diciembre 2025

---

## 📄 Documentación

- [CHANGELOG.md](CHANGELOG.md) - Historial de versiones
- [SECURITY.md](SECURITY.md) - Política de seguridad y licencia
- [LICENSE](LICENSE) - Términos legales

---

## 🔒 Licencia

**Propiedad exclusiva - Licencia propietaria restrictiva**

✗ Prohibida la copia y distribución
✗ Prohibido el uso comercial sin autorización
✗ Prohibido el reverse engineering

Ver [LICENSE](LICENSE) para detalles completos.

---

## 📞 Contacto

**Adrian Estevez** - adriestevez23@gmail.com

---

Copyright © 2025 Adrian Estevez. Todos los derechos reservados.
