'use strict';

const execCmdKey = config.env.execCmdKey;


module.exports = function() {
  return function(req, res, next) {
    if((req.query.key || req.body.key) === execCmdKey) {
      return next();
    }

    return res.wrapError(new ApplicationError.ExecCmdKeyNotMatch());
  };
};