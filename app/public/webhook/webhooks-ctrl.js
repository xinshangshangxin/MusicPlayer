'use strict';

angular
  .module('shangAngularTemplate')
  .controller('WebhooksCtrl', function($scope, $stateParams, $state, $translate, webhookEntity) {
    $stateParams.page = $stateParams.page || 1;
    $stateParams.per_page = $stateParams.per_page || 10;
    $stateParams.search = $stateParams.search || '';

    $scope.meta = {
      page: $stateParams.page || 1,
      per_page: $stateParams.per_page || 10,
      search: $stateParams.search || '',
      maxSize: 5,
    };

    $scope.search = function() {
      webhookEntity
        .query($scope.meta, function(data, headers) {
          console.log('data: ', data);
          $scope.totalItems = headers('total');
          $scope.viewData = data;
        });
    };

    $scope.search();
  });
