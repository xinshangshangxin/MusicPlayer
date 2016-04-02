'use strict';

var cors = require('cors');
var express = require('express');
var router = express.Router();

var executeCmdController = require('../controllers/executeCmdController.js');
var tokenAuth = require('../policies/tokenAuth.js');
var wrapError = require('../policies/wrapError.js');

var execCmdKey = config.execCmdKey;

router
  .all('*', wrapError)
  .all(/^\/(?=api)/, cors())
  .all(/^\/(?=api\/v\d+\/execCmds)/, function(req, res, next) {
    if((req.query.key || req.body.key) === execCmdKey) {
      return next();
    }
    return res.json(400, {
      code: 1001
    });
  })
  .get(/^\/(?!api)/, function(req, res) {
    res.render('index.html');
  })
  .get(/^\/(?=api\/v\d+\/execCmds)/, executeCmdController.help)
  .post(/^\/(?=api\/v\d+\/execCmds)/, tokenAuth(), executeCmdController.execCmds)
;

module.exports = router;
