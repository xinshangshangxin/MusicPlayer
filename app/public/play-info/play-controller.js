'use strict';

angular
  .module('musicPlayer')
  .controller('playController', function($scope, $state) {
    $scope.key = '';
    $scope.keyChange = keyChange;

    function keyChange(e) {
      if(!e || e.keyCode !== 13) {
        return;
      }
      if(!$scope.key) {
        return;
      }

      return $state.go('home.search', {
        key: $scope.key
      });
    }
  });

