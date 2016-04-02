'use strict';

var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;

var mailSendService = require('../services/mailSendService.js');

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
  email: 'isWait 为false时必填, 命令执行完毕后 发送email'
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

function execCmds(req, res) {
  var arr = req.body.cmds;

  var isWait = req.body.isWait;
  var email = req.body.email;

  if(!_.isArray(arr)) {
    res.json(400, {
      code: 10001,
      msg: '参数错误, 请使用 help命令查看如何使用'
    });
  }

  if(!isWait) {
    res.json({
      code: 0,
      msg: '正在执行中, ' + email ? ('执行结果发送至: ' + email) : '无邮箱提醒'
    });
  }

  Promise
    .all(
      analyseCmd(arr)
        .map(function(item) {
          return execCmd(item);
        })
    )
    .then(function(data) {
      if(isWait) {
        res.json(data);
      }
      if(email) {
        return mailSendService.sendMail({
          subject: '成功: 执行ngGather命令',
          html: '<p>' + (new Date().toLocaleString()) + '</p>' + JSON.stringify(data)
        });
      }

    })
    .catch(function(e) {
      console.log(e);
      if(isWait) {
        res.json({
          code: 2001
        });
      }
      if(email) {
        return mailSendService.sendMail({
          subject: '失败: 执行ngGather命令',
          html: '<p>' + (new Date().toLocaleString()) + '</p>' + JSON.stringify(e)
        });
      }
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

function execCmd(option) {
  return new Promise(function(resolve, reject) {
    if(!option) {
      return resolve('no cmd exec');
    }

    var cmd = spawn(option.cmd, option.arg);
    var logStr = '[' + option.name + ']  ';

    cmd.on('exit', function(code) {
      if(code !== 0) {
        return reject({
          err: code,
          cmdOption: option
        });
      }
      return resolve({
        err: code,
        cmdOption: option
      });
    });

    cmd.on('error', function(err) {
      return reject({
        err: err,
        cmdOption: option
      });
    });

    cmd.stdout.on('data', function(data) {
      var str = data + '';
      if(/\[\d+:\d+:\d+\]/.test(str)) {
        logStr += str;
      }
      else {
        console.log(logStr + str.replace(/[\r\n]$/, ''));
        logStr = '[' + option.name + ']    ';
      }
    });

  });
}

module.exports = {
  execCmds: execCmds,
  helpInfo: helpInfo
};