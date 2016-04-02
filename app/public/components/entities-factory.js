'use strict';

angular
  .module('shangAngularTemplate')
  .factory('shangAngularTemplateEntity', function($resource) {
    return $resource(
      '/api/v1/:type',
      {type: '@type'},
      {
        update: {method: 'PUT'}
      }
    );
  })
;