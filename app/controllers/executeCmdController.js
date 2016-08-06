'use strict';

var executeCmdService = require('../services/executeCmdService.js');

var ctrl = {
  execCmds: function(req, res) {
    return executeCmdService
      .execCmds(req.body)
      .then(function(data) {
        console.log('data:    ', data);
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e);
      });
  },
  help: function(req, res) {
    return res.send('<pre>' + JSON.stringify(executeCmdService.helpInfo, null, 2) + '</pre>');
  },
  tryAutoDeploy: executeCmdService.tryAutoDeploy
};

module.exports = ctrl;