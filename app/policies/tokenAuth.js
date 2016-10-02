'use strict';

var jwt = require('jsonwebtoken');

var superSecret = config.superSecret;

function getTokenFromHeader(req) {
  var bearerHeader = req.headers.authorization;
  if(!bearerHeader) {
    return null;
  }

  var bearer = bearerHeader.split(' ');
  return bearer[1];
}

module.exports = function() {
  return function(req, res, next) {
    if(req.method === 'OPTIONS') {
      return res.end();
    }

    var token = req.body.token || req.query.token || getTokenFromHeader(req);

    if(!token) {
      return res.wrapError(new ApplicationError.TokenNotFound(), null, 401);
    }

    jwt.verify(token, superSecret, function(err, decoded) {
      if(err) {
        return res.wrapError(new ApplicationError.TokenNotVerify());
      }

      req.user = decoded;
      req.userId = decoded && decoded.id;

      if(!req.user || !req.userId) {
        return res.wrapError(new ApplicationError.UserNotFound(), null, 403);
      }

      next();
      return null;
    });
  };
};
