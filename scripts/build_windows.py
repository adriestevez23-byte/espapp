#!/usr/bin/env python3
"""
Script para construir un instalador de Windows 10 para ESP32 App
Requiere: PyInstaller y NSIS (Nullsoft Scriptable Install System)

Uso:
    python build_windows.py

Esto creará:
    - dist/espapp/ (carpeta con la aplicación)
    - build/ (archivos intermedios)
    - espapp-setup.exe (instalador)
"""

import os
import sys
import shutil
import subprocess
import platform
import time
from pathlib import Path
from datetime import datetime

# Códigos de color
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    NC = '\033[0m'  # Sin color

def show_progress_bar(current, total, label="", width=40):
    """Muestra una barra de progreso"""
    percent = (current / total) * 100
    filled = int(width * current // total)
    bar = "█" * filled + "░" * (width - filled)
    
    # Limitar el label para que quepa
    label = label[:30] if len(label) > 30 else label
    print(f"\r{Colors.CYAN}[{bar}] {percent:.1f}% {Colors.WHITE}{label}{Colors.NC}", end="", flush=True)
    
    if current == total:
        print()  # Nueva línea

def wait_with_countdown(seconds, message="Esperando"):
    """Muestra una cuenta regresiva"""
    for i in range(seconds, 0, -1):
        print(f"\r{Colors.YELLOW}⏳ {message}... {i}s{Colors.NC}", end="", flush=True)
        time.sleep(1)
    print(f"\r{Colors.GREEN}✅ {message} completado{Colors.NC}               ")

def log_step(step_num, total_steps, message):
    """Muestra un paso numerado"""
    print(f"\n{Colors.CYAN}[Paso {step_num}/{total_steps}]{Colors.NC} {Colors.WHITE}{message}{Colors.NC}")
    
def log_success(message):
    """Log exitoso"""
    print(f"{Colors.GREEN}✅ {message}{Colors.NC}")

def log_error(message):
    """Log error"""
    print(f"{Colors.RED}❌ {message}{Colors.NC}", file=sys.stderr)

def log_warning(message):
    """Log advertencia"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.NC}")

def log_info(message):
    """Log información"""
    print(f"{Colors.CYAN}ℹ️  {message}{Colors.NC}")

# Configuración
APP_NAME = "ESPAPP"
APP_VERSION = "1.0.0"
APP_PUBLISHER = "Adrian"
MAIN_SCRIPT = "main.py"
ICON_FILE = "web/icon.png"
DIST_DIR = "dist"
BUILD_DIR = "build"
OUTPUT_DIR = "windows_installer"

def check_pyinstaller():
    """Verifica si PyInstaller está instalado"""
    try:
        import PyInstaller
        log_success("PyInstaller encontrado")
        return True
    except ImportError:
        log_error("PyInstaller no está instalado")
        log_info("Instalalo con: pip install pyinstaller")
        return False

def build_executable():
    """Construye el ejecutable con PyInstaller"""
    log_step(1, 4, "Construyendo ejecutable...")
    
    # Limpiar builds anteriores con visualización
    if os.path.exists(BUILD_DIR):
        print(f"{Colors.YELLOW}Limpiando compilación anterior...{Colors.NC}")
        show_progress_bar(1, 3, "Eliminando compilaciones previas")
        time.sleep(0.3)
        shutil.rmtree(BUILD_DIR)
        show_progress_bar(2, 3, "Directorio limpiado")
        time.sleep(0.2)
        show_progress_bar(3, 3, "Listo para nueva compilación")
    
    if os.path.exists(DIST_DIR):
        print(f"{Colors.YELLOW}Limpiando distribuciones anteriores...{Colors.NC}")
        show_progress_bar(1, 2, "Eliminando dist anterior")
        time.sleep(0.2)
        shutil.rmtree(DIST_DIR)
        show_progress_bar(2, 2, "Directorio dist limpiado")
    
    cmd = [
        "pyinstaller",
        "--name=espapp",
        "--onefile",
        "--windowed",
        "--add-data=web:web",
        "--add-data=secciones.json:.",
        "--add-data=data.json:.",
        f"--icon={ICON_FILE}",
        f"--distpath={DIST_DIR}",
        f"--workpath={BUILD_DIR}",
        "--noconfirm",
        MAIN_SCRIPT
    ]
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.CYAN}🔨 Compilando para PyInstaller...{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=False)
        time.sleep(0.5)
        log_success("Ejecutable construido exitosamente")
        return True
    except subprocess.CalledProcessError as e:
        log_error(f"Error al construir: {e}")
        return False
    except FileNotFoundError:
        log_error("pyinstaller no encontrado en PATH")
        return False

def create_nsis_script():
    """Crea el script NSIS para el instalador"""
    log_info("Generando configuración NSIS...")
    
    nsis_script = f'''
; Script de instalador NSIS para {APP_NAME}
; Generado automáticamente - {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

!include "MUI2.nsh"

; Configuración básica
Name "{APP_NAME} {APP_VERSION}"
OutFile "espapp-setup-{APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\\{APP_NAME}"
RequestExecutionLevel admin

; MUI Settings
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Spanish"

; Installer sections
Section "Install"
    SetOutPath "$INSTDIR"
    
    ; Copiar archivos
    File /r "dist\\espapp\\*.*"
    
    ; Crear accesos directos en el menú Inicio
    CreateDirectory "$SMPROGRAMS\\{APP_NAME}"
    CreateShortcut "$SMPROGRAMS\\{APP_NAME}\\{APP_NAME}.lnk" "$INSTDIR\\espapp.exe"
    CreateShortcut "$SMPROGRAMS\\{APP_NAME}\\Desinstalar.lnk" "$INSTDIR\\uninstall.exe"
    
    ; Crear acceso directo en el escritorio
    CreateShortcut "$DESKTOP\\{APP_NAME}.lnk" "$INSTDIR\\espapp.exe"
    
    ; Crear entrada en Agregar/Quitar programas
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{APP_NAME}" "DisplayName" "{APP_NAME} {APP_VERSION}"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{APP_NAME}" "DisplayVersion" "{APP_VERSION}"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{APP_NAME}" "Publisher" "{APP_PUBLISHER}"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{APP_NAME}" "UninstallString" "$INSTDIR\\uninstall.exe"
    
    ; Crear desinstalador
    WriteUninstaller "$INSTDIR\\uninstall.exe"
SectionEnd

; Uninstaller section
Section "Uninstall"
    ; Eliminar archivos
    RMDir /r "$INSTDIR"
    
    ; Eliminar accesos directos
    RMDir /r "$SMPROGRAMS\\{APP_NAME}"
    Delete "$DESKTOP\\{APP_NAME}.lnk"
    
    ; Eliminar registro
    DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{APP_NAME}"
SectionEnd
'''
    
    nsis_file = os.path.join(OUTPUT_DIR, "espapp_installer.nsi")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    with open(nsis_file, 'w', encoding='utf-8') as f:
        f.write(nsis_script)
    
    log_success(f"Script NSIS creado: {nsis_file}")
    return nsis_file

def build_nsis_installer():
    """Construye el instalador NSIS"""
    log_step(4, 4, "Construyendo instalador NSIS...")
    
    # Buscar makensis.exe
    makensis_paths = [
        "C:\\Program Files\\NSIS\\makensis.exe",
        "C:\\Program Files (x86)\\NSIS\\makensis.exe",
        "makensis.exe",  # En PATH
    ]
    
    makensis_exe = None
    for path in makensis_paths:
        if shutil.which(path) or os.path.isfile(path):
            makensis_exe = path
            break
    
    if not makensis_exe:
        log_warning("NSIS no está instalado")
        log_info("Descargalo desde: https://nsis.sourceforge.io/")
        log_info("Sin NSIS, usa el método portable (carpeta dist/)")
        return False
    
    try:
        log_info("Compilando instalador...")
        show_progress_bar(1, 2, "Generando instalador")
        time.sleep(1)
        result = subprocess.run([makensis_exe, os.path.join(OUTPUT_DIR, "espapp_installer.nsi")], check=True)
        show_progress_bar(2, 2, "Instalador generado")
        log_success("Instalador NSIS construido exitosamente")
        return True
    except subprocess.CalledProcessError as e:
        log_error(f"Error al construir NSIS: {e}")
        return False

def create_portable_zip():
    """Crea un archivo ZIP portátil"""
    log_step(3, 4, "Creando versión portátil...")
    
    try:
        print(f"{Colors.YELLOW}Empaquetando archivos...{Colors.NC}")
        for i in range(1, 4):
            show_progress_bar(i, 3, f"Comprimiendo (paso {i})")
            time.sleep(0.5)
        
        shutil.make_archive(
            os.path.join(OUTPUT_DIR, f'espapp-portable-{APP_VERSION}'),
            'zip',
            os.path.join(DIST_DIR, 'espapp')
        )
        log_success(f"Versión portátil creada: espapp-portable-{APP_VERSION}.zip")
        return True
    except Exception as e:
        log_error(f"Error al crear ZIP: {e}")
        return False

def create_batch_launcher():
    """Crea un archivo .bat para ejecutar la app sin terminal"""
    batch_file = os.path.join(OUTPUT_DIR, "ejecutar_espapp.bat")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    batch_content = f"""@echo off
REM Ejecutor para ESP32 App
setlocal enabledelayedexpansion

cd /d "%~dp0"
start espapp.exe

exit /b 0
"""
    
    with open(batch_file, 'w', encoding='utf-8') as f:
        f.write(batch_content)
    
    log_success(f"Launcher .bat creado: {batch_file}")

def main():
    """Función principal"""
    # Banner
    print(f"\n{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.CYAN}🚀 Constructor de {APP_NAME} v{APP_VERSION}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")
    
    start_time = time.time()
    
    # Verificar requisitos
    print(f"{Colors.WHITE}Verificando dependencias...{Colors.NC}")
    if not check_pyinstaller():
        log_error("No se pueden continuar sin PyInstaller")
        sys.exit(1)
    
    print()  # Salto de línea
    
    # Construir ejecutable
    if not build_executable():
        print(f"\n{Colors.RED}{'='*60}{Colors.NC}")
        log_error("Construcción fallida")
        print(f"{Colors.RED}{'='*60}{Colors.NC}\n")
        sys.exit(1)
    
    print()  # Salto de línea
    
    # Crear launcher
    create_batch_launcher()
    
    print()  # Salto de línea
    
    # Crear versión portátil
    if not create_portable_zip():
        log_warning("No se pudo crear ZIP portátil, pero el ejecutable está listo")
    
    print()  # Salto de línea
    
    # Generar configuración NSIS
    create_nsis_script()
    
    # Intentar crear instalador NSIS (solo si estamos en Windows)
    if platform.system() == "Windows":
        build_nsis_installer()
    else:
        log_info("NSIS solo disponible en Windows")
        log_info("Para crear el instalador, ejecuta este script en Windows")
    
    # Tiempo total
    elapsed_time = time.time() - start_time
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.GREEN}✅ Construcción completada{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"\n📁 Archivos generados en: {Colors.CYAN}{OUTPUT_DIR}/{Colors.NC}")
    print(f"⏱️  Tiempo total: {Colors.YELLOW}{elapsed_time:.2f}s{Colors.NC}")
    
    print(f"\n{Colors.WHITE}Opciones:{Colors.NC}")
    print(f"  {Colors.CYAN}1.{Colors.NC} Versión portable: espapp-portable-*.zip")
    print(f"  {Colors.CYAN}2.{Colors.NC} Ejecutable: dist/espapp/espapp.exe")
    print(f"  {Colors.CYAN}3.{Colors.NC} Instalador NSIS: espapp-setup-*.exe (si NSIS está instalado)")
    
    print(f"\n{Colors.YELLOW}💡 Recomendación: Distribuir espapp-setup-*.exe a usuarios{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")

if __name__ == "__main__":
    main()
