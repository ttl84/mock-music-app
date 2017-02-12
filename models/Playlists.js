module.exports = function (sequelize, DataType) {
  return sequelize.define('Playlists', {
    name: DataType.STRING
  })
}
