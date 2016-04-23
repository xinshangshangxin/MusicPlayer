'use strict';

/*jshint -W079 */
var _ = require('lodash');

module.exports = {
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  port: process.env.VCAP_APP_PORT,
  mongo: {
    type: 'fun',
    dbName: 'noDbnName',
    fun: function() {
      try {
        return _.get(JSON.parse(process.env.VCAP_SERVICES), 'mongodb[0].credentials.uri');
      }
      catch(e) {
        return false;
      }
    }
  }
};