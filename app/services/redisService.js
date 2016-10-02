'use strict';

var redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var redisClient;

var svc = {
  name: 'redisService',
  lift: function() {
    config.env.redis = config.env.redis || {};
    var option = {
      url: 'redis://' + (config.env.redis.ip || '127.0.0.1') + ':' + (config.env.redis.port || '6379')
    };

    logger.info('redis option: ', option);

    return new Promise(function(resolve, reject) {
      redisClient = redis.createClient(option);
      redisClient.on('error', function(err) {
        logger.error('Redis error ' + err);
        reject(err);
      });
      redisClient.on('connect', function() {
        logger.info('Redis connect');
        resolve();
      });
    });
  },
  get: function(key) {
    return redisClient.getAsync(key);
  },
  set: function(key, obj, express) {
    if(!express) {
      return redisClient.setAsync(key, JSON.stringify(obj));
    }
    return redisClient.setexAsync(key, express, JSON.stringify(obj));
  }
};

module.exports = svc;
