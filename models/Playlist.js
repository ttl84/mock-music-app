module.exports = function (sequelize, DataType) {
  var Playlist = sequelize.define('Playlist', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    name: DataType.STRING
  }, {
    classMethods: {
      associate: function (models) {
        models.Playlist.belongsToMany(models.Song, {through: 'Songs_Playlists'})
      }
    }
  })
  return Playlist
}
