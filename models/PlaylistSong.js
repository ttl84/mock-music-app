module.exports = function (sequelize, DataType) {
  var PlaylistSong = sequelize.define('PlaylistSong', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  })
  return PlaylistSong
}
