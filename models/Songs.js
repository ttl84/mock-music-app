module.exports = function (sequelize, DataType) {
  return sequelize.define('Songs', {
    album: DataType.STRING,
    title: DataType.STRING,
    artist: DataType.STRING,
    duration: DataType.INTEGER
  })
}
