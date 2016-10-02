'use strict';

var cors = require('cors');
var express = require('express');
var router = express.Router();

var execCmdAuth = require('../policies/execCmdAuth');
var executeCmdController = require('../controllers/executeCmdController.js');
var musicController = require('../controllers/musicController');
var requestForwardController = require('../controllers/requestForwardController');
var tokenAuth = require('../policies/tokenAuth.js');
var webhookController = require('../controllers/webhookController');
var wrapError = require('../policies/wrapError.js');


router
  .all('*', wrapError)
  .all(/^\/(?=api)/, cors())
  // exec cmd
  .get(/^\/(?!api)/, function(req, res) {
    res.render('index.html');
  })
  .all('/api/:version(v\\d+)/cmds', execCmdAuth())
  .get('/api/:version(v\\d+)/cmds', executeCmdController.help)
  .post('/api/:version(v\\d+)/cmds', tokenAuth(), executeCmdController.execCmds)
  // auto deploy
  .post('/api/v1/auto-deploy', function(req, res) {
    res.end('ok');

    executeCmdController
      .tryAutoDeploy(req.body)
      .then(function(data) {
        logger.info(data);
      })
      .catch(function(e) {
        logger.info(e);
      });
  })
  // webhook
  .get('/api/v1/webhook-event', webhookController.queryEvent)
  .get('/api/v1/webhook', webhookController.query)
  .get('/api/v1/webhook/:id', webhookController.get)
  .post('/api/v1/webhook', webhookController.create)
  .put('/api/v1/webhook/:id', webhookController.update)
  .delete('/api/v1/webhook/:id', webhookController.destroy)
.get('/api/v1/music/search/:key', musicController.search)
  .get('/api/v1/music/detail/:id', musicController.detail)
  .get('/api/v1/music/play', musicController.play)
  .get('/api/v1/music/lyric', musicController.lyric)
  .get('/api/v1/request/forward', requestForwardController.forward)

;

module.exports = router;
