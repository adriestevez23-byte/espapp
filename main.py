import webview
import platform
import subprocess
import json
import time
import netifaces
import requests
import ipaddress
import os
import sys
# Intentar importar PyQt5 con fallback
QtCore = None
QtWebEngineWidgets = None
try:
    from PyQt5 import QtCore
    print("[DEBUG] PyQt5.QtCore importado correctamente")
    try:
        from PyQt5 import QtWebEngineWidgets
        print("[DEBUG] PyQt5.QtWebEngineWidgets importado correctamente")
    except Exception as e:
        print(f"[DEBUG] PyQt5.QtWebEngineWidgets no disponible: {e}")
        try:
            import PyQt5.QtWebEngineWidgets as QtWebEngineWidgets
            print("[DEBUG] PyQt5.QtWebEngineWidgets importado vía path alternativo")
        except Exception as e2:
            print(f"[DEBUG] PyQt5.QtWebEngineWidgets no disponible (alternativo): {e2}")
            QtWebEngineWidgets = None
except Exception as e:
    print(f"[DEBUG] PyQt5.QtCore no disponible: {e}. Continuando sin soporte QT.")
    QtCore = None
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    REPORTLAB_AVAILABLE = True
except Exception:
    REPORTLAB_AVAILABLE = False


# ===================================================
#       FUNCIONES AUXILIARES PARA DETECTAR IP ESP32
# ===================================================
def get_wifi_interface_ip():
    """Obtiene la IP de la interfaz WiFi actual."""
    for iface in netifaces.interfaces():
        addrs = netifaces.ifaddresses(iface)
        if netifaces.AF_INET in addrs:
            ip = addrs[netifaces.AF_INET][0]['addr']
            if ip.startswith(("192.168.", "10.", "172.")):
                return iface, ip
    return None, None


def arp_scan():
    """Escanea la tabla ARP del sistema y devuelve IPs encontradas."""
    try:
        result = subprocess.run(["arp", "-an"], capture_output=True, text=True)
        lines = result.stdout.split("\n")
        ips = []
        for l in lines:
            if "(" in l and ")" in l:
                ip = l.split("(")[1].split(")")[0].strip()
                ips.append(ip)
        return ips
    except Exception as e:
        print("[ERROR] arp_scan:", e)
        return []


def find_esp32(subnet):
    """Busca la IP real del ESP32 probando /data."""
    print(f"[SCAN] Escaneando subred {subnet} en busca del ESP32...")
    possible_ips = arp_scan()
    print(f"[SCAN] IPs encontradas en ARP: {possible_ips}")

    for ip in possible_ips:
        try:
            r = requests.get(f"http://{ip}/data", timeout=0.5)
            if r.status_code == 200:
                try:
                    _ = r.json()  # validar que sea JSON
                    print(f"[ESP32] ¡ESP32 detectado en {ip}!")
                    return f"http://{ip}"
                except json.JSONDecodeError:
                    pass
        except Exception:
            pass

    print("[SCAN] No se detectó el ESP32 en ARP.")
    return None


# ===================================================
#                API EXPUESTA A JS
# ===================================================
class API:

    def __init__(self):
        self.esp32_ip = None
        self.window = None

    def set_window(self, window):
        """Guarda la referencia de la ventana"""
        self.window = window

    def minimize_window(self):
        """Minimiza la ventana"""
        if self.window:
            self.window.minimize()

    def toggle_maximize_window(self):
        """Maximiza/restaura la ventana"""
        if self.window:
            if self.window.maximize is not None:
                self.window.maximize()

    def close_window(self):
        """Cierra la ventana"""
        if self.window:
            self.window.destroy()

    # ------------------------------------------------
    def log_js(self, level, message):
        """Recibe mensajes de consola desde la página web y los registra en un fichero."""
        try:
            base = os.path.dirname(os.path.abspath(__file__))
            logdir = os.path.join(base, "logs")
            os.makedirs(logdir, exist_ok=True)
            logfile = os.path.join(logdir, "web_console.log")
            ts = time.strftime('%Y-%m-%d %H:%M:%S')
            # Normalizar mensaje a string
            msg = str(message)
            with open(logfile, "a", encoding="utf-8") as f:
                f.write(f"[{ts}] {level.upper()}: {msg}\n")
            print(f"[WEBJS {level}] {msg}")
            return True
        except Exception as e:
            print("[ERROR] log_js:", e)
            return False

    # ------------------------------------------------
    def scan_wifi(self):
        system = platform.system()
        redes = []

        if system == "Linux":
            try:
                result = subprocess.run(
                    ["nmcli", "-t", "-f", "SSID,SECURITY,SIGNAL", "d", "wifi"],
                    capture_output=True, text=True
                )
                for linea in result.stdout.strip().split("\n"):
                    if linea:
                        parts = linea.split(":")
                        if len(parts) >= 3:
                            ssid = str(parts[0]).strip()
                            secure_str = str(parts[1]).strip()
                            signal_str = str(parts[2]).strip()
                            
                            # Asegurar que ssid es válido
                            if not ssid:
                                continue
                            
                            # Convertir valores de forma segura
                            try:
                                signal = int(signal_str) if signal_str else 0
                            except (ValueError, TypeError):
                                signal = 0
                            
                            # bool(secure_str) será True si la cadena no está vacía
                            secure = bool(secure_str and len(secure_str.strip()) > 0)
                            
                            # Construir diccionario con tipos primitivos
                            red = {
                                "ssid": ssid,
                                "secure": secure,
                                "signal": signal
                            }
                            redes.append(red)
                            
            except Exception as e:
                print("[ERROR] scan_wifi Linux:", e)
                return {"ok": False, "msg": f"Error escaneando: {str(e)}"}

        elif system == "Windows":
            try:
                result = subprocess.run(
                    ["netsh", "wlan", "show", "networks", "mode=Bssid"],
                    capture_output=True, text=True
                )
                lines = result.stdout.split("\n")
                ssid = ""
                for l in lines:
                    l = l.strip()
                    if l.startswith("SSID "):
                        ssid = str(l.split(":", 1)[1].strip())
                    if "Signal" in l and ssid:
                        try:
                            signal = int(l.split(":", 1)[1].replace("%", "").strip())
                        except (ValueError, TypeError):
                            signal = 0
                        
                        red = {
                            "ssid": ssid,
                            "secure": True,
                            "signal": signal
                        }
                        redes.append(red)
                        
            except Exception as e:
                print("[ERROR] scan_wifi Windows:", e)
                return {"ok": False, "msg": f"Error escaneando: {str(e)}"}

        # Serializar a JSON y deserializar para asegurar tipos primitivos
        try:
            redes_limpio = json.loads(json.dumps(redes))
            payload = {"ok": True, "networks": redes_limpio}
            print(f"[INFO] Redes encontradas: {len(redes_limpio)} redes")
            # Devolver como string JSON para evitar que pywebview lo envuelva en Proxy
            return json.dumps(payload)
        except Exception as e:
            print("[ERROR] Error serializando redes:", e)
            return json.dumps({"ok": False, "msg": f"Error procesando redes: {str(e)}"})

    # ------------------------------------------------
    def connect_to_esp32(self, ssid, password=""):
        system = platform.system()
        print(f"[INFO] Conectando a red: {ssid}")

        try:
            if system == "Linux":
                cmd = ["nmcli", "d", "wifi", "connect", ssid]
                if password:
                    cmd += ["password", password]
                res = subprocess.run(cmd, capture_output=True, text=True)
                if res.returncode != 0:
                    print("[ERROR] Error al conectar:", res.stderr.strip())
                    return {"ok": False, "msg": res.stderr.strip()}

            elif system == "Windows":
                cmd = ["netsh", "wlan", "connect", f"name={ssid}"]
                res = subprocess.run(cmd, capture_output=True, text=True)
                if res.returncode != 0:
                    print("[ERROR] Error al conectar:", res.stderr.strip())
                    return {"ok": False, "msg": res.stderr.strip()}

            else:
                return {"ok": False, "msg": f"Sistema no soportado ({system})"}

        except Exception as e:
            print("[ERROR] connect_to_esp32:", e)
            return {"ok": False, "msg": str(e)}

        print("[INFO] Conexión establecida. Buscando IP del ESP32...")
        time.sleep(2)

        # Si se conectó a ESP32-SENSORES (Punto de Acceso), usar IP fija del AP
        if "ESP32" in ssid or "esp32" in ssid:
            print("[INFO] Detectado SSID de ESP32 (AP). Intentando con IP 192.168.4.1...")
            try:
                r = requests.get("http://192.168.4.1/data", timeout=1)
                if r.status_code == 200:
                    try:
                        _ = r.json()
                        self.esp32_ip = "http://192.168.4.1"
                        print("[ESP32] ¡ESP32 detectado en 192.168.4.1 (AP)!")
                        return {"ok": True, "ip": "192.168.4.1", "msg": "ESP32 detectado"}
                    except json.JSONDecodeError:
                        pass
            except Exception as e:
                print(f"[INFO] No hay ESP32 en 192.168.4.1: {e}")

        # Si no es un AP ESP32 o el AP no respondió, intentar escaneo de subred
        iface, ip = get_wifi_interface_ip()
        if not iface:
            return {"ok": False, "msg": "No se pudo obtener la IP de la interfaz WiFi"}

        subnet = str(ipaddress.IPv4Network(ip + "/24", strict=False))
        esp_ip = find_esp32(subnet)

        if esp_ip:
            self.esp32_ip = esp_ip
            return {"ok": True, "ip": esp_ip, "msg": "ESP32 detectado"}

        return {"ok": False, "msg": "No se detectó la IP del ESP32"}

    # ------------------------------------------------
    def get_esp32_ip(self):
        if self.esp32_ip:
            return {"ok": True, "ip": self.esp32_ip}
        return {"ok": False, "msg": "No conectado a ESP32"}

    # ------------------------------------------------
    def fetch_data_from_esp32(self):
        if not self.esp32_ip:
            return {"ok": False, "msg": "No conectado a ESP32"}
        try:
            r = requests.get(f"{self.esp32_ip}/data", timeout=1.5)
            r.raise_for_status()
            if r.text.strip() == "":
                return {"ok": False, "msg": "Respuesta vacía del ESP32"}
            # Intentar parsear JSON y normalizar formatos.
            # Aceptamos varias formas que pueden devolver distintos ESPs:
            # 1) { "ok": true, "measurements": [ ... ] }
            # 2) { "tiempo": ..., "velocidad": ..., "metros": ... }  (objeto simple)
            # 3) [ { .. }, { .. } ]  (lista de mediciones)
            data = r.json()

            measurements = []
            if isinstance(data, dict):
                # Caso 1: ya viene con key 'measurements'
                if "measurements" in data and isinstance(data["measurements"], list):
                    measurements = data["measurements"]
                # Caso 2: objeto simple con keys de medición -> envolver en lista
                elif any(k in data for k in ("tiempo", "velocidad", "metros", "dia", "hora")):
                    measurements = [data]
                # Caso fallback: si tiene 'ok' y otros campos inesperados, intentar extraer measurements
                elif "ok" in data and isinstance(data.get("ok"), bool):
                    # si no tenemos measurements, devolver un array vacío para indicar ok
                    measurements = []
                else:
                    # Desconocido: envolverlo para no romper la app
                    measurements = [data]
            elif isinstance(data, list):
                measurements = data
            else:
                return {"ok": False, "msg": "Formato de datos desconocido del ESP32"}

            return {"ok": True, "measurements": measurements}
        except requests.exceptions.RequestException as e:
            return {"ok": False, "msg": str(e)}
        except json.JSONDecodeError:
            return {"ok": False, "msg": "JSON inválido"}

    # ------------------------------------------------
    def send_distance_to_esp32(self, valor, unidad):
        """Envía la distancia y unidad al ESP32 con logs detallados."""
        if not self.esp32_ip:
            print("[ERROR] No conectado a ESP32")
            return {"ok": False, "msg": "No conectado a ESP32"}
        
        try:
            # Construir URL con parámetros: valor + unidad
            url = f"{self.esp32_ip}/set_distancia?valor={valor}&unidad={unidad}"
            print(f"[INFO] Enviando distancia al ESP32: {url}")
            
            r = requests.get(url, timeout=2)
            r.raise_for_status()
            
            data = r.json()
            print(f"[INFO] Respuesta del ESP32: {data}")
            
            if data.get("ok"):
                metros = data.get("metros", 0)
                print(f"[INFO] Distancia configurada en ESP32: {valor} {unidad} = {metros}m")
                return {"ok": True, "msg": f"Distancia enviada: {valor} {unidad}", "metros": metros}
            else:
                msg = data.get("msg", "Error desconocido")
                print(f"[ERROR] ESP32 rechazó la distancia: {msg}")
                return {"ok": False, "msg": msg}
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Error enviando distancia: {e}")
            return {"ok": False, "msg": str(e)}
        except json.JSONDecodeError:
            print(f"[ERROR] JSON inválido en respuesta de ESP32")
            return {"ok": False, "msg": "JSON inválido en respuesta"}

    # ------------------------------------------------
    # 🔧 save_file (CORREGIDO)
    # ------------------------------------------------
    def save_file(self, data, suggested_name="download.txt"):
        """Diálogo nativo para guardar archivos sin el bug de 'Cancelado'."""
        path = None
        try:
            if self.window:

                # Tipos de archivo sugeridos
                file_types = []
                if suggested_name.endswith('.json'):
                    file_types = [('JSON', '*.json'), ('Todos', '*.*')]
                elif suggested_name.endswith('.html'):
                    file_types = [('HTML', '*.html'), ('Todos', '*.*')]
                else:
                    file_types = [('Todos', '*.*')]

                # -------- DIÁLOGO DE GUARDADO CORRECTO --------
                try:
                    paths = self.window.create_file_dialog(
                        webview.SAVE_DIALOG,
                        save_filename=suggested_name,
                        file_types=file_types
                    )
                    if paths:
                        path = paths[0]
                except Exception:
                    try:
                        paths = self.window.create_file_dialog(
                            webview.SAVE_DIALOG,
                            save_filename=suggested_name
                        )
                        if paths:
                            path = paths[0]
                    except:
                        path = None

            if not path:
                return {"ok": False, "msg": "Cancelado"}

            # Guardar archivo
            mode = 'wb' if isinstance(data, (bytes, bytearray)) else 'w'
            with open(path, mode) as f:
                f.write(data)

            print(f"[INFO] Archivo guardado en: {path}")
            return {"ok": True, "path": path}

        except Exception as e:
            print("[ERROR] save_file:", e)
            return {"ok": False, "msg": str(e)}

    # ------------------------------------------------
    # 🔧 save_pdf (CORREGIDO)
    # ------------------------------------------------
    def save_pdf(self, data_json, suggested_name="mediciones.pdf"):
        """Genera un PDF a partir de las mediciones y lo guarda usando SAVE_DIALOG."""
        if not REPORTLAB_AVAILABLE:
            return {"ok": False, "msg": "reportlab no está instalado"}

        try:
            data = json.loads(data_json) if isinstance(data_json, str) else data_json
            if not isinstance(data, list):
                return {"ok": False, "msg": "Formato inválido"}

            # -------- DIÁLOGO DE GUARDADO CORRECTO --------
            path = None
            if self.window:
                try:
                    paths = self.window.create_file_dialog(
                        webview.SAVE_DIALOG,
                        save_filename=suggested_name,
                        file_types=[('PDF', '*.pdf'), ('Todos', '*.*')]
                    )
                    if paths:
                        path = paths[0]
                except Exception:
                    try:
                        paths = self.window.create_file_dialog(
                            webview.SAVE_DIALOG,
                            save_filename=suggested_name
                        )
                        if paths:
                            path = paths[0]
                    except:
                        path = None

            if not path:
                return {"ok": False, "msg": "Cancelado"}

            # -------- CREAR PDF --------
            rows = [["Día", "Hora", "Tiempo (s)", "Velocidad (m/s)", "Centímetros"]]
            for m in data:
                dia = m.get("dia", "-")
                hora = m.get("hora", "-")
                t = f"{m['tiempo']:.3f}" if isinstance(m.get('tiempo'), (int, float)) else "-"
                v = f"{m['velocidad']:.2f}" if isinstance(m.get('velocidad'), (int, float)) else "-"
                cmv = f"{(m['metros'] * 100):.1f}" if isinstance(m.get('metros'), (int, float)) else "-"
                rows.append([dia, hora, t, v, cmv])

            doc = SimpleDocTemplate(path, pagesize=letter)
            table = Table(rows)
            style = TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#00baff')),
                ('GRID', (0,0), (-1,-1), 0.5, colors.black),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ])
            table.setStyle(style)

            doc.build([table])

            return {"ok": True, "path": path}

        except Exception as e:
            print("[ERROR] save_pdf:", e)
            return {"ok": False, "msg": str(e)}

    # ------------------------------------------------
    def open_file(self):
        try:
            path = None
            if self.window:
                try:
                    file_types = [('JSON', '*.json'), ('Todos', '*.*')]
                    paths = self.window.create_file_dialog('open', file_types=file_types)
                    if paths:
                        path = paths[0]
                except Exception:
                    try:
                        paths = self.window.create_file_dialog('open')
                        if paths:
                            path = paths[0]
                    except:
                        path = None

            if not path:
                return {"ok": False, "msg": "No se seleccionó archivo"}

            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            return {"ok": True, "content": content, "path": path}

        except Exception as e:
            print("[ERROR] open_file:", e)
            return {"ok": False, "msg": str(e)}

    # ------------------------------------------------
    def save_sections_to_disk(self, secciones_json):
        """Guarda las secciones en un archivo local secciones.json"""
        try:
            with open("secciones.json", "w", encoding="utf-8") as f:
                f.write(secciones_json)
            print("[SECTIONS] Secciones guardadas en secciones.json")
            return {"ok": True}
        except Exception as e:
            print("[ERROR] save_sections_to_disk:", e)
            return {"ok": False, "msg": str(e)}

    def load_sections_from_disk(self):
        """Carga las secciones desde el archivo local secciones.json"""
        try:
            with open("secciones.json", "r", encoding="utf-8") as f:
                contenido = f.read()
            print("[SECTIONS] Secciones cargadas desde secciones.json")
            return {"ok": True, "secciones": contenido}
        except FileNotFoundError:
            print("[SECTIONS] No existe secciones.json, devolviendo lista vacía")
            return {"ok": True, "secciones": "[]"}
        except Exception as e:
            print("[ERROR] load_sections_from_disk:", e)
            return {"ok": False, "msg": str(e)}


# ===================================================
def start():
    # Obtener la ruta del directorio actual (donde está main.py)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    ICON_PATH = os.path.join(BASE_DIR, "web", "icon.png")
    HTML_PATH = os.path.join(BASE_DIR, "web", "index.html")

    if not os.path.isfile(HTML_PATH):
        print(f"[ERROR] No se encontró {HTML_PATH}")
        return

    if not os.path.isfile(ICON_PATH):
        print(f"[WARN] Icono no encontrado en {ICON_PATH}, se usará genérico")
        ICON_PATH = None

    # ⚡ Importante para QtWebEngine en Linux (solo si QtCore está disponible)
    if QtCore is not None:
        try:
            QtCore.QCoreApplication.setAttribute(QtCore.Qt.AA_ShareOpenGLContexts)
            print("[DEBUG] QtCore.QCoreApplication.setAttribute configurado")
        except Exception as e:
            print(f"[DEBUG] No se pudo configurar QtCore.QCoreApplication: {e}")
    else:
        print("[DEBUG] QtCore no disponible, saltando configuración Qt")

    api = API()

    window = webview.create_window(
        "ESPAPP • Gestor de Sensores ESP32",
        HTML_PATH,
        js_api=api,
        width=950,
        height=650,
        resizable=True
    )
    api.set_window(window)

    # Inyectar capturador de consola JS para enviar logs a Python (ayuda a depurar errores UI)
    def inject_console_logger(win):
        try:
            js = r"""
(function(){
  function send(level,msg){
    try{ window.pywebview.api.log_js(level, String(msg)); }catch(e){}
  }
  ['log','info','warn','error','debug'].forEach(function(level){
    var orig = console[level];
    console[level] = function(){
      try{ send(level, Array.prototype.slice.call(arguments).join(' ')); }catch(e){}
      if(orig && orig.apply) orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e){
    try{ send('error', e.message + ' at ' + e.filename + ':' + e.lineno + ':' + e.colno); }catch(e){}
  });
  window.addEventListener('unhandledrejection', function(e){
    try{ send('error', 'UnhandledRejection: ' + (e.reason && e.reason.stack? e.reason.stack : e.reason)); }catch(e){}
  });
})();
"""
            win.evaluate_js(js)
        except Exception as e:
            print("[ERROR] inject_console_logger:", e)

    webview.start(func=inject_console_logger, args=(window,), debug=False, gui='qt', icon=ICON_PATH)

if __name__ == "__main__":
    start()