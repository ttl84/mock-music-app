const sqlite3 = require('sqlite3').verbose()
const fshelper = require('./fshelper.js')
function handleError (context) {
  return function (err) {
    if (err) {
      console.log(context + ':')
      console.log(err)
    }
  }
}
var db = new sqlite3.Database('app.db', handleError('create database'))
var pGetSongs = fshelper.readJSON('songs.json')
var pGetPlaylists = fshelper.readJSON('playlists.json')

var pPopulateSongs = pGetSongs.then(data => {
  var songs = data['songs']
  db.run('CREATE TABLE IF NOT EXISTS Songs (' +
    'id INTEGER PRIMARY KEY, ' +
    'album TEXT, ' +
    'title TEXT, ' +
    'artist TEXT, ' +
    'duration INTEGER' +
    ')', handleError('create songs table'))
  var s = db.prepare('INSERT INTO Songs VALUES (?, ?, ?, ?, ?)', handleError('prepare songs statement'))
  songs.forEach(song => {
    s.run(song['id'], song['album'], song['title'], song['artist'], song['duration'], handleError('run songs statement'))
  })
  s.finalize(handleError('finalize songs statement'))
})

var pPopulatePlaylists = pGetPlaylists.then(data => {
  var playlists = data['playlists']
  db.run('CREATE TABLE IF NOT EXISTS Playlists (id INTEGER PRIMARY KEY, name TEXT)',
    handleError('create playlists table'))
  var s = db.prepare('INSERT INTO Playlists VALUES (?, ?)', handleError('prepare playlists statement'))
  playlists.forEach(playlist => {
    s.run(playlist['id'], playlist['name'], handleError('run playlists statement'))
  })
  s.finalize(handleError('finalize playlists statement'))
})

var pPopulateSongPlaylistMap = pGetPlaylists.then(data => {
  var playlists = data['playlists']
  db.run('CREATE TABLE IF NOT EXISTS Songs_Playlists ' +
    '(id INTEGER PRIMARY KEY, playlist_id INTEGER, song_id INTEGER)', handleError('create song playlists map table'))

  var songPlaylistMap = []
  playlists.forEach(playlist => {
    playlist['songs'].forEach(songId => {
      songPlaylistMap.push({
        'song': songId,
        'playlist': playlist['id']
      })
    })
  })
  var s = db.prepare('INSERT INTO Songs_Playlists VALUES (?, ?, ?)', handleError('prepare song playlists map statement'))
  songPlaylistMap.forEach((mapping, id) => {
    s.run(id, mapping['playlist'], mapping['song'], handleError('run song playlists map statement'))
  })
  s.finalize(handleError('finalize song playlists map statement'))
})

Promise.all([pPopulateSongs, pPopulatePlaylists, pPopulateSongPlaylistMap]).then(() => {
  db.close(handleError('close database'))
})
