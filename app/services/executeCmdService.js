'use strict';

var path = require('path');

var mailSendService = require('../services/mailSendService.js');
var utilitiesService = require('../services/utilitiesService.js');

var env = (process.env.NODE_ENV || 'development').trim();

var helpInfo = {
  cmds: [{
    name: 'update',
    option: 'update-X.X.X',
    argStr: '参数',
    detail: '使用 name 和 option 执行某update'
  }, {
    name: 'userDefine',
    option: '{cmd: xxx, arg: xxx}',
    detail: '使用spawn(cmd, arg) 执行命令 '
  }],
  isWait: '是否等待命令执行完毕, bool, 默认false',
  email: '命令执行完毕后将结果发送至此email'
};

function userDefine(userOptionObj) {
  if(userOptionObj.cmd && userOptionObj.arg) {
    if(!_.isArray(userOptionObj.arg)) {
      userOptionObj.arg = [userOptionObj.arg];
    }

    return {
      cmd: (userOptionObj.cmd + '').trim(),
      arg: userOptionObj.arg
    };
  }
  return null;
}

function updateFun(str, argStr) {
  var arg = [path.resolve(__dirname, '../updates/', str)];
  if(argStr) {
    arg.push(argStr);
  }
  if(/update-\d+/.test(str)) {
    return {
      name: str,
      cmd: 'node',
      arg: arg
    };
  }
  return null;
}

function execCmds(option) {

  var cmds = option.cmds;
  var isWait = option.isWait;
  var email = option.email;

  if(!_.isArray(cmds)) {
    return Promise.reject({
      code: 10001,
      msg: '参数错误, 请使用help命令查看如何使用'
    });
  }

  return new Promise(function(resolve, reject) {
    if(!isWait) {
      resolve(Promise.resolve({
        code: 0,
        msg: '正在执行中, ' + email ? ('执行结果发送至: ' + email) : '无邮箱提醒'
      }));
    }

    return Promise
      .mapSeries(analyseCmd(cmds), function(item) {
        return utilitiesService.spawnAsync(item).reflect();
      })
      .then(function(data) {
        return wrapResult(data, email);
      })
      .then(function(data) {
        if(isWait) {
          resolve(data);
        }
      })
      .catch(function(e) {
        console.log(e);
        if(isWait) {
          reject(e);
        }
      });
  });
}

function wrapResult(arr, email) {
  var successResult = [];
  var errResult = [];
  arr.forEach(function(inspection) {
    if(inspection.isFulfilled()) {
      successResult.push(inspection.value());
    } else {
      errResult.push(inspection.reason());
    }
  });

  var str = '';
  if(errResult.length) {
    str += 'failed: ' + errResult.length + '    ';
  }

  str += 'successed: ' + successResult.length + '    ';
  str += 'all: ' + arr.length;

  var body = str + '\n' + errResult.concat(successResult);

  return Promise
    .resolve()
    .then(function() {
      if(email) {
        return mailSendService.sendMail({
          subject: str,
          html: '<p>' + (new Date().toLocaleString()) + '</p>' + body
        });
      }
    })
    .then(function() {
      return {
        code: 0,
        msg: body
      };
    });
}

function analyseCmd(arr) {
  return arr.map(function(obj) {

    if(!obj || !_.isObject(obj)) {
      return null;
    }
    if(obj.name === 'update') {
      return updateFun(obj.option, obj.argStr);
    }
    return userDefine(obj.option);
  });
}

function tryAutoDeploy(body) {
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

module.exports = {
  execCmds: execCmds,
  tryAutoDeploy: tryAutoDeploy,
  helpInfo: helpInfo
};
