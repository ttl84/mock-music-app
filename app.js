// Import the http library
const http = require('http')
const fs = require('fs')
const Router = require('./router.js')
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
var server = http.createServer()
var router = new Router()

router.route({
  pattern: /^\/$/,
  callback: function (request, response) {
    console.log('begin redirect')
    response.statusCode = 301
    response.setHeader('location', '/playlists')
    response.end()
    console.log('end redirect')
  }
})

router.route({
  pattern: /^\/(playlists|library|search)$/,
  callback: function (request, response) {
    console.log('begin html')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html')
    var stream = fs.createReadStream('playlist.html')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/playlist\.css$/,
  callback: function (request, response) {
    response.statusCode = 200
    response.setHeader('content-type', 'text/css')
    var stream = fs.createReadStream('playlist.css')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/music-app\.js$/,
  callback: function (request, response) {
    response.statusCode = 200
    response.setHeader('content-type', 'application/javascript')
    var stream = fs.createReadStream('music-app.js')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/music-data\.js$/,
  callback: function (request, response) {
    response.statusCode = 200
    response.setHeader('content-type', 'application/javascript')
    var stream = fs.createReadStream('music-data.js')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/api\/songs$/,
  method: 'GET',
  callback: function (request, response) {
    response.statusCode = 200
    response.setHeader('content-type', 'application/json')
    var stream = fs.createReadStream('songs.json')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/api\/playlists$/,
  method: 'GET',
  callback: function (request, response) {
    response.statusCode = 200
    response.setHeader('content-type', 'application/json')
    var stream = fs.createReadStream('playlists.json')
    stream.pipe(response)
  }
})

server.on('request', function (request, response) {
  response.setHeader('cache-control', 'public, max-age=1800')

  router.respond(request, response)
})

// Start the server on port 3000
server.listen(3000, function () {
  console.log('Amazing music app server listening on port 3000!')
})
