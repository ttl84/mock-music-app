const models = require('./models')

function getAllSongs () {
  return models.Song.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  }).then(instances => {
    return instances.map(instance => {
      return instance.get()
    })
  })
}
exports.getAllSongs = getAllSongs
function printGetAllSongs () {
  getAllSongs().then(rows => {
    rows.forEach(row => {
      console.log(row)
    })
  })
}

function getAllPlaylists () {
  return models.Playlist.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  }).then(instances => {
    return Promise.all(instances.map(playlistInstance => {
      return playlistInstance.getSongs().then(songInstances => {
        var playlistObj = playlistInstance.get()
        var songIds = songInstances.map(songInstance => {
          return songInstance.get('id')
        })
        playlistObj['songs'] = songIds
        return playlistObj
      })
    }))
  })
}
exports.getAllPlaylists = getAllPlaylists
function printGetAllPlaylists () {
  getAllPlaylists().then(rows => {
    rows.forEach(row => {
      console.log(row)
    })
  })
}

exports.addSongToPlaylist = function (songID, playlistID) {
  var pPlaylist = models.Playlist.findById(playlistID)
  var pSong = models.Song.findById(songID)
  return Promise.all([pPlaylist, pSong]).then(results => {
    var playlist = results[0]
    var song = results[1]
    return models.PlaylistSong.create({
      PlaylistId: playlist.get('id'),
      SongId: song.get('id')
    })
  })
}

exports.addNewPlaylist = function (name) {
  return models.Playlist.create({
    'name': name
  }).then(instance => {
    // redundant query here because the instance object returned here doesn't have
    // an id yet, even though it does in the database. By looking it up manually,
    // the instance object will contain the id value.
    return models.Playlist.findOne({
      where: {
        'name': name
      }
    })
  }).then(instance => {
    return {
      'id': instance.get('id'),
      'name': instance.get('name')
    }
  })
}

if (require.main === module) {
  printGetAllSongs()
  printGetAllPlaylists()
}
