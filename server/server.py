import httplib
import string,cgi,time, urlparse
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

class MyHandler(BaseHTTPRequestHandler):

    def do_GET(self):
		response = fetch('GET',self.path)
		
		self.send_response(response.status)
		for r in response.getheaders():
			self.send_header(r[0],r[1])
		self.end_headers()
		self.wfile.write(response.read().replace("Feeling Lucky",'Bogosort'))
		
		return

    def do_POST(self):
		self.wfile.write(fetch('POST',self.path))
		
		return


def fetch(method,address):
	
	address = urlparse.urlparse(address)
	
	h = httplib.HTTPConnection(address.hostname)	
	h.putrequest(method, address.path)
	h.endheaders()

	return h.getresponse()
	


def main():
    try:
        server = HTTPServer(('', 31415), MyHandler)
        print 'ReTweet'
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()

if __name__ == '__main__':
    main()


