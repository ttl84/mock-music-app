// Import the http library
var http = require('http')
var url = require('url')
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
var server = http.createServer()

server.on('request', function (request, response) {
  response.setHeader('cache-control', 'public, max-age=1800')
  var URL = url.parse(request.url, true)
  if (URL.pathname.match(/^\/$/)) {
    console.log('begin redirect')
    response.statusCode = 301
    response.setHeader('location', '/playlists')

    response.end()
    console.log('end redirect')
  } else if (URL.pathname.match(/^\/playlists$/)) {
    console.log('begin playlists')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/plain')
    response.end(request.url)
    console.log('end playlists')
  }
})

// Start the server on port 3000
server.listen(3000, function () {
  console.log('Amazing music app server listening on port 3000!')
})
