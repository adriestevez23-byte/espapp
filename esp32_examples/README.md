ESP32 - Ejemplo de servidor HTTP para integrarse con la aplicación

Archivos:
- `esp32_server_example.ino` : sketch con servidor HTTP mínimo.

Endpoints expuestos:
- GET `/data`  -> Devuelve JSON: `{ "ok": true, "measurements": [ {dia,hora,tiempo,velocidad,metros}, ... ] }`
- POST `/add`  -> Añade una medición. Body: JSON con keys `tiempo`, `velocidad`, `metros` (opcional `dia`, `hora`).
- GET `/clear` -> Limpia la lista de mediciones (útil en pruebas).
- GET `/addSample` -> Añade una muestra de prueba generada por el ESP32.

Cómo usar:
1. Editar `esp32_server_example.ino` y poner tus credenciales WiFi en `WIFI_SSID` y `WIFI_PASS`.
2. Subir el sketch al ESP32 desde Arduino IDE o PlatformIO.
3. Tras conectar, el ESP imprimirá la IP en `Serial` (ej: `192.168.1.42`).
4. En la aplicación, usa `fetch_data_from_esp32()` o `GET http://<esp32_ip>/data` para leer las mediciones.
5. Para añadir manualmente desde la app, hacer `POST http://<esp32_ip>/add` con body JSON.

Notas:
- Este ejemplo usa `ArduinoJson` para crear/parsear JSON. Instala la librería si no la tienes (Arduino Library Manager).
- El ejemplo guarda las mediciones en RAM; si necesitas persistencia entre reinicios usa SPIFFS/LittleFS o almacenamiento externo.
- Para depuración activa `Serial` y prueba `/addSample` desde el navegador para crear entradas rápidamente.

Formato de medición (ejemplo):
{
  "dia": "2025-12-01",
  "hora": "09:20:00",
  "tiempo": 1.234,
  "velocidad": 0.56,
  "metros": 0.69
}
