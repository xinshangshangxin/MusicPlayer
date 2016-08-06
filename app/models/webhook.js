'use strict';

var dbService = require('../services/dbService.js');

var webhook = dbService.define('webhook', {
  name: {
    type: 'string',
    required: true,
    index: true
  },
  description: {
    type: 'string'
  },
  events: {
    type: 'array',
    index: true
  },
  method: {
    type: 'string'
  },
  headerFields: {
    type: 'array'
  },
  bodyFields: {
    type: 'array'
  },
  useBodyTransform: {
    type: 'boolean'
  },
  bodyTransform: {
    type: 'string'
  },
  payloadUrl: {
    type: 'string',
    required: true
  },
  contentType: {
    type: 'string',
    required: true
  },
  suspended: {
    type: 'boolean',
    required: true
  },
});

var webhookModel = webhook.model;
var webhookSchema = webhook.schema;

webhookSchema.post('save', function(doc) {
  console.log('%s has been saved', doc);
});

module.exports = webhookModel;