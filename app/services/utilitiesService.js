'use strict';

//var Promise = require('bluebird');

var svc = {
  isMongoError: function(err) {
    return err.name === 'MongoError';
  },
  isMongoDuplicateKeyError: function(err) {
    return err.code === 11000 && err.name === 'MongoError';
  }
};

module.exports = svc;