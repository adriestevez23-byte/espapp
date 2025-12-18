# Construir Instalador para Windows 10

## Requisitos

### En Linux (para construir el .exe):
```bash
# Instalar PyInstaller (si no está ya instalado)
pip install pyinstaller

# Opcional: Para construir NSIS en Windows
# pip install pyinstaller-nsis
```

## Método 1: Construir desde Linux (Recomendado)

### Paso 1: Instalar PyInstaller
```bash
source bin/activate
pip install pyinstaller
```

### Paso 2: Ejecutar el constructor
```bash
# Construir solo Windows
python build_windows.py

# O usar el script interactivo
bash build_all.sh
# Seleccionar opción 1 para Windows
```

### Paso 3: Archivo generado
```
windows_installer/
├── espapp.exe                    # Ejecutable principal
├── espapp-portable-1.0.0.zip     # Versión portable
├── ejecutar_espapp.bat           # Launcher batch
└── espapp_installer.nsi          # Script NSIS (requiere NSIS en Windows)
```

## Método 2: Construir desde Windows (Avanzado)

Si quieres crear un instalador .exe profesional, necesitas NSIS:

### Paso 1: Instalar NSIS en Windows
Descarga desde: https://nsis.sourceforge.io/

### Paso 2: En PowerShell o CMD
```powershell
# Navega al directorio del proyecto
cd C:\path\to\espapp-env

# Activar entorno
.\venv\Scripts\activate  # o bin\activate.ps1

# Ejecutar constructor
python build_windows.py
```

### Paso 3: Compilar instalador NSIS
```powershell
# NSIS compilará automáticamente si está en PATH
# Si no, abre manualmente:
"C:\Program Files (x86)\NSIS\makensis.exe" windows_installer\espapp_installer.nsi
```

## Distribución

### Para usuarios finales:
- **Recomendado**: `espapp-setup-1.0.0.exe` (instalador NSIS)
- **Alternativa**: `espapp-portable-1.0.0.zip` (sin instalación, solo extraer)
- **Directo**: `espapp.exe` (ejecutable simple)

### Características del instalador:
✅ Instala en `Program Files`
✅ Crea accesos de escritorio
✅ Añade a menú Inicio
✅ Entrada en Agregar/Quitar programas
✅ Desinstalador completo

## Archivos que se incluyen

El ejecutable incluye automáticamente:
- `web/` - Interfaz web (HTML, CSS, JS)
- `secciones.json` - Configuración de secciones
- `data.json` - Datos persistentes
- Todas las librerías Python requeridas

## Tamaño aproximado

- `espapp.exe`: 100-150 MB
- `espapp-portable-1.0.0.zip`: 50-80 MB (comprimido)

## Solución de problemas

### "pyinstaller no encontrado"
```bash
pip install pyinstaller
```

### "web directory not found"
Asegúrate de estar en el directorio correcto:
```bash
cd /home/alumnado/Adrian/espapp-env
```

### El .exe no ejecuta en Windows
1. Instala los Visual C++ Redistributables en Windows
2. Intenta ejecutar desde línea de comandos para ver el error
3. Revisa los logs en: `%APPDATA%\espapp-env\`

### Crear instalador sin NSIS
Si no tienes NSIS, distribuye el `.zip` portátil. Los usuarios pueden:
1. Extraer el ZIP
2. Ejecutar `espapp.exe`

## Automatización

Para builds automatizados, usa:
```bash
# Build todo
bash build_all.sh all

# Build solo Windows
bash build_all.sh windows

# Build solo Linux
bash build_all.sh linux
```

## Versiones soportadas

- ✅ Windows 10 (64-bit)
- ✅ Windows 11
- ✅ Linux (Ubuntu, Debian, etc.)
- ✅ Raspberry Pi (ARM32/ARM64)

---

**Más información**: Ver `docs/BUILD_DEB_GUIA_RAPIDA.md` para construcción de paquetes Debian
