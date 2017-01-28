var express = require('express');
var app = express();

app.get('/', function (request, response) {
  response.redirect('/playlists');
});
app.get('/playlists', function (request, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.end('Amazing playlist');
});

// Start the server on port 3000
app.listen(3000, function () {
  console.log('Amazing music app server listening on port 3000!');
});
