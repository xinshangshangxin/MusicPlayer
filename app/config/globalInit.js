'use strict';

var path = require('path');
var requireDirectory = require('require-directory');
var winston = require('winston');
var util = require('util');

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

var transport = new (winston.transports.Console)({
  level: 'info',
  timestamp: function() {
    return new Date().toISOString();
  },
  formatter: function(options) {
    var stackInfo = '';
    if(options.meta && options.meta.stack) {
      stackInfo = '    ' + options.meta.stack;
      delete options.meta.stack;
    }

    return winston.config.colorize(options.level, options.timestamp() + ' ' + options.level) + ' ' + (undefined !== options.message ? options.message : '') + (options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '' ) + stackInfo;
  }
});

var originalLog = transport.log;
transport.log = function(level, msg, meta, callback) {
  // mongodb 的 doc文档
  if(meta && '_doc' in meta && 'save' in meta) {
    meta = JSON.parse(JSON.stringify(meta));
  }
  return originalLog.call(transport, level, msg, meta, callback);
};

// set logger
var logger = new (winston.Logger)({
  transports: [
    transport
  ]
});

global.logger = logger;