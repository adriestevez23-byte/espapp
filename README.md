# ESPAPP - ESP32 Sensor Manager

**Aplicación web multiplataforma para gestionar sensores conectados a ESP32**

---

## 🚀 Quick Start

### Windows / macOS / Linux

```bash
# Clonar repositorio
git clone https://github.com/adriestevez23-byte/espapp.git
cd espapp

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación
python main.py
```

Luego abre en tu navegador: **http://localhost:8000**

---

## 📦 Características

✅ Interfaz web responsiva con JavaScript puro
✅ Backend Python con Bottle framework
✅ Conexión WiFi a dispositivos ESP32
✅ Gestión de sensores en tiempo real
✅ Gráficos y visualización de datos
✅ Multiplataforma (Windows, Linux, macOS)
✅ Ejecutables compilados disponibles

---

## 📥 Descargas

### Ejecutables compilados

- **Windows (.exe)** → [Descargar desde Releases](https://github.com/adriestevez23-byte/espapp/releases)
- **Linux (.deb)** → [Descargar desde Releases](https://github.com/adriestevez23-byte/espapp/releases)
- **macOS (.app)** → [Descargar desde Releases](https://github.com/adriestevez23-byte/espapp/releases)

---

## 🛠️ Tecnologías

- **Python 3.12** - Backend
- **Bottle** - Framework web
- **PyWebView** - Interfaz nativa
- **JavaScript** - Frontend
- **PyInstaller** - Compilación de ejecutables

---

## 📁 Estructura

```
espapp/
├── main.py              Punto de entrada principal
├── requirements.txt     Dependencias Python
├── web/                 Interfaz web (HTML/CSS/JS)
├── scripts/             Scripts de compilación
│   ├── build_windows.py Compilador Windows
│   └── build_deb.sh     Compilador Linux
└── .github/workflows/   GitHub Actions (compilación automática)
```

---

## 🔧 Desarrollo

### Requisitos

- Python 3.12+
- pip (gestor de paquetes)

### Instalación local

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar en modo desarrollo
python main.py
```

---

## 🏗️ Compilación

### Generar ejecutable Windows

```bash
python scripts/build_windows.py
```

**Output:** `dist/espapp/espapp.exe`

### Generar paquetes Linux (.deb)

```bash
bash scripts/build_deb.sh all
```

**Output:** Paquetes en `paquetes/`

---

## ⚙️ GitHub Actions

La compilación se realiza automáticamente:

1. **Push a main** → Compila automáticamente
2. **Tags** → Crea releases con artefactos
3. **Pull requests** → Valida compilación

Los ejecutables están disponibles en la pestaña **Actions** → **Artifacts**

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles

---

## 👤 Autor

**Adrian Estevez**

---

## ⚡ Comandos rápidos

| Comando | Descripción |
|---------|------------|
| `./start` | Ejecutar servidor web (recomendado) |
| `./start gui` | Ejecutar interfaz gráfica |
| `./start build-windows` | Construir para Windows |
| `./start build-linux` | Construir para Linux |
| `./start help` | Ver ayuda completa |

---

## 📚 Documentación

### 🔰 Primeros pasos
👉 **Empieza aquí**: [INFO.txt](INFO.txt)

### ⚡ Guía rápida (5 minutos)
👉 **Leer**: [QUICKSTART.md](docs_project/QUICKSTART.md)

### 📖 Documentación completa
👉 **Ver**: [docs_project/README_COMPLETO.md](docs_project/README_COMPLETO.md)

### 💻 Para desarrolladores
👉 **Ver**: [docs_project/README.md](docs_project/README.md)

---

## ✨ Características

✅ Interfaz web responsive  
✅ Conexión WiFi a ESP32  
✅ Gestión de secciones y mediciones  
✅ Exportar/importar JSON  
✅ Generación de PDF  
✅ Tema claro/oscuro  
✅ Multiplataforma (Windows, Linux, Raspberry Pi)  

---

## 🛠️ Requisitos

- Python 3.8+
- pip
- Dependencias: `pip install -r requirements.txt`

---

## 🪟 Instaladores para Windows 10

```bash
# Construir instalador automático
python build_windows.py

# Genera:
# • espapp-setup-1.0.0.exe      (instalador profesional)
# • espapp-portable-1.0.0.zip    (versión portable)
```

---

## 🐧 Paquetes para Linux

```bash
# Construir paquetes .deb
bash scripts/build_deb.sh

# Instalar en Debian/Ubuntu
sudo apt install ./esp32-medidor-velocidad_1.0_amd64.deb
```

---

## 📞 ¿Problemas?

1. **Lee**: [INFO.txt](INFO.txt)
2. **Intenta**: `./start help`
3. **Consulta**: [docs_project/](docs_project/)

---

**Estado**: ✅ Listo para producción  
**Versión**: 1.0.0  
**Última actualización**: 18/12/2025
