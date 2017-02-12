module.exports = function (sequelize, DataType) {
  var Song = sequelize.define('Song', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    album: DataType.STRING,
    title: DataType.STRING,
    artist: DataType.STRING,
    duration: DataType.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        models.Song.belongsToMany(models.Playlist, {through: 'Songs_Playlists'})
      }
    }
  })
  return Song
}
