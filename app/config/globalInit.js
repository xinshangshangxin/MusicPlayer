'use strict';

var path = require('path');
var requireDirectory = require('require-directory');
var pino = require('pino');

// set bluebird and lodash
global.Promise = require('bluebird');
global._ = require('lodash');

// set global ApplicationError
global.ApplicationError = require('./ApplicationError');

// set env
var env = (process.env.NODE_ENV || 'development').trim();
global.config = requireDirectory(module, path.resolve(__dirname, '.'), {
  exclude: function(path) {
    var reg = new RegExp('[\\/\\\\]env[\\/\\\\](?!' + env + ')');
    return reg.test(path) || /init\.js/.test(path);
  }
});
// reset env value
global.config.env = global.config.env[env];


// log
var pretty;
if(env === 'development') {
  pretty = pino.pretty();
  pretty.pipe(process.stdout);
}

global.logger = pino(undefined, pretty);

