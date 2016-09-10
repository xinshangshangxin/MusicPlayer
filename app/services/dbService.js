'use strict';

var mongoose = require('mongoose');
mongoose.Promise = Promise;

function close() {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected');
  });
}

function resolveEnvUrl(config) {
  if(config.condition && !process.env[config[config.condition]]) {
    return false;
  }

  var mongodbUri = 'mongodb://';
  if(process.env[config.username]) {
    mongodbUri += process.env[config.username];

    if(process.env[config.password]) {
      mongodbUri += ':' + process.env[config.password];
    }
    mongodbUri += '@';
  }

  mongodbUri += (process.env[config.host] || '127.0.0.1') + ':' + (process.env[config.port] || 27017) + '/' + (process.env[config.name] || config.dbName);

  return mongodbUri;
}

function getMongodbUri(config) {
  config = config || {};
  var uri = '';
  switch(config.type) {
    case 'fun': {
      uri = config.fun();
      break;
    }
    case 'env': {
      uri = resolveEnvUrl(config);
      break;
    }
    case 'uri': {
      return config.uri;
    }
    default: {
      break;
    }
  }

  if(uri && uri !== false) {
    return uri;
  }

  return 'mongodb://127.0.0.1:27017/' + config.dbName;
}

var mongodbUri = getMongodbUri(config.env.mongo);

console.log('connect mongodbUri: ', mongodbUri);

var db = mongoose.connect(mongodbUri);

function define(modelName, opt, config) {
  config = _.assign({
    timestamps: true,
    set: {
      toJSON: {
        transform: function(doc, ret) {
          ret.id = ret._id;
        }
      },
    },
  }, config);

  var modelNameSchema = new mongoose.Schema(opt, {
    timestamps: config.timestamps
  });

  if(config.index) {
    modelNameSchema.index.apply(modelNameSchema, config.index);
  }


  if(config.pre && _.isPlainObject(config.pre)) {
    _.forEach(config.pre, function(value, key) {
      modelNameSchema.pre(key, value);
    });
  }

  if(config.post && _.isPlainObject(config.post)) {
    _.forEach(config.post, function(value, key) {
      modelNameSchema.post(key, value);
    });
  }

  if(config.set && _.isPlainObject(config.set)) {
    _.forEach(config.set, function(value, key) {
      modelNameSchema.set(key, value);
    });
  }

  var modelNameModel = db.model(modelName, modelNameSchema);

  return {
    model: modelNameModel,
    schema: modelNameSchema
  };
}

module.exports = {
  mongoose: mongoose,
  Types: mongoose.Schema.Types,
  db: db,
  define: define,
  closeMongoose: close
};