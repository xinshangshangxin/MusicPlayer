'use strict';

function isUserDefineError(e) {
  return e instanceof ApplicationError || !(e instanceof Error);
}

function wrapError(e, otherError, errStatus) {
  /*jshint validthis:true */
  if(isUserDefineError(e)) {
    return this.status(errStatus || 400).json(e);
  }
  logger.warn(e);
  if(otherError) {
    return this.status(otherError.status || 400).json(otherError);
  }
  return this.status(400).json(new ApplicationError.UnknownError());
}

module.exports = function(req, res, next) {
  res.isUserDefineError = isUserDefineError;
  res.wrapError = wrapError;
  next();
};