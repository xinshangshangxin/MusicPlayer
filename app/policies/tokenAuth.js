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
      return res.json(401, {
        code: 1002,
        msg: '没有token'
      });
    }

    jwt.verify(token, superSecret, function(err, decoded) {
      if(err) {
        return res.json(401, {
          code: 1001,
          msg: 'token错误'
        });
      }

      req.user = decoded;
      req.userId = decoded && decoded.id;

      if(!req.user || !req.userId) {
        return res.json(403, {
          code: 1001,
          msg: '用户不存在'
        });
      }

      next();
      return null;
    });
  };
};