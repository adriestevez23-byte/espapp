#!/bin/bash

# Script de inicio para la aplicación ESP32 con Sistema de Secciones
# Uso: bash START.sh o chmod +x START.sh && ./START.sh

clear
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║            ESP32 • Medidor de Velocidad - Sistema de Secciones                ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "main.py" ]; then
    echo "❌ Error: No se encontró main.py"
    echo "Asegúrate de ejecutar este script desde /home/alumnado/Adrian/espapp-env"
    exit 1
fi

echo "🔍 Verificando ambiente..."
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi
echo "✅ Python 3 encontrado: $(python3 --version)"

# Verificar virtualenv
if [ ! -d "bin" ] || [ ! -f "bin/activate" ]; then
    echo "⚠️  Ambiente virtual no encontrado. Creando..."
    python3 -m venv . 2>/dev/null
    echo "✅ Ambiente virtual creado"
fi

# Activar virtualenv
echo "📦 Activando ambiente virtual..."
source bin/activate

# Verificar dependencias
echo "🔍 Verificando dependencias..."
python3 -c "import pywebview" 2>/dev/null || {
    echo "⚠️  pywebview no instalado. Instalando..."
    pip install pywebview[gtk] 2>/dev/null
}
python3 -c "import reportlab" 2>/dev/null || {
    echo "⚠️  reportlab no instalado. Instalando..."
    pip install reportlab 2>/dev/null
}
echo "✅ Dependencias verificadas"

echo ""
echo "📊 Nuevo Sistema de Secciones Personalizables:"
echo "  ✓ Botón 📋 para gestionar secciones"
echo "  ✓ Tablas personalizadas dinámicas"
echo "  ✓ Columnas con fórmulas calculadas"
echo "  ✓ Exportación/Importación JSON"
echo "  ✓ Generación de PDF"
echo ""

echo "📚 Documentación disponible:"
echo "  • INDICE_DOCUMENTACION.md - Punto de entrada"
echo "  • GUIA_RAPIDA.md - Para usuarios"
echo "  • CHEAT_SHEET.txt - Referencia rápida"
echo "  • SECCIONES_README.md - Documentación técnica"
echo ""

echo "🚀 Iniciando aplicación..."
echo ""

# Iniciar la aplicación
python3 main.py

# Si la app se cierra, mostrar mensaje
echo ""
echo "👋 Aplicación cerrada"
echo ""
echo "Para ver documentación:"
echo "  cat INDICE_DOCUMENTACION.md"
echo "  cat GUIA_RAPIDA.md"
echo ""
