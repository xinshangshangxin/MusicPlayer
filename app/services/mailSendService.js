'use strict';

var _ = require('lodash');
var nodemailer = require('nodemailer');
var Promise = require('bluebird');

// 从环境变量中获取账号
var getEnvSetting = function() {
  return config.mail || {};
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
  port: 465,
  secure: true,
  tls: {rejectUnauthorized: false},
  auth: {
    user: 'test4code@sina.com',
    pass: 'Test4code;'
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