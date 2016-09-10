'use strict';

angular
  .module('shangAngularTemplate')
  .controller('WebhooksCtrl', function($scope, $stateParams, $state, $translate, webhookEntity) {
    $stateParams.page = $stateParams.page || 1;
    $stateParams.limit = $stateParams.limit || 10;
    $stateParams.search = $stateParams.search || '';

    $scope.meta = {
      page: $stateParams.page || 1,
      limit: $stateParams.limit || 10,
      search: $stateParams.search || '',
      maxSize: 5,
    };

    $scope.search = function() {
      webhookEntity
        .query($scope.meta, function(data, headers) {
          $scope.meta.totalItems = headers('totalItems');
          $scope.viewData = data;
        });
    };

    $scope.search();
  });
