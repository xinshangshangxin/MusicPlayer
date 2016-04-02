'use strict';

var Promise = require('bluebird');
function closeConnection() {
  require('../services/dbService').closeMongoose();
}

Promise
  .resolve()
  .finally(function() {
    closeConnection();
  });


