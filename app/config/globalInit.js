'use strict';

var path = require('path');
var requireDirectory = require('require-directory');
var util = require('util');

// set bluebird and lodash
global.__Promise__ = global.Promise;
global.Promise = require('bluebird');
global._ = require('lodash');

// set global ApplicationError
global.ApplicationError = function(code, message, data, constr) {
  Promise.OperationalError.call(constr || this, message || 'no ApplicationError message ');
  this.errCode = code;
  this.message = message;
  this.code = code;
  this.data = data;
};
util.inherits(ApplicationError, Promise.OperationalError);
ApplicationError.prototype.name = 'Application Error';

// set env
var env = (process.env.NODE_ENV || 'development').trim();
global.config = requireDirectory(module, path.resolve(__dirname, '.'), {
  exclude: function(path) {
    var reg = new RegExp('[\\/\\\\]env[\\/\\\\](?!' + env + ')');
    return reg.test(path) || /(bootstrap|globalInit)\.js/.test(path);
  }
});
// reset env value
global.config.env = global.config.env[env];