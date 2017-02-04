const sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('app.db', sqlite3.OPEN_READWRITE)

function getAllSongs () {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Songs', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
function getPlaylistsTable () {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Playlists', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
function getSongsPlaylistsTable () {
  return new Promise((resolve, reject) => {
    db.all('SELECT playlist_id, song_id FROM Songs_Playlists', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
function getAllPlaylists () {
  return Promise.all([getPlaylistsTable(), getSongsPlaylistsTable()]).then(values => {
    var playlists = values[0]
    var mappings = values[1]
    var idMap = {}
    playlists.forEach(playlist => {
      idMap[playlist['id']] = playlist
      playlist['songs'] = []
    })
    mappings.forEach(mapping => {
      idMap[mapping['playlist_id']]['songs'].push(mapping['song_id'])
    })
    return playlists
  })
}
getAllPlaylists().then(value => {
  value.forEach(row => {
    console.log(row)
  })
})
