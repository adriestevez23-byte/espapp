"""
esp32ejemplo.py
Ejemplo MicroPython para ESP32 compatible con la app ESPAPP de mediciones.

Endpoints importantes:
 - GET /data -> { "ok": true, "measurements": [ {tiempo, velocidad, metros, ts}, ... ] }
 - GET /set_distancia?d=VALOR (metros) or /set_distancia?d_cm=VALOR (centímetros)
 - GET /logs -> lista de líneas de log
 - GET /clear -> limpia historial

Instrucciones:
 - Ajusta `AP_SSID`, `AP_PASS` y los pines `SENSOR_PIN_1/2` según tu hardware.
 - Carga en el ESP con Thonny/rshell/ampy.
 - Conecta desde la app a la red Wi‑Fi del ESP y la app obtendrá `/data` automáticamente.
"""

import network
import socket
import ujson as json
import time
from machine import Pin

# ---------- CONFIG ----------
AP_SSID = 'ESP32-SENSORES'
AP_PASS = '12345678'
SENSOR_PIN_1 = 14
SENSOR_PIN_2 = 12

# Estado
distancia_m = 0.0
measurements = []  # historial circular

# Seguimiento de cliente (la app) para saber si está conectada
last_client = None  # (ip, ts)

# Uptime
start_time = time.time()

# Estado de conexión con la app
app_connected = False

# Pines
s1 = Pin(SENSOR_PIN_1, Pin.IN, Pin.PULL_UP)
s2 = Pin(SENSOR_PIN_2, Pin.IN, Pin.PULL_UP)


DEBOUNCE_US = 3000
_last_s1 = 0
_last_s2 = 0
_state_s1 = 1
_state_s2 = 1
waiting = False
t1 = 0

esp_logs = []

def log(msg):
    ts = time.localtime()
    prefix = '{}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}'.format(*ts[:6])
    line = '[{}] {}'.format(prefix, msg)
    print(line)
    esp_logs.append(line)
    if len(esp_logs) > 500:
        esp_logs.pop(0)

def micros():
    return time.ticks_us()

def check_sensors():
    """
    Detecta activaciones de sensores y calcula tiempo entre ellos.
    Flujo: espera s1 → inicia cronómetro → espera s2 → calcula dt → registra medición.
    S1 no se puede reactivar hasta que S2 se haya activado.
    """
    global _last_s1, _last_s2, _state_s1, _state_s2, waiting, t1
    now = micros()
    
    # Leer valores de los sensores de forma segura
    try:
        v1 = s1.value()
    except Exception as e:
        v1 = 1
    try:
        v2 = s2.value()
    except Exception as e:
        v2 = 1

    # Resetear S2 cuando vuelve al reposo
    if v2 == 1:
        _state_s2 = 1

    # Resetear S1 solo cuando vuelve al reposo (pero NOT si estamos esperando S2)
    if v1 == 1 and not waiting:
        _state_s1 = 1

    # ===== SENSOR 1: Esperar activación (cambio de 1→0) =====
    # SOLO se activa si NO estamos esperando S2 (waiting=False)
    if _state_s1 == 1 and v1 == 0 and time.ticks_diff(now, _last_s1) > DEBOUNCE_US and not waiting:
        _last_s1 = now
        _state_s1 = 0
        waiting = True
        t1 = now
        log('[SENSOR 1 ACTIVADO] Iniciando cronómetro... t1={} us'.format(t1))

    # ===== SENSOR 2: Esperar activación mientras se espera (si waiting=True) =====
    if _state_s2 == 1 and v2 == 0 and time.ticks_diff(now, _last_s2) > DEBOUNCE_US:
        _last_s2 = now
        _state_s2 = 0
        
        # Siempre loguear cuando S2 se activa (para saber que se detectó)
        log('[SENSOR 2 ACTIVADO]')
        
        # Si estamos esperando (s1 ya se activó) → calcular medición
        if waiting and t1 > 0:
            dt_us = time.ticks_diff(now, t1)
            
            # Solo registrar si el tiempo es válido y positivo
            if dt_us > 0:
                dt_s = dt_us / 1_000_000.0
                
                # Validar que dt_s sea positivo
                if dt_s > 0:
                    vel = 0.0
                    
                    # Calcular velocidad si tenemos distancia configurada
                    if distancia_m > 0:
                        vel = distancia_m / dt_s
                    
                    # Crear objeto de medición
                    m = {
                        'tiempo': round(dt_s, 6),
                        'velocidad': round(vel, 3),
                        'metros': round(distancia_m, 3),
                        'ts': time.time(),
                        'timestamp': int(time.time())
                    }
                    
                    # Guardar medición en historial (solo si es válida)
                    measurements.append(m)
                    if len(measurements) > 1000:
                        measurements.pop(0)
                    
                    # Log detallado de la medición registrada
                    log('[MEDICION REGISTRADA] dt_us={} dt_s={:.6f}s vel={:.3f}m/s dist={:.3f}m'.format(
                        dt_us, dt_s, vel, distancia_m))
                else:
                    log('[AVISO] dt_s <= 0: {:.6f}s (dt_us={})'.format(dt_s, dt_us))
            else:
                log('[AVISO] dt_us <= 0: {} us (tiempo negativo o cero)'.format(dt_us))
        else:
            # Si s2 se activa sin haber activado s1 primero
            if not waiting:
                log('[AVISO] SENSOR 2 se activó pero S1 no fue activado primero')
            elif t1 <= 0:
                log('[AVISO] SENSOR 2 se activó pero t1 no fue inicializado (t1={})'.format(t1))
        
        # Resetear estado de espera DESPUÉS de procesar S2
        waiting = False

def http_response(conn, body, status=200, ctype='application/json'):
    if not isinstance(body, str):
        body = json.dumps(body)
    header = 'HTTP/1.1 {} OK\r\n'.format(status)
    header += 'Content-Type: {}\r\n'.format(ctype)
    header += 'Content-Length: {}\r\n'.format(len(body))
    header += 'Access-Control-Allow-Origin: *\r\n'
    header += 'Connection: close\r\n\r\n'
    try:
        conn.send(header)
        conn.send(body)
    except Exception as e:
        pass

def handle_client(conn, addr=None):
    global last_client, distancia_m
    try:
        req = conn.recv(1024).decode()
        if not req:
            return
        first = req.split('\r\n')[0]
        parts = first.split(' ')
        path_qs = parts[1] if len(parts) > 1 else '/'
        path = path_qs.split('?')[0]
        qs = '' if '?' not in path_qs else path_qs.split('?',1)[1]

        # Registrar último cliente que pidió datos
        try:
            if addr:
                last_client = (addr[0], time.time())
        except Exception as e:
            pass

        if path == '/data':
            # Return the latest measurements; include unit info if configured
            payload = { 'ok': True, 'measurements': measurements[-50:], 'config': { 'distancia_m': distancia_m } }
            http_response(conn, payload)
            return

        if path == '/set_distancia':
            params = {}
            for p in qs.split('&'):
                if '=' in p:
                    k,v = p.split('=',1)
                    params[k]=v
            # Support several formats:
            # - d (meters)
            # - d_cm (centimeters)
            # - valor + unidad (e.g. valor=100 & unidad=cm)
            if 'd' in params:
                try:
                    d = float(params['d'])
                    if d > 0:
                        distancia_m = d
                        http_response(conn, {'ok': True, 'metros': distancia_m})
                        log('[SET_DISTANCIA] Recibida distancia: {} m (via parámetro d)'.format(distancia_m))
                        return
                except:
                    pass
            if 'd_cm' in params:
                try:
                    d = float(params['d_cm'])/100.0
                    if d > 0:
                        distancia_m = d
                        http_response(conn, {'ok': True, 'metros': distancia_m})
                        log('[SET_DISTANCIA] Recibida distancia: {} m (via parámetro d_cm)'.format(distancia_m))
                        return
                except:
                    pass
            # New: accept valor + unidad
            if 'valor' in params and 'unidad' in params:
                try:
                    val = float(params['valor'])
                    unidad = params['unidad'].lower()
                    conv = None
                    if unidad in ('m','metro','metros'):
                        conv = val
                    elif unidad in ('cm','centimetro','centimetros'):
                        conv = val / 100.0
                    elif unidad in ('mm','milimetro','milimetros'):
                        conv = val / 1000.0
                    elif unidad in ('in','pulgada','pulgadas'):
                        conv = val * 0.0254
                    if conv and conv > 0:
                        distancia_m = conv
                        http_response(conn, {'ok': True, 'metros': distancia_m, 'recibido': {'valor': val, 'unidad': unidad}})
                        log('[SET_DISTANCIA] Recibida distancia desde APP: {} {} = {} m (ahora todas las mediciones usarán esta distancia)'.format(val, unidad, round(distancia_m, 4)))
                        return
                except Exception as e:
                    pass
            http_response(conn, {'ok': False, 'msg': 'distancia invalida'}, status=400)
            return

        if path == '/logs':
            http_response(conn, esp_logs)
            return

        if path == '/status':
            uptime = int(time.time() - start_time)
            lc = {'ip': last_client[0], 'ts': last_client[1]} if last_client else None
            http_response(conn, {'ok': True, 'uptime_s': uptime, 'last_client': lc, 'distancia_m': distancia_m})
            return

        if path == '/clear':
            measurements.clear()
            http_response(conn, {'ok': True})
            return

            http_response(conn, {'ok': False, 'msg': 'not found'}, status=404)
    except Exception as e:
        pass

def start_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    try:
        ap.config(essid=AP_SSID, password=AP_PASS)
    except:
        ap.config(ssid=AP_SSID, password=AP_PASS)
    time.sleep(0.2)

def start_server():
    addr = socket.getaddrinfo('0.0.0.0',80)[0][-1]
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(5)
    s.settimeout(0.5)
    return s

def main():
    start_ap()
    srv = start_server()
    global app_connected
    try:
        while True:
            check_sensors()
            # Detectar si la app está conectada (ha pedido datos recientemente)
            try:
                if last_client and isinstance(last_client, (list, tuple)) and (time.time() - last_client[1]) < 10:
                    if not app_connected:
                        app_connected = True
                else:
                    if app_connected:
                        app_connected = False
            except Exception as e:
                pass
            try:
                cl, addr = srv.accept()
            except OSError:
                cl = None
            if cl:
                try:
                    handle_client(cl, addr)
                except Exception as e:
                    log('client error: {}'.format(e))
                try:
                    cl.close()
                except:
                    pass
            time.sleep(0.002)
    finally:
        try:
            srv.close()
        except:
            pass

if __name__ == '__main__':
    main()