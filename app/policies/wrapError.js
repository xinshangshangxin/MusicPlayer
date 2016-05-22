'use strict';

function isUserDefineError(e) {
  return e instanceof ApplicationError;
}

function wrapError(e, otherError, errStatus) {
  /*jshint validthis:true */
  if(isUserDefineError(e)) {
    return this.status(errStatus || 400).json(e);
  }
  console.log(e && e.stack || e);
  return this.status(otherError.status || 400).json(otherError);
}

module.exports = function(req, res, next) {
  res.isUserDefineError = isUserDefineError;
  res.wrapError = wrapError;
  next();
};