module.exports = function (sequelize, DataType) {
  var Session = sequelize.define('Session', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionKey: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function (models) {
        models.Session.belongsTo(models.User, {
          'foreignKey': 'sessionUser'
        })
      }
    }
  })
  return Session
}
