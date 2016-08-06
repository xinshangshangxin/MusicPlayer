'use strict';

var rp = Promise.promisify(require('request'));

var WebhookModel = require('../models/webhook');
var HookService = require('./HookService');

var svc = {
  lift: function() {
    return HookService.registerHook(svc.on.bind(svc));
  },
  resolveValue: function(body, data) {
    return _.reduce(body, function(result, item) {
      if(!item.value) {
        return result;
      }

      item.value = item.value.trim();
      if(/^{{(.*)}}$/gi.test(item.value)) {
        result[item.name] = _.get(data, RegExp.$1, '');
      }
      else {
        result[item.name] = item.value;
      }
      return result;
    }, {});
  },
  runHook: function(data, hook) {
    var method = (hook.method || 'POST').toUpperCase();
    var contentType = hook.contentType || 'application/json';

    return Promise
      .try(function() {
        if(!hook.payloadUrl) {
          return Promise.reject(new Error('缺少 url'));
        }

        var options = {
          proxy: false,
          followRedirect: false,
          url: hook.payloadUrl,
          method: method,
          headers: svc.resolveValue(hook.headerFields, data)
        };

        if(method === 'GET') {
          return options;
        }

        var body = svc.resolveValue(hook.bodyFields, data);
        switch(contentType) {
          case 'application/json':
            options.json = body || true;
            break;
          case 'application/x-www-form-urlencoded':
            options.form = body;
            break;
          default:
            return Promise.reject(new Error('Webhook Error: unsupported contentType:' + contentType));
        }

        return options;
      })
      .then(function(options) {
        return rp(options);
      });
  },
  runHooks: function(data, hooks) {
    return Promise.map(hooks, function(hook) {
      return svc.runHook(data, hook).reflect();
    });
  },
  on: function(data, conditions, projection, options) {
    // not care the result
    WebhookModel
      .find(conditions, projection, options)
      .then(function(hooks) {
        if(!hooks || !hooks.length) {
          return Promise.reject('no hooks');
        }

        return svc.runHooks(data, hooks);
      })
      .each(function(data) {
        if(data.isFulfilled()) {
          console.log('Webhook success: ', JSON.stringify(conditions, null, 2));
        }
        else {
          console.log('Webhook error: ', conditions, JSON.stringify(data, null, 2));
        }
        return null;
      })
      .catch(function(e) {
        console.log(e);
      });

    return Promise.resolve(null);
  }
};

module.exports = svc;
