'use strict';

module.exports = {
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  port: process.env.NODE_PORT,
  ip: process.env.NODE_IP,
  mongo: {
    type: 'env',
    condition: 'host',
    username: 'OPENSHIFT_MONGODB_DB_USERNAME',
    password: 'OPENSHIFT_MONGODB_DB_PASSWORD',
    host: 'OPENSHIFT_MONGODB_DB_HOST',
    post: 'OPENSHIFT_MONGODB_DB_PORT',
    name: 'OPENSHIFT_APP_NAME',
    dbName: 'noDbnName'
  }
};