# 🚀 Generar .exe con GitHub Actions

## ¿Qué es GitHub Actions?

GitHub Actions es un servicio que ejecuta **código automáticamente en máquinas virtuales reales** (Windows, Linux, macOS).

Hemos configurado un workflow que:
- ✅ Genera `.exe` en Windows automáticamente
- ✅ Genera paquetes `.deb` en Linux
- ✅ Genera ejecutable en macOS
- ✅ Guarda los archivos como "artefactos" descargables

## Pasos para conseguir el .exe

### 1. Subir código a GitHub

```bash
# Si ya tienes repo en GitHub
git add .
git commit -m "Build files"
git push

# Si no tienes repo aún
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/espapp-env.git
git push -u origin main
```

### 2. Ver Actions en GitHub

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **"Actions"**
3. Verás el workflow "Generar .exe para Windows" ejecutándose
4. Espera a que termine (2-3 minutos)

### 3. Descargar los artefactos

1. Haz clic en el build completado
2. Desplázate hasta "Artifacts"
3. Descarga **"espapp-windows"**
4. Dentro estará **`espapp.exe`**

## ¿Qué genera cada vez?

- **espapp.exe** - Ejecutable Windows (150-200MB)
- **Paquetes .deb** - Para Linux (45KB cada uno)
- **Ejecutable Linux** - Para Raspberry Pi (259MB)
- **Ejecutable macOS** - Para Apple

## Ejecución manual

Si quieres ejecutar el workflow manualmente sin hacer push:

1. Ve a Actions
2. Selecciona "Generar .exe para Windows"
3. Haz clic en "Run workflow"
4. Selecciona la rama (main)
5. Haz clic en "Run workflow" nuevamente

## Variables de entorno (opcional)

Puedes agregar secretos en GitHub para versioning automático:

1. Settings → Secrets and variables → Actions
2. Agrega GITHUB_TOKEN (automático)
3. El workflow creará releases automáticamente con tags

## Archivos de configuración

El archivo `.github/workflows/build-windows.yml` contiene:

```yaml
- Trigger: Al hacer push a main o pull_request
- Windows: Genera .exe con Python 3.12
- Linux: Genera .deb con Python 3.12
- macOS: Genera app con Python 3.12
- Artefactos: Se guardan por 30 días
- Releases: Si haces git tag, crea release automática
```

## Ventajas

✅ **No necesitas Windows instalado**
✅ **Se genera automáticamente con cada push**
✅ **Multiplataforma: Windows + Linux + macOS**
✅ **Archivos listos para descargar**
✅ **Historial de builds**
✅ **Integración con releases de GitHub**

## Troubleshooting

### El build falla
- Verifica que `requirements.txt` esté actualizado
- Revisa el log del build en Actions
- Asegúrate de que `scripts/build_windows.py` es correcto

### No aparece el artefacto
- Espera a que termine el build (verde ✅)
- Desplázate hasta la sección "Artifacts"
- Si sigue sin aparecer, revisa los logs

### ¿Y si no tengo GitHub?

Alternativas:
1. **GitLab** - Tiene CI/CD similar
2. **Azure Pipelines** - Cloud pipelines
3. **Jenkins** - Self-hosted
4. **VirtualBox** - VM local con Windows

---

**¡Listo! Ahora puedes generar .exe sin tener Windows instalado! 🎉**
