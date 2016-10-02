'use strict';

var rp = Promise.promisify(require('request'), {multiArgs: true});

var mailSendService = require('./mailSendService');
var webhookModel = require('../models/webhookModel');
var hookService = require('./hookService');

var svc = {
  lift: function() {
    return hookService.registerHook(svc.on.bind(svc));
  },
  resolveValue: function(body, data) {
    if(!body) {
      return null;
    }
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
    var body;

    return Promise
      .try(function() {
        if(!hook.payloadAddress) {
          return Promise.reject(new ApplicationError.NoPayloadAddress());
        }

        if(hook.resolveBody) {
          body = svc.resolveValue(hook.bodyFields, data);
        }
        else {
          body = data;
        }

        // mail
        if(method === 'EMAIL') {
          logger.info('hook sendMail to ', hook.name, 'body: ', body);
          return mailSendService.sendMail({
            subject: `webhook: ${hook.name}`,
            html: '<div>' + JSON.stringify(body, null, 2) + '</div>'
          });
        }

        // http 请求
        var options = {
          proxy: false,
          followRedirect: false,
          url: hook.payloadAddress,
          method: method,
          headers: svc.resolveValue(hook.headerFields, data)
        };

        if(method === 'GET') {
          return rp(options);
        }

        switch(contentType) {
          case 'application/json':
            options.json = body || true;
            break;
          case 'application/x-www-form-urlencoded':
            options.form = body;
            break;
          default:
            return Promise.reject(new ApplicationError.NotSupportContentType(undefined, {contentType: contentType}));
        }

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
    webhookModel
      .find(conditions, projection, options)
      .then(function(hooks) {
        if(!hooks || !hooks.length) {
          return Promise.reject('no hooks');
        }

        return svc.runHooks(data, hooks);
      })
      .each(function(data) {
        if(data.isFulfilled()) {
          logger.info('Webhook success: ', JSON.stringify(conditions, null, 2));
        }
        else {
          logger.info('Webhook error: ', conditions, JSON.stringify(data, null, 2), data.reason());
        }
        return null;
      })
      .catch(function(e) {
        logger.info(e);
      });

    return Promise.resolve(null);
  }
};

module.exports = svc;
