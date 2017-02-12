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

if (require.main === module) {
  printGetAllSongs()
  printGetAllPlaylists()
}
