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
  payloadAddress: {
    type: 'string',
    required: true
  },
  contentType: {
    type: 'string'
  },
  resolveBody: {
    type: 'boolean',
    default: false
  },
  suspended: {
    type: 'boolean',
    required: true
  },
});

var webhookModel = webhook.model;

module.exports = webhookModel;