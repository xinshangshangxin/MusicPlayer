'use strict';

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var svc = {
  isMongoError: function(err) {
    return err.name === 'MongoError';
  },
  isMongoDuplicateKeyError: function(err) {
    return err.code === 11000 && err.name === 'MongoError';
  },
  defer: function() {
    var resolve, reject;
    var promise = new Promise(function() {
      resolve = arguments[0];
      reject = arguments[1];
    });
    return {
      resolve: resolve,
      reject: reject,
      promise: promise
    };
  },
  spawnDefer: function(option) {
    var deferred = svc.defer();
    if(!option) {
      return deferred.reject(new Error('no option'));
    }

    if(option.platform) {
      option.cmd = (process.platform === 'win32' ? (option.cmd + '.cmd') : option.cmd);
    }
    var opt = {
      stdio: 'inherit'
    };
    // set ENV
    var env = Object.create(process.env);
    env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
    opt.env = env;

    var proc = spawn(option.cmd, option.arg, opt);
    deferred.promise.proc = proc;
    proc.on('error', function(err) {
      console.log(err);
    });
    proc.on('exit', function(code) {
      if(code !== 0) {
        return deferred.reject(code);
      }
      deferred.resolve();
    });
    return deferred.promise;
  },
  spawnAsync: function(option) {
    if(!option) {
      return Promise.reject(new Error('no option'));
    }

    return new Promise(function(resolve, reject) {
      if(option.platform) {
        option.cmd = (process.platform === 'win32' ? (option.cmd + '.cmd') : option.cmd);
      }
      var opt = {stdio: 'inherit'};
      // set ENV
      var env = Object.create(process.env);
      env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
      opt.env = env;

      var cmd = spawn(option.cmd, option.arg, opt);
      cmd.on('error', function(err) {
        logger.error(err);
      });
      cmd.on('exit', function(code) {
        if(code !== 0) {
          return reject(code);
        }
        resolve();
      });
    });
  },
  execAsync: function(cmd) {
    return new Promise(function(resolve, reject) {
      exec(cmd, function(error, stdout, stderr) {
        if(error) {
          return reject(error);
        }

        resolve(stdout || stderr);
      });
    });
  },
  promiseWhile: Promise.method(function(condition, action) {
    if(!condition()) {
      return;
    }
    return action().then(svc.promiseWhile.bind(null, condition, action));
  }),
  escapeRegExp: function(str, disAbleRegExp) {
    if(!str) {
      return null;
    }

    str = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    if(disAbleRegExp === true) {
      return str;
    }

    return new RegExp(str, 'gi');
  },
  getCondition: function(req, {condition = {}, projection, options}) {
    var opt = {
      sort: req.query.sort || '-createdAt'
    };

    if(req.query.page || req.query.limit) {
      var meta = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      opt.skip = meta.limit * (meta.page - 1);
      opt.limit = meta.limit;
    }
    opt = _.assign(opt, options);

    var query = {};

    var from = req.query.from;
    if(from) {
      query.createdAt = {
        $gte: new Date(from)
      };
    }

    var to = req.query.to;
    if(to) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(to);
    }

    query = _.assign(query, condition);
    return {
      condition: query,
      projection: projection,
      options: opt
    };
  },
  conditionQuery: function(Model, req, opt = {}) {
    let {condition, projection, options} = svc.getCondition(req, opt);

    return Promise
      .props({
        total: Model.count(condition),
        data: Model.find(condition, projection, options)
      })
      .then(function(result) {
        if(opt.filter) {
          result.data = opt.filter(result.data);
        }
        return result;
      });
  },
  conditionQuerySend: function(Model, req, res, error, opt) {
    return svc.conditionQuery(Model, req, opt)
      .then(function(result) {
        var totalName = opt.totalName || 'totalItems';
        res.set(totalName, result.total);
        return result.data;
      })
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        return res.wrapError(e, error);
      });
  },
};

module.exports = svc;