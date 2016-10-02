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

var transporter = nodemailer.createTransport(config.env.mailTransport);

var sendMail = function(mailOptions) {
  logger.info('start mailOptions');
  return new Promise(function(resolve, reject) {
    transporter.sendMail(_.assign({}, defaultMailOptions, mailOptions), function(error, info) {
      logger.info('end sendMail');
      if(error) {
        reject(error);
        return;
      }
      resolve(info);
    });
  });
};

module.exports = {
  sendMail: sendMail
};
