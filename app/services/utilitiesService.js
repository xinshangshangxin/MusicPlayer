'use strict';

var exec = require('child_process').exec;
var iconv = require('iconv-lite');
var spawn = require('child_process').spawn;

var svc = {
  typeCodes: {
    xiami: 0,
    qq: 1,
    netease: 2,
  },
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
      var opt = {stdio: 'inherit'};
      // set ENV
      var env = Object.create(process.env);
      env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
      opt.env = env;

      var cmd = spawn(option.cmd, option.arg, opt);
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
  },
  defer: function() {
    var resolve, reject;
    var promise = new Promise(function() {
      resolve = arguments[0];
      reject = arguments[1];
    });
    return {
      resolve: resolve,
      reject: reject,
      promise: promise
    };
  },
  changeEncoding: function(data, encoding, noCheck) {
    var val = iconv.decode(data, encoding || 'utf8');
    if(!noCheck && encoding !== 'gbk' && val.indexOf('�') !== -1) {
      val = iconv.decode(data, 'gbk');
    }
    return val;
  },
};

module.exports = svc;