'use strict';

var path = require('path');
var requireDirectory = require('require-directory');

var env = process.env.NODE_ENV || 'development';
global.config = requireDirectory(module, path.resolve(__dirname, '.'), {
  exclude: function(path) {
    var reg = new RegExp('[\\/\\\\]env[\\/\\\\](?!' + env + ')');
    return reg.test(path) || /init\.js/.test(path);
  }
});
// reset env value
global.config.env = global.config.env[env];