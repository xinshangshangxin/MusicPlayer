'use strict';

var path = require('path');
var requireDirectory = require('require-directory');
var winston = require('winston');

// set bluebird and lodash
global.__Promise__ = global.Promise;
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

// set logger
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'info',
      colorize: true,
      timestamp: function() {
        return new Date().toISOString();
      },
      formatter: function(options) {
        return options.timestamp() +' '+ options.level +' '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '' );
      }
    })
  ]
});

global.logger = logger;