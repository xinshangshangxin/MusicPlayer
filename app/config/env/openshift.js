'use strict';

module.exports = {
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  port: process.env.PORT || '8080',
  ip: process.env.OPENSHIFT_DIY_IP,
  mongo: {
    type: 'env',
    condition: 'host',
    host: 'OPENSHIFT_DIY_IP',
    post: 27017,
    dbName: 'noDbName'
  },
  update: {
    ref: 'production'
  }
};