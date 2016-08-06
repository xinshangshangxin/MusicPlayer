/**
 * WebhookController
 *
 */
'use strict';

var WebhookModel = require('../models/webhook');
var HookService = require('../services/HookService');

var ctrl = {
  errCode: {
    11001: '查询webhook错误',
    11002: '创建webHook失败',
    11003: '更新webHook失败',
    11004: '无法找到对应webhook',
    11005: '删除webhook失败',
  },
  query: function(req, res) {
    var conditions = {};

    var search = req.query.search;
    if(search) {
      conditions.or = [{
        'name': {'contains': search}
      }];
    }

    var options = null;
    var meta = {
      page: parseInt(req.query.page || 1),
      per_page: parseInt(req.query.per_page || 20)
    };

    if(req.query.page || req.query.per_page) {
      options = {
        skip: (meta.page - 1) * meta.per_page,
        limit: meta.per_page
      };
    }

    return Promise
      .props({
        total: WebhookModel.count(conditions),
        result: WebhookModel.find(conditions, null, options),
      })
      .then(function(result) {
        res.set('total', result.total);
        res.json(result.result);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11001, ctrl.errCode));
      });
  },
  get: function(req, res) {
    WebhookModel
      .findOne({
        _id: req.params.id
      })
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11001, ctrl.errCode));
      });
  },
  create: function(req, res) {
    var webhook = req.body;

    WebhookModel
      .create(webhook)
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11002, ctrl.errCode));
      });
  },
  update: function(req, res) {
    var webhook = req.body;

    WebhookModel.update({
      _id: webhook.id
    }, webhook)
      .then(function(data) {
        return res.json(data[0]);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11003, ctrl.errCode));
      });
  },
  destroy: function(req, res) {
    var id = req.params.id;
    var webHook;
    WebhookModel
      .findOne({
        _id: id
      })
      .then(function(data) {
        if(!data) {
          return new ApplicationError(11004, ctrl.errCode);
        }
        webHook = data;
        return data.remove();
      })
      .then(function() {
        return HookService.on('Webhook:afterDestroy', webHook);
      })
      .then(function() {
        res.json({});
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11005, ctrl.errCode));
      });
  },
  queryEvent: function(req, res) {
    res.json([{
      name: 'Test:afterCreate',
      displayName: '测试'
    }]);
  }
};

module.exports = ctrl;

