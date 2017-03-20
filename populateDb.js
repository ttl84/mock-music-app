const models = require('./models')
const fshelper = require('./fshelper')
const bcrypt = require('bcrypt')

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

var pPopulatePlaylists = Promise.all([pGetPlaylists, pPopulateSongs, pSync]).then(results => {
  var playlists = results[0]['playlists']
  var ps = playlists.map(playlistJSON => {
    console.log(playlistJSON)
    return models.Playlist.create({
      id: playlistJSON['id'],
      name: playlistJSON['name']
    }).then(playlistRow => {
      playlistRow.addSongs(playlistJSON['songs'])
    })
  })
  return Promise.all(ps)
})

var pPopulateUsers = pSync.then(result => {
  var users = [
    {
      'username': 'Foo',
      'hash': bcrypt.hashSync('123', 10)
    },
    {
      'username': 'Bar',
      'hash': bcrypt.hashSync('456', 10)
    }
  ]

  return Promise.all(users.map(user => {
    return models.User.create(user)
  }))
})

Promise.all([pPopulateUsers, pPopulatePlaylists]).then(results => {
  var pFoo = models.User.findOne({
    where: {
      username: 'Foo'
    }
  })
  var pBar = models.User.findOne({
    where: {
      username: 'Bar'
    }
  })
  var p90 = models.Playlist.findOne({
    where: {
      name: "90's Mega Mix"
    }
  })

  var pWorkout = models.Playlist.findOne({
    where: {
      name: 'Workout Tracks'
    }
  })

  var pDaft = models.Playlist.findOne({
    where: {
      name: 'Daft Punk mix'
    }
  })

  Promise.all([pFoo, p90, pDaft]).then(results => {
    var foo = results[0]
    var ninety = results[1]
    var daft = results[2]
    foo.addPlaylist(ninety)
    foo.addPlaylist(daft)
  })
  Promise.all([pBar, pWorkout, pDaft]).then(results => {
    var bar = results[0]
    var workout = results[1]
    var daft = results[2]
    bar.addPlaylist(workout)
    bar.addPlaylist(daft)
  })
})
