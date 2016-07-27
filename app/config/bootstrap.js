'use strict';

var path = require('path');

function bootstrapService(){
  // bootStrap Service
  if(global.config.env.bootstrap && global.config.env.bootstrap.length) {
    return Promise.each(global.config.env.bootstrap, function(name, i) {
      var service;
      try {
        service = require(path.join(__dirname, '../services/' + name));
        console.log(name + ' start at ' + i);
        return service.lift();
      }
      catch(e) {
        console.log(e);
        return Promise.reject(e);
      }
    });
  }

  return Promise.resolve();
}

module.exports = bootstrapService;