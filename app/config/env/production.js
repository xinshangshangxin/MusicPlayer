'use strict';

module.exports = {
  dbName: 'template',
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  mailTransport: {
    host: 'smtp.sina.com',
    port: 465,
    secure: true,
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: 'test4code@sina.com',
      pass: 'Test4code;'
    }
  },
  mongo: {
    dbName: 'template',
    collectionPrefix: '',
  },
  update: {
    ref: 'master'
  },
  port: process.env.PORT,
  bootstrap: [
    // 'webhookService',
  ]
};