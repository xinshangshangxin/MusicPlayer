'use strict';

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var svc = {
  isMongoError: function(err) {
    return err.name === 'MongoError';
  },
  isMongoDuplicateKeyError: function(err) {
    return err.code === 11000 && err.name === 'MongoError';
  },
  spawnAsync: function(option) {
    if(!option) {
      return Promise.reject(new Error('no option'));
    }

    return new Promise(function(resolve, reject) {
      if(option.platform) {
        option.cmd = (process.platform === 'win32' ? (option.cmd + '.cmd') : option.cmd);
      }
      var cmd = spawn(option.cmd, option.arg, {stdio: 'inherit'});
      cmd.on('error', function(err) {
        console.log(err);
      });
      cmd.on('exit', function(code) {
        if(code !== 0) {
          return reject(code);
        }
        resolve();
      });
    });
  },
  execAsync: function(cmd) {
    return new Promise(function(resolve, reject) {
      exec(cmd, function(error, stdout, stderr) {
        if(error) {
          return reject(error);
        }

        resolve(stdout || stderr);
      });
    });
  }
};

module.exports = svc;