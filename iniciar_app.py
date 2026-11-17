"""
Servidor HTTP local para lanzar el Monitor SICOES Bolivia.
Busca un puerto disponible, inicia el servidor y abre el navegador por defecto.
"""

import http.server
import mimetypes
import os
import socket
import socketserver
import threading
import webbrowser

HOST = "127.0.0.1"
START_PORT = 8080


def find_free_port(start_port: int) -> int:
    port = start_port
    while port < start_port + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) != 0:
                return port
        port += 1
    return start_port


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Evitar caché agresiva en desarrollo local
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Asegurar tipos MIME correctos para módulos ES y GeoJSON
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("application/geo+json", ".geojson")

    port = find_free_port(START_PORT)
    url = f"http://{HOST}:{port}/index.html"

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, port), QuietHandler) as httpd:
        print("========================================================")
        print("  SICOES Bolivia - Monitor de Convocatorias Publicas")
        print("========================================================")
        print(f"  Servidor activo en: {url}")
        print("  Presiona Ctrl+C en esta ventana para detenerlo.")
        print("========================================================")

        threading.Timer(0.8, lambda: webbrowser.open(url)).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido correctamente.")


if __name__ == "__main__":
    main()
