'use strict';

var cors = require('cors');
var express = require('express');
var router = express.Router();

var executeCmdController = require('../controllers/executeCmdController.js');
var tokenAuth = require('../policies/tokenAuth.js');
var webhookController = require('../controllers/webhookController');
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
  .post('/api/v1/auto-deploy', function(req, res) {
    res.end('ok');

    executeCmdController
      .tryAutoDeploy(req.body)
      .then(function(data) {
        console.log(data);
      })
      .catch(function(e) {
        console.log(e);
      });
  })
  .get('/api/v1/webhook-event', webhookController.queryEvent)
  .get('/api/v1/webhook', webhookController.query)
  .get('/api/v1/webhook/:id', webhookController.get)
  .post('/api/v1/webhook', webhookController.create)
  .put('/api/v1/webhook/:id', webhookController.update)
  .delete('/api/v1/webhook/:id', webhookController.destroy)
;

module.exports = router;
