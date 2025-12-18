# 📌 ESP32 App v1.0.0

**Gestor de sensores para ESP32 - Aplicación multiplataforma**

---

## 🚀 Iniciar en 10 segundos

```bash
./start
```

Luego abre: **http://localhost:8000**

---

## 📁 Estructura de archivos

```
espapp-env/
├── 📌 INFO.txt                  👈 Lee esto primero
├── 📌 QUICKSTART.md             👈 Guía rápida
├── 🚀 start                     👈 Ejecutable principal
│
├── main.py                      Backend principal
├── config.py                    Configuración
├── build_windows.py             Constructor Windows
├── requirements.txt             Dependencias Python
│
├── web/                         Interfaz web
│   ├── index.html
│   ├── style.css
│   └── js/                      JavaScript modules
│
├── scripts/                     Scripts de compilación
│   └── build_deb.sh            Constructor Linux
│
├── docs_project/               Toda la documentación
│   ├── README.md               Este archivo
│   ├── README_COMPLETO.md      Guía completa
│   ├── QUICKSTART.md           Guía rápida
│   ├── CAMBIOS_18_DICIEMBRE.md Resumen cambios
│   └── DISTRIBUCION.md         Distribución
│
└── docs/                       Documentación técnica (no tocar)
    └── ...
```

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
