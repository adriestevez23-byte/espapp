#!/bin/bash
set -euo pipefail

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                  ESP32 MEDIDOR DE VELOCIDAD - BUILD DEB                   ║
# ║                     OPTIMIZADO PARA ENTORNOS VIRTUALES                    ║
# ║                                                                            ║
# ║  Solución:                                                                 ║
# ║    • Solo copia código fuente (NO el venv completo)                        ║
# ║    • Crea venv limpio en primera ejecución                                 ║
# ║    • Dependencias del sistema MÍNIMAS                                      ║
# ║    • Limpieza de caché y archivos temporales                               ║
# ╚════════════════════════════════════════════════════════════════════════════╝

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Función para barra de progreso
progress_bar() {
    local current=$1
    local total=$2
    local label=$3
    local width=30
    
    local percent=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    
    printf "\r${CYAN}[%-${width}s] %3d%% %s${NC}" "$(printf '#%.0s' $(seq 1 $filled))" "$percent" "$label"
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

# Función para espera visual
wait_with_dots() {
    local duration=$1
    local message=$2
    
    for ((i = 0; i < duration; i++)); do
        echo -ne "\r${YELLOW}⏳ ${message}$(printf '.%.0s' $(seq 1 $((i % 3 + 1))))   ${NC}"
        sleep 1
    done
    echo -e "\r${GREEN}✅ ${message}${NC}             "
}

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Configuración
APP_NAME="espapp"
VERSION="1.0"
PKG_DIR="debian_pkg"

# Seleccionar arquitectura
select_architecture() {
    print_header "SELECCIONAR ARQUITECTURA"
    
    echo -e "${CYAN}¿Qué arquitectura deseas compilar?${NC}\n"
    echo "  1) ${GREEN}arm64${NC}     - Raspberry Pi 4/5, Orange Pi (64-bit)"
    echo "  2) ${GREEN}armv7l${NC}    - Raspberry Pi 3/Zero, versiones antiguas"
    echo "  3) ${GREEN}amd64${NC}     - PC/Servidor (Intel/AMD 64-bit)"
    echo "  4) ${YELLOW}Todas${NC}     - Compilar para todas las arquitecturas"
    echo ""
    
    read -p "Selecciona una opción (1-4): " arch_option
    
    case $arch_option in
        1) ARCHS=("arm64") ;;
        2) ARCHS=("armv7l") ;;
        3) ARCHS=("amd64") ;;
        4) ARCHS=("arm64" "armv7l" "amd64") ;;
        *)
            print_error "Opción inválida"
            select_architecture
            ;;
    esac
}

if [ $# -gt 0 ]; then
    case $1 in
        arm64|armv7l|amd64|all)
            if [ "$1" = "all" ]; then
                ARCHS=("arm64" "armv7l" "amd64")
            else
                ARCHS=("$1")
            fi
            ;;
        *)
            print_error "Arquitectura no válida: $1"
            echo "Opciones: arm64, armv7l, amd64, all"
            exit 1
            ;;
    esac
else
    select_architecture
fi

# Banner inicial
clear
echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 ESP32 MEDIDOR DE VELOCIDAD - GENERADOR DE .DEB      ║
║                                                            ║
║   Versión: 1.0 (Optimizado para venv)                     ║
║   Arquitecturas: arm64, armv7l, amd64                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Mostrar resumen
print_header "CONFIGURACIÓN"
echo -e "  ${CYAN}Nombre de aplicación:${NC} $APP_NAME"
echo -e "  ${CYAN}Versión:${NC} $VERSION"
echo -e "  ${CYAN}Arquitectura(s):${NC} ${GREEN}${ARCHS[@]}${NC}"
echo -e "  ${CYAN}Directorio de salida:${NC} $PKG_DIR/"
echo ""
read -p "¿Continuar? (s/n): " confirm
if [[ ! $confirm =~ ^[Ss]$ ]]; then
    print_error "Compilación cancelada"
    exit 1
fi

# Procesar cada arquitectura
for ARCH in "${ARCHS[@]}"; do
    print_header "COMPILANDO PARA $ARCH"
    
    # 0. LIMPIAR ANTERIOR
    print_info "Limpiando compilación anterior..."
    progress_bar 1 2 "Eliminando archivos previos"
    sleep 0.3
    rm -rf "$PKG_DIR/$ARCH"
    progress_bar 2 2 "Limpieza completada"
    
    PKG_WORK="$PKG_DIR/$ARCH"
    
    print_info "Creando estructura de directorios..."
    mkdir -p "$PKG_WORK"/DEBIAN
    mkdir -p "$PKG_WORK"/opt/espapp-env
    mkdir -p "$PKG_WORK"/usr/local/bin
    mkdir -p "$PKG_WORK"/usr/share/applications
    print_success "Directorios creados"
    
    # ═══════════════════════════════════════════════════════════
    # PASO 1: COPIAR SOLO CÓDIGO FUENTE (NO EL VENV)
    # ═══════════════════════════════════════════════════════════
    print_header "PASO 1/6: Copiando archivos del proyecto"
    
    APP_DIR="$PKG_WORK/opt/espapp"
    
    # Crear estructura
    progress_bar 1 5 "Creando directorios"
    sleep 0.2
    mkdir -p "$APP_DIR/web"
    mkdir -p "$APP_DIR/backend"
    mkdir -p "$APP_DIR/backend_node"
    
    progress_bar 2 5 "Copiando código fuente"
    sleep 0.3
    # Copiar archivos raíz (sin documentación)
    cp -f main.py "$APP_DIR/" 2>/dev/null || true
    cp -f requirements.txt "$APP_DIR/" 2>/dev/null || true
    cp -f LICENSE "$APP_DIR/" 2>/dev/null || true
    cp -f data.json "$APP_DIR/" 2>/dev/null || true
    cp -f secciones.json "$APP_DIR/" 2>/dev/null || true
    
    progress_bar 3 5 "Copiando recursos web"
    sleep 0.2
    [ -d "web" ] && cp -rf web/* "$APP_DIR/web/" 2>/dev/null || true
    
    progress_bar 4 5 "Copiando backends"
    sleep 0.2
    [ -d "backend" ] && cp -rf backend/* "$APP_DIR/backend/" 2>/dev/null || true
    [ -d "backend_node" ] && cp -rf backend_node/* "$APP_DIR/backend_node/" 2>/dev/null || true
    
    progress_bar 5 5 "Archivos copiados"
    print_success "Código fuente copiado exitosamente"
    
    # ═══════════════════════════════════════════════════════════
    # PASO 2: LIMPIAR ARCHIVOS TEMPORALES
    # ═══════════════════════════════════════════════════════════
    print_header "PASO 2/6: Limpieza de archivos temporales"
    
    progress_bar 1 3 "Eliminando caché Python"
    sleep 0.3
    find "$APP_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$APP_DIR" -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    find "$APP_DIR" -type f -name "*.pyc" -delete 2>/dev/null || true
    find "$APP_DIR" -type f -name "*.log" -delete 2>/dev/null || true
    
    progress_bar 2 3 "Eliminando control de versiones"
    sleep 0.2
    find "$APP_DIR" -type d -name ".git" -exec rm -rf {} + 2>/dev/null || true
    find "$APP_DIR" -name ".gitignore" -delete 2>/dev/null || true
    
    progress_bar 3 3 "Limpieza completada"
    print_success "Archivos temporales eliminados"
    
    # ═══════════════════════════════════════════════════════════
    # PASO 3: CREAR LANZADOR
    # ═══════════════════════════════════════════════════════════
    print_header "PASO 3/6: Creando lanzador de la aplicación"
    
    cat > "$PKG_WORK/usr/local/bin/$APP_NAME" << 'LAUNCHER'
#!/bin/bash
set -e

# ============================================================================
# Lanzador ESPAPP - Se ejecuta al instalar el paquete
# Detecta/crea entorno virtual y lanza la aplicación
# ============================================================================

APP_DIR="/opt/espapp"
VENV_DIR="/opt/espapp/.venv"
PYTHON_VENV="$VENV_DIR/bin/python3"
PIP_VENV="$VENV_DIR/bin/pip"

if [ ! -f "$APP_DIR/main.py" ]; then
    echo "❌ Error: main.py no encontrado en $APP_DIR"
    exit 1
fi

# Si el venv no existe, crearlo (primera ejecución)
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Primera ejecución: creando entorno virtual..."
    
    # SIEMPRE instalar herramientas de compilación (necesarias para webview y otras librerías)
    echo "🔧 Instalando herramientas de compilación y dependencias..."
    sudo apt-get update -qq 2>/dev/null || true
    sudo apt-get install -y --no-install-recommends \
        python3-dev build-essential pkg-config \
        libgtk-3-dev libgtk-3-0 libcairo2-dev libcairo2 \
        python3-gi python3-gi-cairo gir1.2-gtk-3.0 \
        libwebkit2gtk-4.1-0 libwebkit2gtk-4.1-dev gir1.2-webkit2-4.1 \
        2>&1 | tail -5 || true
    
    # Crear venv con system-site-packages para acceder a python3-gi
    echo "🔧 Creando venv con --system-site-packages..."
    python3 -m venv --system-site-packages "$VENV_DIR"
    
    # Actualizar pip/setuptools/wheel en el venv
    echo "⬆️  Actualizando pip, setuptools, wheel..."
    "$PIP_VENV" install --upgrade pip setuptools wheel 2>&1 | tail -2 || true
    
    # Instalar requirements con preferencia por binarios precompilados
    if [ -f "$APP_DIR/requirements.txt" ]; then
        echo "📚 Instalando dependencias Python..."
        # Usar rutas estándar de pkg-config
        export PKG_CONFIG_PATH="/usr/lib/pkgconfig:/usr/share/pkgconfig:${PKG_CONFIG_PATH:-}"
        "$PIP_VENV" install --prefer-binary -r "$APP_DIR/requirements.txt" 2>&1 | tail -5 || {
            echo "⚠️  Problema en instalación, intentando solo con pywebview y bottle..."
            "$PIP_VENV" install --only-binary :all: pywebview bottle 2>&1 | tail -3 || {
                echo "⚠️  Binarios no disponibles, intentando compilar..."
                "$PIP_VENV" install --no-binary pywebview,bottle pywebview bottle 2>&1 | tail -3 || true
            }
        }
        
        # Verificar que bottle está instalado (crítico para modo web)
        if ! "$PYTHON_VENV" -c "import bottle" 2>/dev/null; then
            echo "⚠️  bottle no encontrado, intentando instalar..."
            "$PIP_VENV" install --prefer-binary bottle 2>&1 | tail -3 || true
        fi
    fi
    echo "✅ Entorno virtual creado exitosamente"
fi

# Verificar que el venv está en buen estado
if [ ! -f "$PYTHON_VENV" ]; then
    echo "❌ Error: python3 no encontrado en venv"
    exit 1
fi

# Verificar que webview está instalado, si no lo está, instalarlo
if ! "$PYTHON_VENV" -c "import webview" 2>/dev/null; then
    echo "⚠️  pywebview no encontrado, instalando..."
    export PKG_CONFIG_PATH="/usr/lib/pkgconfig:/usr/share/pkgconfig:${PKG_CONFIG_PATH:-}"
    
    # Intentar solo binarios primero
    "$PIP_VENV" install --only-binary :all: --force-reinstall pywebview 2>&1 | tail -3 || {
        # Si falla, intentar compilar
        "$PIP_VENV" install --no-binary pywebview --force-reinstall pywebview 2>&1 | tail -5 || {
            echo "❌ Error: No se pudo instalar pywebview"
            exit 1
        }
    }
fi

# Verificar que pywebview puede usar GTK (opcional, no bloquea)
if ! "$PYTHON_VENV" -c "import gi; gi.require_version('Gtk', '3.0'); from gi.repository import Gtk" 2>/dev/null; then
    echo "⚠️  GTK/pywebview no totalmente disponible"
    echo "    Intenta: sudo apt install python3-gi python3-gi-cairo libgtk-3-dev libwebkit2gtk-4.1-dev"
fi

# Verificar que bottle está instalado (crítico para servidor web)
if ! "$PYTHON_VENV" -c "import bottle" 2>/dev/null; then
    echo "⚠️  bottle no encontrado, intentando instalar..."
    "$PIP_VENV" install --prefer-binary bottle 2>&1 | tail -3 || true
fi

# Ejecutar aplicación con el python del venv
cd "$APP_DIR"
exec "$PYTHON_VENV" "$MAIN_PY" "$@"
LAUNCHER
    
    chmod 755 "$PKG_WORK/usr/local/bin/$APP_NAME"
    print_success "Lanzador creado"
    
    # ═══════════════════════════════════════════════════════════
    # PASO 4: CREAR ARCHIVO .DESKTOP
    # ═══════════════════════════════════════════════════════════
    print_header "PASO 4/6: Creando entrada de aplicación"
    
    cat > "$PKG_WORK/usr/share/applications/$APP_NAME.desktop" << 'DESKTOP'
[Desktop Entry]
Version=1.0
Type=Application
Name=ESPAPP
Comment=ESPAPP - Gestor de Sensores ESP32
Exec=/usr/local/bin/espapp
Icon=utilities-system-monitor
Terminal=false
Categories=Utility;Education;
StartupNotify=true
DESKTOP
    
    print_success "Archivo .desktop creado"
    
    # ═══════════════════════════════════════════════════════════
    # PASO 5: CONFIGURAR PAQUETE DEBIAN
    # ═══════════════════════════════════════════════════════════
    print_header "PASO 5/6: Configurando paquete Debian"
    
    # Crear control file con dependencias MÍNIMAS
    cat > "$PKG_WORK/DEBIAN/control" << 'CONTROL'
Package: espapp
Version: 1.0
Section: utils
Priority: optional
Architecture: ARCHITECTURE_PLACEHOLDER
Maintainer: ESP32 Team <info@espapp.local>
Installed-Size: INSTALLED_SIZE_PLACEHOLDER
Depends: python3 (>= 3.8), python3-venv, python3-pip, sudo
Recommends: python3-dev, build-essential, pkg-config, libgtk-3-dev, libgtk-3-0, libcairo2, libcairo2-dev, python3-gi, python3-gi-cairo, gir1.2-gtk-3.0, libwebkit2gtk-4.1-0 | libwebkit2gtk-4.0-37, libwebkit2gtk-4.1-dev | libwebkit2gtk-4.0-dev, gir1.2-webkit2-4.1 | gir1.2-webkit2-4.0, nodejs (>= 14), npm
Homepage: https://github.com/espapp/espapp
License: MIT
Description: ESPAPP - Gestor de Sensores ESP32
 Aplicación para gestionar dispositivos ESP32.
 Compatible con Raspberry Pi y sistemas Linux.
 .
 Requiere: Python 3.8+
 Opcional: Node.js 14+ (para backend Node)
CONTROL
    
    # Reemplazar placeholders
    sed -i "s/ARCHITECTURE_PLACEHOLDER/$ARCH/" "$PKG_WORK/DEBIAN/control"
    INSTALLED_SIZE=$(du -s "$APP_DIR" | awk '{print $1}')
    sed -i "s/INSTALLED_SIZE_PLACEHOLDER/$INSTALLED_SIZE/" "$PKG_WORK/DEBIAN/control"
    
    print_success "Archivo control creado"
    
    # ═══════════════════════════════════════════════════════════
    # PASO 6: SCRIPTS DE INSTALACIÓN/DESINSTALACIÓN
    # ═══════════════════════════════════════════════════════════
    print_header "PASO 6/6: Creando scripts de instalación"
    
    # postinst - Se ejecuta después de instalar
    install -m 755 /dev/null "$PKG_WORK/DEBIAN/postinst"
    cat >> "$PKG_WORK/DEBIAN/postinst" << 'POSTINST'
#!/bin/bash
set -e

APP_DIR="/opt/espapp-env"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ ESP32 Medidor - Post-instalación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Hacer ejecutables los scripts
chmod +x "$APP_DIR/run-hybrid.sh" 2>/dev/null || true

echo "✅ Verificación completada"
echo ""
echo "🚀 Para ejecutar la aplicación:"
echo "   espapp"
echo ""
echo "ℹ️  En la primera ejecución se creará el entorno virtual Python."
echo "    (Esto puede tardar 30-60 segundos)"
echo ""

exit 0
POSTINST
    
    # prerm - Se ejecuta antes de desinstalar
    install -m 755 /dev/null "$PKG_WORK/DEBIAN/prerm"
    cat >> "$PKG_WORK/DEBIAN/prerm" << 'PRERM'
#!/bin/bash
set -e

# Detener procesos de la aplicación
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true

exit 0
PRERM
    
    # postrm - Se ejecuta después de desinstalar
    install -m 755 /dev/null "$PKG_WORK/DEBIAN/postrm"
    cat >> "$PKG_WORK/DEBIAN/postrm" << 'POSTRM'
#!/bin/bash
set -e

case "$1" in
  purge)
    # Eliminar también el venv si existe
    rm -rf /opt/espapp 2>/dev/null || true
    ;;
  remove)
    # No eliminar en remove, solo en purge
    ;;
esac

exit 0
POSTRM
    
    print_success "Scripts de instalación creados"
    
    # ═══════════════════════════════════════════════════════════
    # CREAR PAQUETE .DEB
    # ═══════════════════════════════════════════════════════════
    print_header "CREANDO PAQUETE .DEB"
    
    # Crear paquete compatible con Debian 11 (gzip, no zst)
    export DPKG_DEB_COMPRESSOR=gzip
    export DEB_BUILD_COMPRESS_METHOD=gzip
    dpkg-deb -Z gzip --build "$PKG_WORK" 2>&1 | tail -1 || true
    
    # El archivo se genera como debian_pkg/arm64.deb, renombrarlo correctamente
    TEMP_DEB="${PKG_WORK}.deb"
    if [ ! -f "$TEMP_DEB" ]; then
        # Si no está, buscar en la carpeta debian_pkg
        TEMP_DEB=$(find debian_pkg -name "*.deb" -type f | head -1)
    fi
    
    DEB_NAME="${APP_NAME}_${VERSION}_${ARCH}.deb"
    if [ -f "$TEMP_DEB" ]; then
        mv "$TEMP_DEB" "$DEB_NAME" 2>/dev/null || true
    fi
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "  ✅ PAQUETE GENERADO EXITOSAMENTE"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📦 Archivo: $DEB_NAME"
    echo "📊 Tamaño:  $(du -h "$DEB_NAME" 2>/dev/null | awk '{print $1}')"
    echo ""
    
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "  📋 INFORMACIÓN DE INSTALACIÓN"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🔧 INSTALACIÓN EN OTRA MÁQUINA:"
echo "   scp ${APP_NAME}_${VERSION}_*.deb usuario@host:/tmp/"
echo "   sudo apt update"
echo "   sudo dpkg -i ${APP_NAME}_${VERSION}_*.deb"
echo "   sudo apt install -f  # Si hay errores de dependencias"
echo ""
echo "🚀 EJECUTAR:"
echo "   espapp"
echo ""
echo "🧹 DESINSTALAR:"
echo "   sudo apt remove espapp"
echo "   sudo apt autoremove  # Limpiar dependencias no usadas"
echo ""
echo "✅ ¡Compilación completada!"
echo ""
# ═══════════════════════════════════════════════════════════
# COPIAR PAQUETES A LA CARPETA paquetes/
# ═══════════════════════════════════════════════════════════

print_header "ORGANIZANDO PAQUETES"

mkdir -p paquetes
for DEB in espapp_*.deb; do
    if [ -f "$DEB" ]; then
        print_info "Copiando $DEB a paquetes/"
        cp "$DEB" paquetes/
    fi
done

echo ""
ls -lh paquetes/espapp_*.deb 2>/dev/null && print_success "Paquetes organizados en carpeta paquetes/"

echo ""
echo "📦 RESUMEN DE PAQUETES:"
echo ""
du -sh paquetes/
echo ""