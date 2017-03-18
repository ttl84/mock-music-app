module.exports = function (sequelize, DataType) {
  var Playlist = sequelize.define('Playlist', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataType.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function (models) {
        models.Playlist.belongsToMany(models.Song, {
          through: {
            model: 'PlaylistSong',
            unique: false
          },
          unique: false
        })
        models.Playlist.belongsToMany(models.User, {
          through: 'PlaylistUser'
        })
      }
    }
  })
  return Playlist
}
