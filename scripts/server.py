from http.server import SimpleHTTPRequestHandler, HTTPServer

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8000
    httpd = HTTPServer(('localhost', port), NoCacheHTTPRequestHandler)
    print(f"Serving on port {port} with caching disabled...")
    httpd.serve_forever()
