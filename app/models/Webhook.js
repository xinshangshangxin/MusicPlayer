'use strict';

var dbService = require('../services/dbService.js');

var Webhook = dbService.define('Webhook', {
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

var WebhookModel = Webhook.model;
var WebhookSchema = Webhook.schema;

WebhookSchema.post('save', function(doc) {
  console.log('%s has been saved', doc);
});

module.exports = WebhookModel;