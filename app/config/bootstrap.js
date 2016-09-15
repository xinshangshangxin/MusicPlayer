'use strict';

var path = require('path');

function bootstrapService(){
  // bootStrap Service
  if(global.config.env.bootstrap && global.config.env.bootstrap.length) {
    return Promise.each(global.config.env.bootstrap, function(name, i) {
      return Promise.try(function(){
        var service;
        try {
          service = require(path.join(__dirname, '../services/' + name));
          logger.info(name + ' start at ' + i);
          return service.lift();
        }
        catch(e) {
          logger.error(e);
          return Promise.reject(e);
        }
      });
    });
  }

  return Promise.resolve();
}

module.exports = bootstrapService;