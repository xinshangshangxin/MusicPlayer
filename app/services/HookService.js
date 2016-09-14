'use strict';

var svc = {
  hooks: [],
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