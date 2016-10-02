/**
 * WebhookController
 *
 */
'use strict';

var webhookModel = require('../models/webhookModel');
var hookService = require('../services/hookService');
var utilitiesService = require('../services/utilitiesService');

var ctrl = {
  query: function(req, res) {
    var opt = {};

    var search = req.query.search;
    if(search) {
      opt.condition = {
        $or: [{
          name: utilitiesService.escapeRegExp(search)
        }]
      };
    }

    return utilitiesService.conditionQuerySend(webhookModel, req, res, new ApplicationError.QueryError(), opt);
  },
  get: function(req, res) {
    webhookModel
      .findOne({
        _id: req.params.id
      })
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError.GetError());
      });
  },
  create: function(req, res) {
    var webhook = req.body;

    webhookModel
      .create(webhook)
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError.CreateError());
      });
  },
  update: function(req, res) {
    var webhook = req.body;

    webhookModel.update({
      _id: webhook.id
    }, webhook)
      .then(function(data) {
        return res.json(data[0]);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError.UpdateError());
      });
  },
  destroy: function(req, res) {
    var id = req.params.id;
    var webHook;
    webhookModel
      .findOne({
        _id: id
      })
      .then(function(data) {
        if(!data) {
          return new ApplicationError.NotFoundWebhook();
        }
        webHook = data;
        return data.remove();
      })
      .then(function() {
        return hookService.on('Webhook:afterDestroy', webHook);
      })
      .then(function() {
        res.json({});
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError.DeleteError());
      });
  },
  queryEvent: function(req, res) {
    res.json(_.map(hookService.events, function(value) {
      return value;
    }));
  }
};

module.exports = ctrl;

