'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const PlaylistAPI = require('./playlist-api.js')
const AppAPI = require('./api-db.js')
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(3000)
var fileServeOptions = {
  root: __dirname
}

app.get('/', (request, response) => {
  console.log('no path received, redirecting')
  response.set('cache-control', 'public, max-age=1800')
  response.redirect(301, '/playlists')
})

app.get(/^\/(playlists|library|search)$/, (request, response) => {
  console.log('tab path received, sending html')
  response.status(200)
  response.set({
    'content-type': 'text/html',
    'cache-control': 'public, max-age=1800'
  })
  response.sendFile('playlist.html', fileServeOptions)
})

app.get('/playlist.css', (request, response) => {
  console.log('css path received, sending css')
  response.status(200)
  response.set({
    'content-type': 'text/css',
    'cache-control': 'public, max-age=1800'
  })
  response.sendFile('playlist.css', fileServeOptions)
})

app.get('/music-app.js', (request, response) => {
  console.log('script path received, sending css')
  response.status(200)
  response.set({
    'content-type': 'application/javascript',
    'cache-control': 'public, max-age=1800'
  })
  response.sendFile('music-app.js', fileServeOptions)
})

app.get('/api/songs', (request, response) => {
  console.log('GET songs received, sending songs')
  AppAPI.getAllSongs().then(data => {
    response.status(200)
    response.json(data)
  }).catch(err => {
    response.status(500)
    response.json(err)
  })
})

app.get('/api/playlists', (request, response) => {
  console.log('GET playlists received, sending playlists')
  AppAPI.getAllPlaylists().then(data => {
    response.status(200)
    response.json(data)
  }).catch(err => {
    response.status(500)
    response.json(err)
  })
})

app.post('/api/playlists/:playlistID', (request, response) => {
  PlaylistAPI.addSongToPlaylist(request.body['song-id'], request.params.playlistID).then(result => {
    response.status(201)
    return result
  }, result => {
    if (result['blame'] === 'client') {
      response.status(400)
    } else {
      response.status(500)
    }
    return result
  }).then(result => {
    console.log('request: ' + JSON.stringify(request.body))
    console.log('response: ' + JSON.stringify(result))
    response.json(result)
  })
})

app.get('*', (request, response) => {
  console.log('request not understood: ' + request.url)
  response.sendStatus(404)
})
