# ⚡ Quick Start - ESP32 App

## 🚀 Ejecutar en 30 segundos

### Opción 1: Script automático (Recomendado)

```bash
cd /home/alumnado/Adrian/espapp-env
./START.sh
```

Selecciona **opción 1** → Abre http://localhost:8000

### Opción 2: Comando directo

```bash
cd /home/alumnado/Adrian/espapp-env
source bin/activate
USE_WEB=1 python main.py
```

## 🎯 Primeros pasos

### 1️⃣ Conectar a ESP32 (2 min)
- Click en ⚙️ (esquina superior derecha)
- Click en "🔄 Escanear redes"
- Selecciona tu ESP32
- Click "Conectar"
- ✅ Indicador verde = conectado

### 2️⃣ Crear una sección (1 min)
- Click en 📋 (gestionar secciones)
- Nombre: "Mi experimento"
- Columnas: "Tiempo;Valor;Unidad"
- Click "Crear Sección"

### 3️⃣ Capturar datos (1 min)
- Selecciona tu sección en la barra lateral
- Click "+ Añadir medición"
- Ingresa valores
- ✅ Datos guardados automáticamente

### 4️⃣ Exportar datos (30 seg)
- Abre 📋 gestionar secciones
- Click 📥 o 📄 PDF
- ¡Listo!

## 🪟 Windows 10

### Opción 1: Instalador (Recomendado)
```bash
# En Linux:
python build_windows.py

# En Windows:
windows_installer\espapp-setup-1.0.0.exe
```

### Opción 2: Portable
```bash
# Descargar: espapp-portable-1.0.0.zip
# Extraer
# Ejecutar: espapp.exe
```

## 🐧 Linux / Raspberry Pi

```bash
sudo apt install ./esp32-medidor-velocidad_1.0_amd64.deb
espapp
```

## 🔧 Solución rápida de problemas

| Problema | Solución |
|----------|----------|
| "❌ GTK no disponible" | Usar `USE_WEB=1 python main.py` |
| "❌ Puerto ocupado" | `lsof -i :8000` → `kill -9 <PID>` |
| "❌ No conecta a ESP32" | Verificar WiFi, revisar IP del ESP32 |
| "❌ Interfaz en blanco" | Refrescar navegador (Ctrl+F5) |

## 📱 URLs de acceso

- **Local**: http://localhost:8000
- **Remoto**: http://<tu-ip>:8000 (desde otra PC)
- **Móvil**: Abrir en navegador del móvil

## 📚 Más información

- Guía completa: `README_APP.md`
- Build Windows: `docs/BUILD_WINDOWS.md`
- Distribución: `DISTRIBUCION.md`

---

**¿Problema?** Revisa los logs o abre una terminal con Ctrl+C para ver mensajes de error.

**¿Listo?** ¡Disfruta ESP32 App! 🎉
