#!/usr/bin/env python3
"""
Build wrapper para GitHub Actions
Ejecuta build_windows.py con mejor manejo de errores
"""

import os
import sys
import subprocess

def main():
    # Crear directorios necesarios
    os.makedirs("dist", exist_ok=True)
    os.makedirs("build", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    # Asegurar que estamos en el directorio correcto
    if not os.path.exists("main.py"):
        print("ERROR: main.py no encontrado. Ejecuta desde la raíz del proyecto.")
        sys.exit(1)
    
    # Verificar sintaxis de main.py
    result = subprocess.run(
        [sys.executable, "-m", "py_compile", "main.py"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print("ERROR: Sintaxis inválida en main.py:")
        print(result.stderr)
        sys.exit(1)
    
    # Mostrar información del entorno
    print("=" * 60)
    print("🔨 ESPAPP Build Environment")
    print("=" * 60)
    print(f"Python: {sys.version}")
    print(f"Platform: {sys.platform}")
    print(f"CWD: {os.getcwd()}")
    print("=" * 60)
    print()
    
    # Ejecutar build_windows.py
    result = subprocess.run(
        [sys.executable, "scripts/build_windows.py"],
        capture_output=False
    )
    
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
