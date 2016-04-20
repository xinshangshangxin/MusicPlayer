'use strict';

module.exports = {
  dbName: 'noDbnName',
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  mongo: {
    dbName: 'noDbnName'
  },
  bootstrap: []
};


//var mongoOptionalConfig = {
//  coding: {
//    type: 'fun',
//    fun: function() {
//      try {
//        return _.get(JSON.parse(process.env.VCAP_SERVICES), 'mongodb[0].credentials.uri');
//      }
//      catch(e) {
//        return false;
//      }
//    }
//  },
//  docker: {
//    type: 'env',
//    condition: 'host',
//    username: 'MONGO_USERNAME',
//    password: 'MONGO_PASSWORD',
//    host: 'MONGO_PORT_27017_TCP_ADDR',
//    post: 'MONGO_PORT_27017_TCP_PORT',
//    name: 'MONGO_INSTANCE_NAME'
//  },
//  daoCloud: {
//    type: 'env',
//    condition: 'host',
//    username: 'MONGODB_USERNAME',
//    password: 'MONGODB_PASSWORD',
//    host: 'MONGODB_PORT_27017_TCP_ADDR',
//    post: 'MONGODB_PORT_27017_TCP_PORT',
//    name: 'MONGODB_INSTANCE_NAME'
//  },
//  openshift: {
//    type: 'env',
//    condition: 'host',
//    username: 'OPENSHIFT_MONGODB_DB_USERNAME',
//    password: 'OPENSHIFT_MONGODB_DB_PASSWORD',
//    host: 'OPENSHIFT_MONGODB_DB_HOST',
//    post: 'OPENSHIFT_MONGODB_DB_PORT',
//    name: 'OPENSHIFT_APP_NAME'
//  }
//};