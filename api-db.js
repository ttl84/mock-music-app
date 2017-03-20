const models = require('./models')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
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

function comparePassword (password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (res) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}
function authenticate (username, password) {
  var pUser = models.User.findOne({
    where: {
      'username': username
    }
  })
  return pUser.then(instance => {
    return instance.get('hash')
  }).then(hash => {
    return comparePassword(password, hash)
  }).then(_ => {
    return pUser
  })
}
exports.createSession = function (username, password) {
  return authenticate(username, password).then(instance => {
    return models.Session.create({
      'sessionUser': instance.get('id'),
      'sessionKey': generateKey()
    })
  }).then(instance => {
    return {
      'sessionKey': instance.get('sessionKey')
    }
  }).catch(_ => {
    return Promise.reject({
      'status': 'error',
      'reason': 'not authenticated'
    })
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
    var userID = results[0]
    var playlistInstance = results[1]
    return playlistInstance.hasUser(userID)
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
    var userID = results[0]
    var playlistInstance = results[1]
    return playlistInstance.hasUser(userID)
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
function playlistListTransform (instances) {
  return Promise.all(instances.map(playlistInstance => {
    return playlistInstance.getSongs().then(songInstances => {
      return {
        id: playlistInstance.get('id'),
        name: playlistInstance.get('name'),
        songs: songInstances.map(songInstance => {
          return songInstance.get('id')
        })
      }
    })
  }))
}
function getAllPlaylists () {
  return models.Playlist.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  }).then(playlistListTransform)
}

function sessionGetAllPlaylists (sessionKey) {
  return checkSession(sessionKey).then(userID => {
    return models.User.findById(userID)
  }).then(userInstance => {
    return userInstance.getPlaylists()
  }).then(playlistListTransform)
}
exports.sessionGetAllPlaylists = sessionGetAllPlaylists

function getAllUsers () {
  return models.User.findAll().then(instances => {
    return {
      'users': instances.map(instance => {
        return {
          'id': instance.get('id'),
          'name': instance.get('username')
        }
      })
    }
  })
}
exports.getAllUsers = getAllUsers

function addUserToPlaylist (userID, playlistID) {
  return models.Playlist.findById(playlistID).then(instance => {
    if (instance) {
      return instance.addUser(userID).catch(error => {
        if (error['name'] === 'SequelizeUniqueConstraintError') {
          return Promise.resolve()
        } else {
          return Promise.reject(error)
        }
      })
    } else {
      return Promise.reject({
        'status': 'error',
        'reason': 'playlist not found'
      })
    }
  })
}
function sessionAddUserToPlaylist (sessionKey, userID, playlistID) {
  var pUser = checkSession(sessionKey)
  var pPlaylist = models.Playlist.findById(playlistID)
  return Promise.all([pUser, pPlaylist]).then(results => {
    var userID = results[0]
    var playlistInstance = results[1]
    return playlistInstance.hasUser(userID)
  }).then(auth => {
    if (auth) {
      return addUserToPlaylist(userID, playlistID)
    } else {
      return Promise.reject({
        'status': 'error',
        'reason': 'not authorized'
      })
    }
  })
}
exports.sessionAddUserToPlaylist = sessionAddUserToPlaylist

function sessionGetPlaylist (sessionKey, playlistID) {
  var pUser = checkSession(sessionKey)
  var pPlaylist = models.Playlist.findById(playlistID)
  return Promise.all([pUser, pPlaylist]).then(results => {
    var userID = results[0]
    var playlistInstance = results[1]
    return playlistInstance.hasUser(userID)
  }).then(auth => {
    if (auth) {
      return pPlaylist
    } else {
      return Promise.reject({
        'status': 'error',
        'reason': 'not authorized'
      })
    }
  })
}
function sessionGetSongIDsFromPlaylist (sessionKey, playlistID) {
  return sessionGetPlaylist(sessionKey, playlistID)
  .then(playlistInstance => {
    return playlistInstance.getSongs()
  })
  .then(songInstances => {
    return songInstances.map(instance => {
      return instance.get('id')
    })
  })
}
exports.sessionGetSongIDsFromPlaylist = sessionGetSongIDsFromPlaylist
