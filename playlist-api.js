const fs = require('fs')
const fshelper = require('./fshelper')
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
  return fshelper.readJSON('songs.json')
}
function getAllPlaylists () {
  return fshelper.readJSON('playlists.json')
}
function getSongByID (id) {
  if (typeof id !== 'number') {
    return Promise.reject({
      'status': 'error',
      'blame': 'client',
      'reason': 'expected songID to be number, got ' + typeof id
    })
  }
  return getAllSongs().then(function (songData) {
    var found = songData['songs'].find(function (song) {
      return song['id'] === id
    })
    if (found) {
      return found
    } else {
      return Promise.reject({
        'status': 'error',
        'blame': 'client',
        'reason': 'song not found: ' + id
      })
    }
  })
}
function uniqueNumberThatIsNot (numbers) {
  for (var i = 0; i < 40000000; i++) {
    if (!numbers[i]) {
      return i
    }
  }
  return null
}
function addNewPlaylist (playlistName) {
  if (typeof playlistName !== 'string') {
    return Promise.reject({
      'status': 'error',
      'blame': 'client',
      'reason': 'expected playlistName to be a string, got ' + typeof playlistName
    })
  } else {
    return getAllPlaylists().then(function (playlistsData) {
      var playlists = playlistsData['playlists']
      var found = playlists.find(function (playlist) {
        return playlist['name'] === playlistName
      })
      if (found) {
        return Promise.reject({
          'status': 'error',
          'blame': 'client',
          'reason': 'playlist already exists: ' + playlistName
        })
      } else {
        var usedID = {}
        playlists.forEach(function (playlist) {
          usedID[playlist['id']] = true
        })
        var unusedID = uniqueNumberThatIsNot(usedID)
        if (typeof unusedID === 'number') {
          var newPlaylist = {
            'id': Number(unusedID),
            'name': playlistName,
            'songs': []
          }
          playlists.push(newPlaylist)
          return writeFile('playlists.json', JSON.stringify(playlistsData, null, '    ')).then(function () {
            return {
              'status': 'ok',
              'value': newPlaylist
            }
          })
        } else {
          return Promise.reject({
            'status': 'error',
            'blame': 'server',
            'reason': 'maximum number of playlists reached'
          })
        }
      }
    })
  }
}
exports.addSongToPlaylist = function (songID, playlistID) {
  // TODO: implement api using database
  songID = Number(songID)
  playlistID = Number(playlistID)
  return Promise.all([getSongByID(songID), getAllPlaylists()]).then(function (values) {
    var playlistsData = values[1]
    var playlist = playlistsData['playlists'].find(function (playlist) {
      return playlist['id'] === playlistID
    })
    if (playlist) {
      playlist['songs'].push(songID)
      return writeFile('playlists.json', JSON.stringify(playlistsData, null, '    ')).then(function () {
        return {'status': 'ok'}
      })
    } else {
      return Promise.reject({
        'status': 'error',
        'blame': 'client',
        'reason': 'playlist not found'
      })
    }
  })
}
