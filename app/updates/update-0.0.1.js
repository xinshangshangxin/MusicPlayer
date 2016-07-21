'use strict';

require('../config/init.js');

function closeConnection() {
  require('../services/dbService').closeMongoose();
}

Promise
  .resolve()
  .finally(function() {
    closeConnection();
  });


