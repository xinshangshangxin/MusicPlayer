'use strict';

function isUserDefineError(e) {
  return e instanceof ApplicationError || !(e instanceof Error);
}

function wrapError(e, otherError, errStatus) {
  /*jshint validthis:true */
  if(isUserDefineError(e)) {
    return this.status(errStatus || 400).json(e);
  }
  console.log(e && e.stack || e);
  if(otherError) {
    return this.status(otherError.status || 400).json(otherError);
  }
  return this.status(400).json({
    code: 100,
    msg: '未知错误，请反馈！'
  });
}

module.exports = function(req, res, next) {
  res.isUserDefineError = isUserDefineError;
  res.wrapError = wrapError;
  next();
};