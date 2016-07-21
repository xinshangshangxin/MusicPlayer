'use strict';

var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var utilitiesService = require('./utilitiesService');

var svc = {
  backupTimer: null,
  lift: function() {
    if(config.env.mongo.backupName && config.env.mongo.backupPassword) {

      svc.envCheck()
        .then(function() {
          // 启动立即备份
          svc.backup();
          // 清除上次调用
          clearInterval(svc.backupTimer);

          svc.backupTimer = setInterval(svc.backup, config.env.mongo.backupInterval || (12 * 60 * 60 * 1000));

          return Promise.resolve('start interval mongodb backup');
        })
        .catch(function(e) {
          console.log(e);
        });
    }
    else {
      console.log('skip mongodb backup');
      return Promise.resolve('skip mongodb backup');
    }
  },
  getGitSettingPath: function() {
    return path.resolve(config.env.mongo.backupDirPrefixes || path.resolve(__dirname, '../'), './mongod_back/git_back', '.git');
  },
  envCheck: function() {
    var gitSettingPath = svc.getGitSettingPath();

    console.log('mongodbBackupService.js; gitSettingPath', JSON.stringify(gitSettingPath, null, 2));
    return fs.accessAsync(gitSettingPath);
  },
  backup: function() {
    console.log('start mongodb backup!');
    var shFilePath = path.resolve(__dirname, '../config/backup/openshiftMongodbBackup.sh');

    var opt = {
      cmd: 'sh',
      arg: [shFilePath, config.env.mongo.backupName, config.env.mongo.backupPassword, config.env.mongo.backupDirPrefixes || './']
    };

    return utilitiesService.spawnAsync(opt);
  }
};

module.exports = svc;