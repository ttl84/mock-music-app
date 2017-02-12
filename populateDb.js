const models = require('./models')
const fshelper = require('./fshelper')

var pGetSongs = fshelper.readJSON('songs.json')
Promise.all([models.Songs.sync(), pGetSongs]).then(results => {
  var songs = results[1]['songs']

  songs.forEach(song => {
    console.log(song)
    models.Songs.create({
      title: song.title,
      album: song.album,
      artist: song.artist,
      duration: song.duration
    })
  })
})

var pGetPlaylists = fshelper.readJSON('playlists.json')
Promise.all([models.Playlists.sync(), pGetPlaylists]).then(results => {
  var playlists = results[1]['playlists']
  playlists.forEach(playlist => {
    console.log(playlist)
    models.Playlists.create({
      name: playlist['name']
    })
  })
})
