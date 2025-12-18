# 📦 Instrucciones de Distribución - ESP32 App

## Resumen rápido

### Para **Windows 10**:
1. Ejecuta: `python build_windows.py`
2. Distribuye: `windows_installer/espapp-setup-1.0.0.exe`

### Para **Linux / Raspberry Pi**:
1. Ejecuta: `bash build_deb.sh`
2. Distribuye: archivos `.deb` de `debian_pkg/`

---

## 🪟 Distribución Windows 10

### Opción A: Instalador ejecutable (RECOMENDADO)

**Ventaja**: Instalación simple, acceso desde menú Inicio, desinstalador automático

```bash
# 1. En Linux o Windows con Python
python build_windows.py

# 2. Genera archivo: espapp-setup-1.0.0.exe
# 3. Distribuir a usuarios

# En Windows, usuario ejecuta:
espapp-setup-1.0.0.exe
# Sigue los pasos del asistente
```

**Requisitos para usuarios**:
- Windows 10 (64-bit) o superior
- Visual C++ Redistributables (se instala automáticamente con el .exe)

### Opción B: Versión Portable (SIN INSTALACIÓN)

**Ventaja**: Usar desde USB, no necesita derechos de admin

```bash
# Distribuir: espapp-portable-1.0.0.zip

# Usuario:
# 1. Descarga el ZIP
# 2. Extrae en una carpeta (C:\Users\Usuario\Descargas\espapp)
# 3. Ejecuta: espapp.exe
```

### Opción C: Ejecutable directo

Para usuarios avanzados que solo quieren el `.exe`:

```bash
# Distribuir: windows_installer/espapp.exe
# Usuario ejecuta directamente
```

---

## 🐧 Distribución Linux / Debian / Ubuntu

### Sistema recomendado: Paquete .deb

```bash
# Generar paquetes
bash build_deb.sh

# Genera:
# debian_pkg/amd64/esp32-medidor-velocidad_1.0_amd64.deb
# debian_pkg/arm64/esp32-medidor-velocidad_1.0_arm64.deb
# debian_pkg/armv7l/esp32-medidor-velocidad_1.0_armv7l.deb
```

**Instalación para usuario**:

```bash
# Descargar según su arquitectura
# Para 64-bit (la mayoría)
sudo apt install ./esp32-medidor-velocidad_1.0_amd64.deb

# O simplemente:
sudo apt install esp32-medidor-velocidad_1.0_amd64.deb

# Ejecutar:
espapp

# O desde menú de aplicaciones
```

**Desinstalar**:
```bash
sudo apt remove esp32-medidor-velocidad
```

### Para Raspberry Pi

```bash
# ARMv7 (Pi 3, Pi Zero)
sudo apt install ./esp32-medidor-velocidad_1.0_armv7l.deb

# ARM64 (Pi 4, Pi 5)
sudo apt install ./esp32-medidor-velocidad_1.0_arm64.deb

# Ejecutar:
espapp
```

---

## 🍓 Distribución Raspberry Pi

### Instalación automática

```bash
# En Raspberry Pi:
bash <(curl -fsSL https://tu-servidor.com/install.sh)
```

O usando el paquete .deb:

```bash
wget https://tu-servidor.com/esp32-medidor-velocidad_1.0_armv7l.deb
sudo apt install ./esp32-medidor-velocidad_1.0_armv7l.deb
```

### Ejecutar como servicio (systemd)

```bash
# Crear archivo /etc/systemd/system/espapp.service

[Unit]
Description=ESP32 App
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi
ExecStart=/home/pi/espapp/bin/python /home/pi/espapp/main.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
sudo systemctl enable espapp
sudo systemctl start espapp
```

---

## 📋 Matriz de distribución

| Sistema | Archivo | Comando | Ventajas |
|---------|---------|---------|----------|
| Windows 10 | `espapp-setup-1.0.0.exe` | Ejecutar | Instalador profesional |
| Windows 10 | `espapp-portable-1.0.0.zip` | Extraer + ejecutar | Sin instalación, USB |
| Linux (amd64) | `esp32-medidor-velocidad_1.0_amd64.deb` | `apt install` | Gestor de paquetes |
| Linux (arm64) | `esp32-medidor-velocidad_1.0_arm64.deb` | `apt install` | Servidor/NAS ARM64 |
| Raspberry Pi | `esp32-medidor-velocidad_1.0_armv7l.deb` | `apt install` | RPi 3, Zero |
| macOS | Compilar | `pyinstaller` | Requiere compilación |

---

## 🔒 Seguridad en distribución

### Firmar instalador (Opcional pero recomendado)

**En Windows**:
```powershell
# Obtener certificado de seguridad
# Firmar ejecutable con SignTool

signtool sign /f certificado.pfx /p contraseña espapp-setup-1.0.0.exe
```

### Calcular hash SHA256

```bash
sha256sum espapp-setup-1.0.0.exe > espapp-setup-1.0.0.exe.sha256

# Los usuarios pueden verificar:
sha256sum -c espapp-setup-1.0.0.exe.sha256
```

---

## 🌐 Distribución en línea

### Opción 1: GitHub Releases

```bash
# 1. Crear repositorio en GitHub
# 2. Crear tag: v1.0.0
# 3. Crear release con archivos adjuntos:
#    - espapp-setup-1.0.0.exe
#    - espapp-portable-1.0.0.zip
#    - .deb files
#    - SHA256 checksums
```

### Opción 2: Servidor propio

```bash
# Crear estructura de descargas
/downloads/
  ├── windows/
  │   ├── espapp-setup-1.0.0.exe
  │   ├── espapp-portable-1.0.0.zip
  │   └── README.txt
  ├── linux/
  │   ├── espapp_1.0.0_amd64.deb
  │   ├── espapp_1.0.0_arm64.deb
  │   └── INSTALL.md
  └── CHECKSUMS.txt
```

### Opción 3: Package managers

- **AUR** (Arch Linux User Repository)
- **Snap** (Ubuntu/Linux)
- **Homebrew** (macOS)
- **Chocolatey** (Windows)

---

## 📊 Tamaños esperados

| Archivo | Tamaño (aprox.) |
|---------|-----------------|
| espapp.exe | 100-150 MB |
| espapp-setup-1.0.0.exe | 50-100 MB |
| espapp-portable-1.0.0.zip | 40-80 MB |
| .deb (amd64) | 50-100 MB |
| .deb (arm64) | 50-100 MB |
| .deb (armv7l) | 50-100 MB |

---

## ✅ Checklist de distribución

- [ ] Probar en Windows 10 (VM si es necesario)
- [ ] Probar en Ubuntu (amd64)
- [ ] Probar en Raspberry Pi (si aplica)
- [ ] Verificar que web/ se incluya en ejecutables
- [ ] Generar SHA256 checksums
- [ ] Crear archivo README de instalación
- [ ] Prueba de desinstalación
- [ ] Verificar accesos desde menú Inicio (Windows)
- [ ] Probar con conexión real a ESP32
- [ ] Documentar cambios en CHANGELOG

---

## 🆘 Soporte a usuarios

### Comandos de diagnóstico

```bash
# Linux
espapp --version
espapp --help
journalctl -u espapp -f  # Si está como servicio

# Windows
espapp.exe --help
```

### Logs

- **Windows**: `%APPDATA%\espapp\logs`
- **Linux**: `/home/usuario/.espapp/logs`
- **Raspberry**: `/home/pi/.espapp/logs`

---

**Última actualización**: 18/12/2025
