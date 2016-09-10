/**
 * ApplicationError
 *
 */

'use strict';
var util = require('util');

var errors = {
  SystemBusy: {code: -1, message: 'system busy, retry later'},
  Success: {code: 0, message: 'success'},
  InternalError: {code: 1, message: 'internal error, contact us'},
  RequireAppKey: {code: 10001, message: 'require appKey'},
  RequireAppSecret: {code: 10002, message: 'require appSecret'},
  InvalidAppKey: {code: 10004, message: 'invalid appKey'},
  InvalidAppSecret: {code: 10005, message: 'invalid appSecret'},
  queryError: {code: 10005, message: 'invalid appSecret'},
  //global
  QueryError: {code: 100101, message:'查询列表出错'},
  GetError: {code: 100102, message:'查询详情出错'},
  CreateError: {code: 100103, message:'创建出错'},
  UpdateError: {code: 100104, message:'更新出错'},
  DeleteError: {code: 100105, message:'删除出错'},
  //WebhookController
  NotFoundWebhook: {code: 200101, message: '无法找到对应的webhook'},
};

function ApplicationError() {
}

util.inherits(ApplicationError, Error);

function BuildErrorType(errorConfig) {
  function ConcreteCustomError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || errorConfig.message;

    this.extra = extra;
    this.code = errorConfig.code;

    //compatible
    this.err = errorConfig.code;
  }

  util.inherits(ConcreteCustomError, ApplicationError);
  return ConcreteCustomError;
}

_.forEach(errors, function(errorConfig, errorName) {
  ApplicationError[errorName] = BuildErrorType(errorConfig);
});

module.exports = ApplicationError;