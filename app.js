'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const AppAPI = require('./api-db.js')
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.listen(3000)
var fileServeOptions = {
  root: __dirname
}

function sendHTML (request, response) {
  console.log('tab path received, sending html')
  response.status(200)
  response.set({
    'content-type': 'text/html',
    'cache-control': 'public, max-age=1800'
  })
  response.sendFile('playlist.html', fileServeOptions)
}

app.get('/', (request, response) => {
  console.log('no path received, redirecting')
  response.redirect(301, '/playlists')
})
app.get('/login', sendHTML)
app.get(/^\/(playlists|library|search)$/, (request, response) => {
  AppAPI.checkSession(request.cookies.sessionKey).then(_ => {
    sendHTML(request, response)
  }, _ => {
    console.log('session ' + request.cookies.sessionKey + ' not found, redirecting')
    response.redirect(303, '/login')
  })
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

app.post('/login', (request, response) => {
  AppAPI.createSession(request.body['username'], request.body['password']).then(result => {
    response.status(200)
    response.cookie('sessionKey', result['sessionKey'])
    return {'status': 'ok'}
  }, result => {
    response.status(401)
    return {
      'status': 'error',
      'reason': 'failed to authenticate'
    }
  }).then(result => {
    console.log('request: ' + JSON.stringify(request.body))
    console.log('response: ' + JSON.stringify(result))
    response.json(result)
  })
})
app.post('/api/playlists', (request, response) => {
  AppAPI.addNewPlaylist(request.body['name']).then(result => {
    response.status(200)
    return result
  }, result => {
    response.status(500)
    return result
  }).then(result => {
    console.log('request: ' + JSON.stringify(request.body))
    console.log('response: ' + JSON.stringify(result))
    response.json(result)
  })
})

app.post('/api/playlists/:playlistID', (request, response) => {
  AppAPI.sessionAddSongToPlaylist(request.cookies.sessionKey, request.body['song'], request.params.playlistID).then(result => {
    response.status(200)
    return {}
  }, result => {
    response.status(500)
    return result
  }).then(result => {
    console.log('request: ' + JSON.stringify(request.body))
    console.log('response: ' + JSON.stringify(result))
    response.json(result)
  })
})

app.delete('/api/playlists/:playlistID', (request, response) => {
  AppAPI.sessionRemoveSongFromPlaylist(request.cookies.sessionKey, request.body['song'], request.params.playlistID).then(result => {
    response.status(200)
    return result
  }, result => {
    response.status(500)
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
