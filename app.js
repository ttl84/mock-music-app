// Import the http library
var http = require('http');
var express = require('express');
var app = express();
// Create a server and provide it a callback to be executed for every HTTP request
// coming into localhost:3000.
app.get('/', function (request, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.end('Amazing playlist');
});

// Start the server on port 3000
app.listen(3000, function () {
  console.log('Amazing music app server listening on port 3000!');
});
