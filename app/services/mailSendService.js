'use strict';

var _ = require('lodash');
var nodemailer = require('nodemailer');
var Promise = require('bluebird');

// 从环境变量中获取账号
var getEnvSetting = function() {
  var _transport = {};

  if(process.env.host) {
    _transport.host = process.env.host;
  }
  if(process.env.port) {
    _transport.port = process.env.port;
  }
  if(process.env.user) {
    _transport.auth = _transport.auth || {};
    _transport.auth.user = process.env.user;
  }
  if(process.env.pass) {
    _transport.auth = _transport.auth || {};
    _transport.auth.pass = process.env.pass;
  }
  if(process.env.service) {
    _transport.service = process.env.service;
  }

  return _transport;
};

// 默认配置
var defaultMailOptions = {
  from: 'test4code@sina.com',
  to: ['codenotification@sina.com'],
  subject: 'subject',
  text: 'text',
  html: '<b>Hello world ✔</b>' // html body
};

var defaultTransport = {
  host: 'smtp.sina.com',
  port: 25,
  auth: {
    user: 'test4code@sina.com',
    pass: 'Test4code;'
  },
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
};

var transporter = Promise
  .promisifyAll(
    nodemailer.createTransport(_.assign(defaultTransport, getEnvSetting()))
  );

var sendMail = function(mailOtions) {
  return transporter
    .sendMailAsync(_.assign({}, defaultMailOptions, mailOtions));
};

module.exports = {
  sendMail: sendMail
};