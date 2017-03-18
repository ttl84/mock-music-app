module.exports = function (sequelize, DataType) {
  var User = sequelize.define('User', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    username: {
      type: DataType.STRING,
      unique: true
    },
    password: {
      type: DataType.STRING,
      unique: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        models.Playlist.belongsToMany(models.User, {
          through: 'PlaylistUser'
        })
      }
    }
  })
  return User
}
