const fs = require('fs')
function readJSON (path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}
function writeFile (dst, src) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dst, src, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
function getAllSongs () {
  return readJSON('songs.json')
}
function getAllPlaylists () {
  return readJSON('playlists.json')
}
function getSongByID (id) {
  if (typeof id !== 'number') {
    return Promise.reject('expected songID to be number, got ' + typeof id)
  }
  return getAllSongs().then(function (songData) {
    var found = songData['songs'].find(function (song) {
      return song['id'] === id
    })
    if (found) {
      return found
    } else {
      return Promise.reject('song not found: ' + id)
    }
  }, function (reason) {
    throw reason
  })
}
function addSongToPlaylist (songID, playlistID) {
  songID = Number(songID)
  playlistID = Number(playlistID)
  return Promise.all([getSongByID(songID), getAllPlaylists()]).then(function (values) {
    var playlistsData = values[1]
    var playlist = playlistsData['playlists'].find(function (playlist) {
      return playlist['id'] === playlistID
    })
    if (playlist) {
      playlist['songs'].push(songID)
      return writeFile('playlists.json', JSON.stringify(playlistsData)).then(function () {
        return {'status': 'ok'}
      }, function (err) {
        return Promise.reject(err)
      })
    } else {
      return Promise.reject({'reason': 'playlist not found'})
    }
  }, function (reason) {
    throw reason
  })
}
function addNewPlaylist () {
  return Promise.resolve({'status': 'ok'})
}

exports.runMethod = function (message) {
  if (message.method === 'add-song-to-playlist') {
    return addSongToPlaylist(message['song-id'], message['playlist-id'])
  } else if (message.method === 'add-new-playlist') {
    return addNewPlaylist()
  } else {
    return Promise.reject({
      'status': 'error',
      'blame': 'client',
      'reason': 'bad api method'
    })
  }
}
