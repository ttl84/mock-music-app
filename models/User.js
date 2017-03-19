module.exports = function (sequelize, DataType) {
  var User = sequelize.define('User', {
    username: {
      type: DataType.STRING,
      primaryKey: true
    },
    password: {
      type: DataType.STRING,
      unique: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        models.User.belongsToMany(models.Playlist, {
          through: 'PlaylistUser'
        })
      }
    }
  })
  return User
}
