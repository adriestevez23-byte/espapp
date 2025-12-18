# 🚀 Guía de Despliegue

## 📋 Requisitos

### Windows 10/11
- Python 3.8+
- GTK 3 (opcional, pywebview usará WinForms nativo)
- Node.js 14+

### Linux (Ubuntu, Debian, Raspberry Pi)
- Python 3.8+
- GTK 3 (`libgtk-3-0`)
- Node.js 14+
- Compilador C (`build-essential`)

### Raspberry Pi (cualquier versión)
- Python 3.8+ (generalmente preinstalado)
- GTK 3
- Node.js 14+
- RAM: 512MB mínimo, 2GB recomendado

---

## 🖥️ Instalación en Ubuntu/Debian

### Paso 1: Instalar Dependencias del Sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y

# Dependencias GTK y Python
sudo apt-get install -y \
  python3-pip \
  python3-dev \
  python3-venv \
  libgtk-3-0 \
  libgtk-3-dev \
  libcairo2-dev \
  libglib2.0-0 \
  libpango-1.0-0 \
  nodejs \
  npm \
  git \
  build-essential
```

### Paso 2: Clonar o Descargar el Proyecto

```bash
# Opción A: Clonar desde repositorio
git clone <repo-url> espapp-env
cd espapp-env

# Opción B: Descargar ZIP
unzip espapp-env.zip
cd espapp-env
```

### Paso 3: Instalar Dependencias Python

```bash
# Crear entorno virtual
python3 -m venv .

# Activar entorno
source bin/activate

# Instalar dependencias
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Paso 4: Instalar Dependencias Node.js

```bash
cd backend_node/backend_node
npm install
cd ../..
```

### Paso 5: Ejecutar la Aplicación

```bash
# Asegurate de que estés en la carpeta raíz
source bin/activate

# Ejecutar
./run-hybrid.sh
```

---

## 🍓 Instalación en Raspberry Pi

### Opción A: Script Automático (Recomendado)

```bash
# Descargar el proyecto
git clone <repo-url> espapp-env
cd espapp-env

# Ejecutar script de instalación
chmod +x install-raspberry.sh
./install-raspberry.sh

# Lanzar la aplicación
./run-hybrid.sh
```

El script automáticamente:
- ✅ Actualiza el sistema
- ✅ Instala GTK y dependencias necesarias
- ✅ Crea entorno virtual
- ✅ Instala Python y módulos Node.js

### Opción B: Instalación Manual

```bash
# 1. Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# 2. Instalar dependencias críticas para Raspberry Pi
sudo apt-get install -y \
  python3-pip \
  python3-dev \
  python3-venv \
  libgtk-3-0 \
  libgtk-3-dev \
  libcairo2-dev \
  libglib2.0-0 \
  libglib2.0-dev \
  libpango-1.0-0 \
  libatk1.0-0 \
  libgdk-pixbuf2.0-0 \
  nodejs \
  npm \
  git \
  build-essential

# 3. Clonar proyecto
git clone <repo-url> espapp-env
cd espapp-env

# 4. Crear entorno virtual
python3 -m venv .
source bin/activate

# 5. Instalar dependencias Python
pip install --upgrade pip
pip install -r requirements.txt

# 6. Instalar dependencias Node.js
cd backend_node/backend_node
npm install
cd ../..

# 7. Ejecutar
./run-hybrid.sh
```

### Optimizaciones para Raspberry Pi

Para mejorar rendimiento en Raspberry Pi:

```bash
# Expandir sistema de archivos (tomar más espacio SD)
sudo raspi-config
# Selecciona: Advanced → Expand Filesystem

# Habilitar aceleración GPU
sudo raspi-config
# Selecciona: Advanced → GPU Memory → 128 (o más)

# Aumentar swap (para compilaciones)
sudo dphys-swapfile swapoff
# Editar /etc/dphys-swapfile: CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

---

## 📦 Instalación desde Paquete Debian (.deb)

### En Ubuntu/Debian

```bash
# Descargar o compilar el .deb
sudo dpkg -i esp32-medidor-velocidad_1.0_amd64.deb

# Si hay errores de dependencias:
sudo apt-get install -f

# Ejecutar (se instalará en /opt/espapp-env/)
/opt/espapp-env/run-hybrid.sh
```

### En Raspberry Pi (ARM64)

```bash
# Asegúrate de que el .deb sea ARM64
sudo dpkg -i esp32-medidor-velocidad_1.0_arm64.deb

# Si hay problemas:
sudo apt-get install -f

# Ejecutar
/opt/espapp-env/run-hybrid.sh
```

---

## 🐳 Instalación con Docker (Opcional)

### Crear Imagen Docker

```bash
# Crear archivo Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-bullseye

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libgtk-3-0 libcairo2-dev libglib2.0-0 \
    nodejs npm && \
    rm -rf /var/lib/apt/lists/*

# Copiar proyecto
COPY . .

# Instalar Python
RUN pip install --no-cache-dir -r requirements.txt

# Instalar Node.js
RUN cd backend_node/backend_node && npm install

# Exposer puerto
EXPOSE 5000

# Ejecutar
CMD ["./run-hybrid.sh"]
EOF

# Compilar imagen
docker build -t espapp:latest .
```

### Ejecutar Contenedor

```bash
docker run -it \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=$DISPLAY \
  espapp:latest
```

---

## 🔧 Configuración Post-Instalación

### 1. Crear Acceso Directo (Ubuntu)

```bash
# Crear archivo .desktop
cat > ~/.local/share/applications/espapp.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=ESP32 Medidor
Exec=/path/to/espapp-env/run-hybrid.sh
Icon=utilities-system-monitor
Categories=Utility;
EOF

# Hacer ejecutable
chmod +x ~/.local/share/applications/espapp.desktop
```

### 2. Iniciar como Servicio Systemd (Raspberry Pi)

```bash
# Crear archivo de servicio
sudo tee /etc/systemd/system/espapp.service << 'EOF'
[Unit]
Description=ESP32 Medidor de Velocidad
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/espapp-env
ExecStart=/home/pi/espapp-env/run-hybrid.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Habilitar y iniciar
sudo systemctl enable espapp
sudo systemctl start espapp

# Ver logs
sudo systemctl status espapp
journalctl -u espapp -f
```

### 3. Autostart en Interfaz Gráfica (Raspberry Pi)

```bash
# Crear archivo de autostart
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/espapp.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=ESP32 App
Exec=/home/pi/espapp-env/run-hybrid.sh
EOF
```

---

## 📊 Verificación de Instalación

```bash
# Verificar Python
python3 --version
pip list | grep -E "pywebview|bottle|requests"

# Verificar Node.js
node --version
npm --version

# Verificar GTK (Linux)
pkg-config --exists gtk+-3.0 && echo "GTK OK" || echo "GTK no encontrado"

# Verificar que los archivos están
test -f main.py && echo "main.py OK"
test -f backend_node/backend_node/server.js && echo "Backend OK"
test -d web && echo "Frontend OK"
```

---

## 🆘 Troubleshooting de Instalación

### Error: "No module named 'webview'"
```bash
source bin/activate
pip install pywebview==6.1
```

### Error: "GTK not found" (Linux)
```bash
# Ubuntu/Debian
sudo apt-get install libgtk-3-0 libgtk-3-dev

# Raspberry Pi
sudo apt-get install libgtk-3-0 libgtk-3-dev libcairo2-dev
```

### Error: "Node modules not found"
```bash
cd backend_node/backend_node
npm install
```

### Error: "Port 5000 already in use"
```bash
# Encontrar proceso en puerto 5000
lsof -i :5000

# Matar proceso
kill -9 <PID>

# O cambiar puerto en backend_node/backend_node/server.js
```

### Ralentitud en Raspberry Pi
- Asegúrate de tener 2GB+ RAM disponible
- Cierra navegadores y aplicaciones pesadas
- Considera usar una tarjeta SD rápida (Clase 10)

---

## 📝 Logs y Debugging

```bash
# Logs de la aplicación
tail -f pywebview.log
tail -f backend_node.log

# Logs de sistema (si instalado como servicio)
journalctl -u espapp -f

# Ver procesos
ps aux | grep -E "python|node"

# Ver puertos
netstat -tlnp | grep 5000
```

---

## ✅ Checklist de Despliegue

- [ ] Sistema operativo actualizado
- [ ] Dependencias del sistema instaladas
- [ ] Python 3.8+ instalado
- [ ] Entorno virtual creado
- [ ] Dependencias Python instaladas
- [ ] Node.js 14+ instalado
- [ ] Dependencias Node.js instaladas
- [ ] Script run-hybrid.sh ejecutable
- [ ] Backend responde en localhost:5000
- [ ] Frontend se abre sin errores
- [ ] Conexión a ESP32 funciona

---

**Última actualización:** 15 de diciembre de 2025
**Versión:** 2.0
