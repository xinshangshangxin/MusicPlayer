'use strict';

var spawn = require('child_process').spawn;
var notifier = require('node-notifier');

var Promise = require('bluebird');
var cmdPromise = Promise.promisify(execCmd);

var gulpCmd = {
  cmd: 'gulp',
  platform: true,
  arg: ['dev']
};
var serverCmd = {
  cmd: 'node-dev',
  platform: true,
  arg: ['app/app.js']
};

gulpStart();

cmdPromise(serverCmd)
  .then(function(data) {
    console.log('cmdPromise(serverCmd): ', data);
  })
  .catch(function(e) {
    console.log('cmdPromise(serverCmd) err: ', e);
  });

function gulpStart() {
  cmdPromise(gulpCmd)
    .then(function() {
    })
    .catch(function(e) {
      console.log('cmdPromise(gulpCmd) err: ', e);
      notifier.notify({
        title: 'gulp error',
        message: 'restarting'
      });
      gulpStart();
    });
}

function execCmd(option, done) {
  if (option.platform) {
    option.cmd = (process.platform === 'win32' ? (option.cmd + '.cmd') : option.cmd);
  }
  var cmd = spawn(option.cmd, option.arg, {stdio: 'inherit'});
  cmd.on('error', function(err) {
    console.log(err);
  });
  cmd.on('exit', function(code) {
    if(code !== 0) {
      return done(code);
    }
    done();
  });
}