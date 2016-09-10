'use strict';

require('../config/globalInit.js');

function closeConnection() {
  require('../services/dbService').closeMongoose();
}

Promise
  .resolve()
  .finally(function() {
    closeConnection();
  });


