'use strict';

var svc = {
  hooks: [],
  events: {
    SiteMonitorError: {
      name: 'SiteMonitorError',
      displayName: '站点监测失败'
    },
    'Test:afterCreate': {
      name: 'Test:afterCreate',
      displayName: '测试'
    },
    'Webhook:afterDestroy': {
      name: 'Webhook:afterDestroy',
      displayName: 'webhook删除'
    }
  },
  on: function(data, conditions, projection, options) {
    return Promise
      .mapSeries(svc.hooks, function(hook) {
        if(_.isPlainObject(conditions)) {
          return hook(data, conditions, projection, options);
        }

        return hook(data, {
          events: conditions
        }, projection, options);
      });
  },
  // hook is function in form of:
  // function (data, conditions, projection, options)
  registerHook: function(hook) {
    this.hooks.push(hook);
  }
};

module.exports = svc;

/**

 require('../services/HookService').on({
      id: 'id001',
      data: {
        d1: {
          d2: {
            d3: 'result'
          }
        }
      }
    }, 'Test:afterCreate');

 res.json({});


 **/