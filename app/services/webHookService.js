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

    var dir = path.resolve(__dirname, '../');
    var cmds = [
      'cd ' + dir,
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
  }
};

module.exports = svc;