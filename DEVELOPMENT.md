# 👨‍💻 Guía de Desarrollo

## ⚖️ Licencia

Este proyecto es **PROPIEDAD EXCLUSIVA**. 

Si estás viendo esto, tienes acceso autorizado. No compartas ni distribuyas sin permiso.

---

## 🚀 Configuración de Desarrollo

### Requisitos previos

- Python 3.12+
- pip (gestor de paquetes)
- Git
- 2GB de espacio libre (para builds)

### Instalación rápida

```bash
# Clonar repositorio
git clone https://github.com/adriestevez23-byte/espapp.git
cd espapp

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar en desarrollo
python main.py
```

---

## 📁 Estructura del Proyecto

```
espapp/
├── main.py                    Punto de entrada
├── requirements.txt           Dependencias Python
├── web/                       Frontend (HTML/CSS/JS)
├── scripts/
│   ├── build_windows.py      Compilador para Windows
│   ├── build_deb.sh          Compilador para Linux
│   └── build_wrapper.py      Wrapper para CI/CD
├── .github/
│   └── workflows/            GitHub Actions
└── docs/                      Documentación interna
```

---

## 🔧 Desarrollo Local

### Ejecutar servidor

```bash
source venv/bin/activate
python main.py
```

Abre: **http://localhost:8000**

### Estructura del código

**Backend (Python):**
- `main.py` - Servidor Bottle
- Expone APIs REST
- Gestiona conexión con ESP32

**Frontend (JavaScript):**
- HTML/CSS estático en `web/`
- JavaScript puro (sin frameworks)
- Comunicación vía fetch/AJAX

### Archivos importantes

- `web/index.html` - Interfaz principal
- `web/js/main.js` - Lógica principal del frontend
- `web/js/config.js` - Configuración

---

## 🧪 Testing

### Pruebas básicas

```bash
# Verificar sintaxis Python
python -m py_compile main.py scripts/*.py

# Verificar bash
bash -n scripts/build_deb.sh
```

### Testing manual

1. Abre http://localhost:8000
2. Verifica que se carga la interfaz
3. Prueba conectar con un ESP32
4. Verifica visualización de datos

---

## 🏗️ Build

### Windows (.exe)

```bash
python scripts/build_windows.py
```

**Salida:** `dist/espapp/espapp.exe`

### Linux (.deb)

```bash
echo "s" | bash scripts/build_deb.sh all
```

**Salida:** `paquetes/espapp_*.deb`

---

## 🚀 GitHub Actions

Los builds se ejecutan automáticamente:

**Triggers:**
- Push a `main` → Build automático
- Pull request → Build de verificación
- Manual: GitHub Actions tab → "Run workflow"

**Plataformas:**
- Windows (espapp.exe)
- Linux (.deb para 3 arquitecturas)
- macOS (.app)

---

## 📦 Dependencias

Ver `requirements.txt` para lista completa:

- **bottle** - Web framework
- **pywebview** - GUI nativa
- **pyinstaller** - Compilación de ejecutables
- **requests** - HTTP client
- **netifaces** - Network interfaces
- **pillow** - Procesamiento de imágenes

---

## 🐛 Debugging

### Python

```bash
# Debug verbose
python -u main.py

# IPython para debugging interactivo
python -m pdb main.py
```

### Logs

```bash
# Ver logs en tiempo real
tail -f *.log
```

---

## 📝 Commits

### Convención

```
[tipo] Descripción corta

[Fix] Arreglado bug en conexión WiFi
[Feature] Agregada gráfica de temperatura
[Docs] Actualizada documentación
[Refactor] Mejorada estructura de código
```

---

## 🔒 Seguridad

### Qué NO hacer

- ❌ Commitear credenciales
- ❌ Pushear datos sensibles
- ❌ Compartir tokens API
- ❌ Publicar en foros/StackOverflow

### Checklist pre-commit

- [ ] Sin contraseñas en el código
- [ ] Sin tokens de API
- [ ] Sin rutas locales hardcodeadas
- [ ] Sin archivos temporales
- [ ] Código sin errores de sintaxis

---

## 📞 Contacto

Para preguntas de desarrollo:
**adriestevez23@gmail.com**

---

## ⚖️ Derechos

Copyright © 2025 Adrian Estevez
Todos los derechos reservados.
