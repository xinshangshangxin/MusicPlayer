'use strict';

angular
  .module('musicPlayer')
  .factory('musicSearchEntity', function($resource) {
    return $resource(
      '/api/v1/music/search/:key',
      {key: '@key'},
      {
        update: {method: 'PUT'}
      }
    );
  })
  .factory('musicInfoEntity', function($resource) {
    return $resource(
      '/api/v1/music/detail/:id',
      {id: '@id'},
      {
        update: {method: 'PUT'}
      }
    );
  })
  .factory('forwardEntity', function($resource) {
    return $resource(
      '/api/v1/request/forward',
      {},
      {
        update: {method: 'PUT'}
      }
    );
  })
;