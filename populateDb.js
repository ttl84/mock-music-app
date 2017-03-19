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
      'password': '123'
    },
    {
      'username': 'Bar',
      'password': '456'
    }
  ]

  return Promise.all(users.map(user => {
    return models.User.create(user)
  }))
})

Promise.all([pPopulateUsers, pPopulatePlaylists]).then(results => {
  models.Playlist.findOne({
    where: {
      name: "90's Mega Mix"
    }
  }).then(playlist => {
    playlist.addUser('Foo')
  })

  models.Playlist.findOne({
    where: {
      name: 'Workout Tracks'
    }
  }).then(playlist => {
    playlist.addUser('Bar')
  })

  models.Playlist.findOne({
    where: {
      name: 'Daft Punk mix'
    }
  }).then(playlist => {
    playlist.addUser('Foo')
    playlist.addUser('Bar')
  })
})
