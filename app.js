// Import the http library
const http = require('http')
const url = require('url')
const fs = require('fs')
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
var server = http.createServer()
var routes = []
function route (pattern, callback) {
  routes.push({
    'pattern': pattern,
    'callback': callback
  })
}
function doRoute (request, response) {
  var URL = url.parse(request.url, true)
  routes.forEach(function (ele) {
    if (URL.pathname.match(ele['pattern'])) {
      ele['callback'](request, response)
    }
  })
}
route(/^\/$/, function (request, response) {
  console.log('begin redirect')
  response.statusCode = 301
  response.setHeader('location', '/playlists')
  response.end()
  console.log('end redirect')
})

route(/^\/(playlists|library|search)$/, function (request, response) {
  console.log('begin html')
  response.statusCode = 200
  response.setHeader('Content-Type', 'text/html')
  var stream = fs.createReadStream('playlist.html')
  stream.pipe(response)
})

route(/^\/playlist\.css$/, function (request, response) {
  response.statusCode = 200
  response.setHeader('content-type', 'text/css')
  var stream = fs.createReadStream('playlist.css')
  stream.pipe(response)
})

route(/^\/music-app\.js$/, function (request, response) {
  response.statusCode = 200
  response.setHeader('content-type', 'application/javascript')
  var stream = fs.createReadStream('music-app.js')
  stream.pipe(response)
})

route(/^\/music-data\.js$/, function (request, response) {
  response.statusCode = 200
  response.setHeader('content-type', 'application/javascript')
  var stream = fs.createReadStream('music-data.js')
  stream.pipe(response)
})

server.on('request', function (request, response) {
  response.setHeader('cache-control', 'public, max-age=1800')

  doRoute(request, response)
})

// Start the server on port 3000
server.listen(3000, function () {
  console.log('Amazing music app server listening on port 3000!')
})
