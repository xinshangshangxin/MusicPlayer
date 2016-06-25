'use strict';

var nodemailer = require('nodemailer');

// 默认配置
var defaultMailOptions = {
  from: 'test4code@sina.com',
  to: ['codenotification@sina.com'],
  subject: 'subject',
  text: 'text',
  html: '<b>Hello world ✔</b>' // html body
};

var transporter = Promise.promisifyAll(nodemailer.createTransport(config.mailTransport));

var sendMail = function(mailOtions) {
  return transporter
    .sendMailAsync(_.assign({}, defaultMailOptions, mailOtions));
};

module.exports = {
  sendMail: sendMail
};