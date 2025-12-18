# 🆘 Guía Rápida: Resolver Error de GTK/pywebview

## ⚡ Solución Rápida (si ya lo instalaste)

Si ya instalaste el paquete anterior y obtuviste el error:

```bash
# 1. Instalar GTK manualmente
sudo apt update
sudo apt install -y libgtk-3-dev libcairo2-dev libglib2.0-dev \
    libpango1.0-dev libatk1.0-dev libgdk-pixbuf2.0-dev

# 2. Intentar ejecutar nuevamente
esp32-medidor-velocidad

# ✅ Ahora debería funcionar
```

## 📝 Explicación del Error

```
webview.errors.WebViewException: 
  You must have either QT or GTK with Python extensions installed...
```

**Causa**: Faltan las librerías GTK del sistema necesarias para pywebview  
**Por qué**: El paquete anterior no las instalaba automáticamente

## ✅ Nuevo Paquete (Recomendado)

Si descargas el nuevo paquete, todo es automático:

```bash
# 1. Desinstalar anterior (opcional)
sudo apt remove esp32-medidor-velocidad
rm -rf /opt/espapp-env/

# 2. Instalar nuevo paquete
sudo dpkg -i esp32-medidor-velocidad_1.0_arm64.deb
sudo apt install -f

# 3. Ejecutar
esp32-medidor-velocidad

# ✅ GTK se instala automáticamente si falta
# ✅ El venv se crea correctamente
# ✅ Todo funciona
```

## 🔍 Verificar Estado

```bash
# ¿Está GTK instalado?
pkg-config --exists gtk+-3.0 && echo "✅ GTK OK" || echo "❌ GTK falta"

# ¿Funciona pywebview?
python3 -c "import webview; print('✅ pywebview OK')" 2>&1

# ¿Está instalado el paquete?
dpkg -l | grep esp32-medidor
```

## 📊 Comparativa

| Versión | Error de GTK | Instalación automática | Reinstalar GTK |
|---------|-------------|----------------------|-----------------|
| Anterior | ❌ Sí | No | Manual |
| Nueva | ✅ No | ✅ Sí | Automático |

## 🚀 Flujo Completo (Nuevo Paquete)

```bash
# Paso 1: Descargar y copiar
scp esp32-medidor-velocidad_1.0_arm64.deb pi@raspberry:/tmp/

# Paso 2: SSH a Raspberry Pi
ssh pi@raspberry

# Paso 3: Instalar
sudo dpkg -i /tmp/esp32-medidor-velocidad_1.0_arm64.deb

# En este punto:
# ✅ postinst detecta pywebview en requirements.txt
# ✅ Verifica que GTK está instalado
# ✅ Si no está → lo instala automáticamente

# Paso 4: Resolver dependencias si es necesario
sudo apt install -f

# Paso 5: Ejecutar
esp32-medidor-velocidad

# Primera ejecución:
# ✅ launcher verifica que GTK existe (ya instalado)
# ✅ crea el venv
# ✅ instala dependencias Python
# ✅ ejecuta la app
# Espera 30-60 segundos

# Siguientes ejecuciones:
# ✅ instantáneo
```

## 🛠️ Instalación Manual de GTK (si es necesario)

```bash
sudo apt update

# Opción 1: Instalar todo lo necesario
sudo apt install -y libgtk-3-dev libcairo2-dev libglib2.0-dev \
    libpango1.0-dev libatk1.0-dev libgdk-pixbuf2.0-dev

# Opción 2: Con versiones de runtime (más ligero)
sudo apt install -y libgtk-3-0 libcairo2 libglib2.0-0 \
    libpango-1.0-0 libatk1.0-0 libgdk-pixbuf2.0-0 \
    libgtk-3-dev libcairo2-dev libglib2.0-dev \
    libpango1.0-dev libatk1.0-dev libgdk-pixbuf2.0-dev
```

## ✨ Cambios en el Nuevo Paquete

### postinst (Post-instalación)
```bash
# Detecta automáticamente si usa pywebview
# Verifica si GTK está instalado
# Si no → lo instala
```

### Launcher (Primera ejecución)
```bash
# Verifica nuevamente que GTK existe
# Si falta → lo instala antes de crear el venv
```

## 🎯 Resumen

| Momento | Acción | Resultado |
|---------|--------|-----------|
| `sudo dpkg -i ...` | postinst intenta instalar GTK | ✅ GTK disponible |
| `esp32-medidor-velocidad` | launcher verifica GTK | ✅ Crea venv correctamente |
| Primera ejecución | Instala dependencias Python | ✅ App funciona |
| Siguientes ejecuciones | Inicia directamente | ✅ Instantáneo |

## 🆘 Si Aún Hay Problemas

### Error: "Command 'pkg-config' not found"
```bash
sudo apt install -y pkg-config
```

### Error: "Permission denied" en GTK install
```bash
# Asegúrate de usar sudo
sudo apt install -y libgtk-3-dev
```

### Error: GTK pero pywebview aún falla
```bash
# Reinstalar pywebview
source /opt/espapp-env/.venv/bin/activate
pip install --force-reinstall pywebview
```

### Necesito reinstalar todo
```bash
# 1. Desinstalar
sudo apt remove esp32-medidor-velocidad
rm -rf /opt/espapp-env/

# 2. Instalar nuevo paquete
sudo dpkg -i esp32-medidor-velocidad_1.0_arm64.deb
sudo apt install -f

# 3. Ejecutar
esp32-medidor-velocidad
```

---

**¡El nuevo paquete soluciona esto automáticamente!** ✅
