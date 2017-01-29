const url = require('url')
function Router () {
  this.routes = []
}
Router.prototype.route = function (options) {
  this.routes.push(options)
}
Router.prototype.respond = function (request, response) {
  var URL = url.parse(request.url, true)
  this.routes.forEach(function (route) {
    var match = URL.pathname.match(route['pattern'])
    if (route['method'] !== undefined) {
      match = match && (route['method'] === request.method)
    }
    if (match) {
      route['callback'](request, response)
    }
  })
}

module.exports = Router
