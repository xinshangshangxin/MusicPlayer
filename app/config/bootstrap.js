'use strict';

var path = require('path');
var requireDirectory = require('require-directory');

function bootstrapService(){
  // bootStrap Service
  if(global.config.env.bootstrap && global.config.env.bootstrap.length) {
    var services = requireDirectory(module, path.resolve(__dirname, '../services'));
    return Promise.each(global.config.env.bootstrap, function(name, i) {
      console.log(name + ' start at ' + i);
      return services[name].lift();
    });
  }
}

module.exports = bootstrapService;