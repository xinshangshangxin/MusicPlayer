'use strict';

var cors = require('cors');
var express = require('express');
var router = express.Router();

var executeCmdController = require('../controllers/executeCmdController.js');
var musicController = require('../controllers/musicController');
var requestForwardController = require('../controllers/requestForwardController');
var tokenAuth = require('../policies/tokenAuth.js');
var webHookService = require('../services/webHookService.js');
var wrapError = require('../policies/wrapError.js');

var execCmdKey = config.env.execCmdKey;

router
  .all('*', wrapError)
  .all(/^\/(?=api)/, cors())
  .all(/^\/(?=api\/v\d+\/cmds)/, function(req, res, next) {
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
  .get(/^\/(?=api\/v\d+\/cmds)/, executeCmdController.help)
  .post(/^\/(?=api\/v\d+\/cmds)/, tokenAuth(), executeCmdController.execCmds)
  .post(/^\/(?=api\/v\d+\/webhook)/, function(req, res) {
    res.end('ok');
    webHookService
      .tryUpdate(req.body)
      .then(function(data) {
        console.log(data);
      });
  })
  .get('/api/v1/music/search/:key', musicController.search)
  .get('/api/v1/music/detail/:id', musicController.detail)
  .get('/api/v1/music/play', musicController.play)
  .get('/api/v1/music/lyric', musicController.lyric)
  .get('/api/v1/request/forward', requestForwardController.forward)
;

module.exports = router;
