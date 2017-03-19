const models = require('./models')
const crypto = require('crypto')

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


function generateKey () {
  var sha = crypto.createHash('sha256')
  sha.update(Math.random().toString())
  return sha.digest('hex')
}
exports.createSession = function (username, password) {
  return models.User.findOne({
    where: {
      'username': username,
      'password': password
    }
  }).then(instance => {
    return models.Session.create({
      'sessionUser': username,
      'sessionKey': generateKey()
    })
  }).then(instance => {
    return {
      'sessionKey': instance.get('sessionKey')
    }
  })
}
function checkSession (sessionKey) {
  return models.Session.findOne({
    where: {
      'sessionKey': sessionKey
    }
  }).then(result => {
    if (result) {
      return result.get('sessionUser')
    } else {
      return Promise.reject({
        'status': 'error',
        'reason': 'session not found'
      })
    }
  })
}
exports.checkSession = checkSession

exports.sessionAddSongToPlaylist = function (sessionKey, songID, playlistID) {
  var pUser = checkSession(sessionKey)
  var pPlaylist = models.Playlist.findById(playlistID)
  var pSong = models.Song.findById(songID)
  return Promise.all([pUser, pPlaylist]).then(results => {
    var userName = results[0]
    var playlistInstance = results[1]
    return playlistInstance.hasUser(userName)
  }).then(auth => {
    if (auth) {
      return Promise.all([pPlaylist, pSong])
    } else {
      return Promise.reject()
    }
  }).then(results => {
    var playlistInstance = results[0]
    var songInstance = results[1]
    return models.PlaylistSong.create({
      PlaylistId: playlistInstance.get('id'),
      SongId: songInstance.get('id')
    })
  }).catch(result => {
    return Promise.reject({
      'status': 'error',
      'reason': 'unauthorized'
    })
  })
}
function removeSongFromPlaylist (songID, playlistID) {
  return models.PlaylistSong.findOne({
    where: {
      'SongID': songID,
      'PlaylistID': playlistID
    }
  }).then(instance => {
    return instance.destroy()
  }).then(result => {
    return {'status': 'ok'}
  })
}

exports.sessionRemoveSongFromPlaylist = function (sessionKey, songID, playlistID) {
  var pUser = checkSession(sessionKey)
  var pPlaylist = models.Playlist.findById(playlistID)
  return Promise.all([pUser, pPlaylist]).then(results => {
    var userName = results[0]
    var playlistInstance = results[1]
    return playlistInstance.hasUser(userName)
  }).then(auth => {
    if (auth) {
      return Promise.resolve()
    } else {
      return Promise.reject()
    }
  }).then(_ => {
    return removeSongFromPlaylist(songID, playlistID)
  }).catch(result => {
    return Promise.reject({
      'status': 'error',
      'reason': 'unauthorized'
    })
  })
}

if (require.main === module) {
  printGetAllSongs()
  printGetAllPlaylists()
}
