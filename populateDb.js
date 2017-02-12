const models = require('./models')
const fshelper = require('./fshelper')

var pGetSongs = fshelper.readJSON('songs.json')
var pGetPlaylists = fshelper.readJSON('playlists.json')
var pSync = models.sequelize.sync({force: true})

var pPopulateSongs = Promise.all([pGetSongs, pSync]).then(results => {
  var songs = results[0]['songs']
  songs.forEach(song => {
    console.log(song)
    models.Song.create({
      id: song.id,
      title: song.title,
      album: song.album,
      artist: song.artist,
      duration: song.duration
    })
  })
})

Promise.all([pGetPlaylists, pPopulateSongs, pSync]).then(results => {
  var playlists = results[0]['playlists']
  playlists.forEach(playlistJSON => {
    console.log(playlistJSON)
    models.Playlist.create({
      id: playlistJSON['id'],
      name: playlistJSON['name']
    }).then(playlistRow => {
      playlistRow.addSongs(playlistJSON['songs'])
    })
  })
})
