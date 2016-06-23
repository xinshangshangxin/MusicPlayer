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
    case 'fun':
    {
      uri = config.fun();
      break;
    }
    case 'env':
    {
      uri = resolveEnvUrl(config);
      break;
    }
    default:
    {
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

function define(modelName, opt) {
  var modelNameSchema = new mongoose.Schema(_.assign({
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date
    }
  }, opt));

  // 更新 updatedAt
  modelNameSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
    return null;
  });

  modelNameSchema.pre('update', function(next) {
    this.updatedAt = Date.now();
    next();
    return null;
  });

  modelNameSchema.pre('findOneAndUpdate', function(next) {
    if(!this.createdAt) {
      this.findOneAndUpdate({}, {
        createdAt: Date.now()
      });
    }
    this.findOneAndUpdate({}, {
      updatedAt: Date.now()
    });
    next();
    return null;
  });
  var modelNameModel = db.model(modelName, modelNameSchema);

  modelNameSchema.set('toJSON', {
    transform: function(doc, ret) {
      ret.id = ret._id;
    }
  });

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