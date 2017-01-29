// Import the http library
const http = require('http')
const fs = require('fs')
const querystring = require('querystring')
const Router = require('./router.js')
const PlaylistAPI = require('./playlist-api.js')
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
var server = http.createServer()
var router = new Router()

router.route({
  pattern: /^\/$/,
  callback: function (request, response) {
    console.log('no path received, redirecting')
    response.statusCode = 301
    response.setHeader('location', '/playlists')
    response.end()
  }
})

router.route({
  pattern: /^\/(playlists|library|search)$/,
  callback: function (request, response) {
    console.log('tab path received, sending html')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html')
    var stream = fs.createReadStream('playlist.html')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/playlist\.css$/,
  callback: function (request, response) {
    console.log('css path received, sending css')
    response.statusCode = 200
    response.setHeader('content-type', 'text/css')
    var stream = fs.createReadStream('playlist.css')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/music-app\.js$/,
  callback: function (request, response) {
    console.log('script path received, sending css')
    response.statusCode = 200
    response.setHeader('content-type', 'application/javascript')
    var stream = fs.createReadStream('music-app.js')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/api\/songs$/,
  method: 'GET',
  callback: function (request, response) {
    console.log('GET songs received, sending songs')
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
    console.log('GET playlists received, sending playlists')
    response.statusCode = 200
    response.setHeader('content-type', 'application/json')
    var stream = fs.createReadStream('playlists.json')
    stream.pipe(response)
  }
})

router.route({
  pattern: /^\/api\/playlists$/,
  method: 'POST',
  callback: function (request, response) {
    var chunks = []
    request.on('data', function (buf) {
      chunks.push(buf)
    })
    request.on('end', function () {
      var buf = Buffer.concat(chunks)
      var message = querystring.parse(buf.toString())
      if (message.method === 'add-song-to-playlist') {
        if (PlaylistAPI.addSongToPlaylist(message)) {
          response.statusCode = 201
          response.setHeader('content-type', 'application/json')
          response.end('{}')
        } else {
          response.statusCode = 400
          response.setHeader('content-type', 'application/json')
          response.end('{}')
        }
      } else if (message.method === 'add-new-playlist') {
        var result = PlaylistAPI.addNewPlaylist()
        if (result['status'] === 'ok') {
          response.statusCode = 201
        } else if (result['status'] === 'error') {
          if (result['blame'] === 'client') {
            response.statusCode = 400
          } else {
            response.statusCode = 500
          }
        }
        response.setHeader('content-type', 'application/json')
        response.end(JSON.stringify(result))
      }
    })
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
