'use strict';

function isError(e) {
  return e && e.code && e.name !== 'MongoError';
}

function wrapError(e, otherError, errStatus) {
  /*jshint validthis:true */
  if(isError(e)) {
    return this.json(errStatus || 400, e);
  }
  console.log(e && e.stack || e);
  return this.json(otherError.status || 400, otherError);
}

module.exports = function(req, res, next) {
  res.isError = isError;
  res.wrapError = wrapError;
  next();
};