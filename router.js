const url = require('url')
function Router () {
  this.routes = []
  this.fallbackCallback = null
}
Router.prototype.route = function (options) {
  this.routes.push(options)
}
Router.prototype.fallback = function (callback) {
  this.fallbackCallback = callback
}
Router.prototype.respond = function (request, response) {
  var URL = url.parse(request.url, true)
  var route = this.routes.find(function (route) {
    var match = URL.pathname.match(route['pattern'])
    if (route['method'] !== undefined) {
      match = match && (route['method'] === request.method)
    }
    return match
  })
  if (route) {
    route['callback'](request, response)
  } else if (this.fallbackCallback) {
    this.fallbackCallback(request, response)
  }
}

module.exports = Router
