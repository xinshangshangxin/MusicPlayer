'use strict';

require('./config/init.js');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var http = require('http');
var logger = require('morgan');
var path = require('path');

var routes = require('./routes/routes');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// err
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.json({
    err: err
  });
});

var port = config.env.port || '1337';
var ip = config.env.ip || 'localhost';
var server = http.createServer(app);
server.listen(port, ip);

function onError(error) {
  if(error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch(error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : ('http://' + addr.address + ':' + addr.port);
  console.log('Listening on: ' + bind);
}

server.on('error', onError);
server.on('listening', onListening);
