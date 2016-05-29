'use strict';

var path = require('path');
var mailSendService = require('./mailSendService');
var utilitiesService = require('./utilitiesService');

var env = (process.env.NODE_ENV || 'development').trim();

var svc = {
  tryUpdate: function(body) {
    var ref = (body.ref || '').replace('refs/heads/', '');
    if(!ref || ref !== _.get(config, 'env.update.ref')) {
      return Promise.resolve('not match');
    }
    var url = _.get(body, 'repository.https_url');
    var name = _.get(body, 'repository.name');
    var appPath = env === 'development' ? 'app/app.js' : 'app.js';
    if(!url || !name) {
      return Promise.reject(new Error('no url or no name'));
    }

    // svc.tryPm2Start({
    //   ref: ref,
    //   url: url,
    //   name: name,
    //   appPath: appPath
    // });

    var cmds = [
      'git pull origin ' + ref,
      'pm2 restart ' + appPath
    ];

    return mailSendService
      .sendMail({
        subject: '开始部署：' + name + '/' + ref,
        html: '<p>' + (new Date().toLocaleString()) + '</p>'
      })
      .then(function() {
        return utilitiesService.execAsync(cmds.join(' && '));
      })
      .catch(function(e) {
        console.log(e);
        return mailSendService.sendMail({
          subject: '自动部署失败',
          html: '<p>' + (new Date().toLocaleString()) + '</p>' + JSON.stringify(e)
        });
      });
  },
  tryPm2Start: function(options) {
    var ref = options.ref;
    var url = options.url;
    var name = options.name;
    var appPath = options.appPath;

    var cmds = [
      'rm -rf deploy',
      'mkdir deploy',
      'cd deploy',
      'git clone -b ' + ref + ' ' + url
    ];

    return utilitiesService
      .execAsync(cmds.join(' && '))
      .then(function() {
        return svc.tryStartUp(path.resolve('./deploy/' + name), appPath);
      })
      .then(function() {
        console.log('pm2 start');
        var cmds = [
          'git pull',
          'pm2 restart ' + appPath
        ];
        return utilitiesService.execAsync(cmds.join(' && '));
      })
      .then(function(info) {
        console.log('pm2 start info: ', info);
      })
      .catch(function(e) {
        console.log(e);
        return mailSendService.sendMail({
          subject: '自动部署失败',
          html: '<p>' + (new Date().toLocaleString()) + '</p>' + JSON.stringify(e)
        });
      });
  },
  tryStartUp: function(dir, appPath) {
    console.log('tryStartUp');
    var cmds = [
      'cd ' + dir,
      'set NODE_ENV=' + env,
      'set PORT=' + 1357,
      'node ' + appPath
    ];
    return utilitiesService.execAsync(cmds.join(' && '));
  }
};

module.exports = svc;