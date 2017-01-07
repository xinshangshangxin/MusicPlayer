'use strict';

angular
  .module('common')
  .directive('autoResize', function($window, $timeout) {
    return function($scope) {
      var w = angular.element($window);
      var timer = null;
      $scope.$watch(function() {
        return {
          'h': $window.innerHeight,
          'w': $window.innerWidth
        };
      }, function(newValue) {
        $scope.resizeWithOffset = function(nu) {
          $scope.offsetH = nu || $scope.offsetH || 0;
          return {
            'maxHeight': (newValue.h - $scope.offsetH) + 'px',
            'minHeight': (newValue.h - $scope.offsetH) + 'px'
          };
        };
      }, true);

      w.bind('resize', function() {
        if(timer) {
          return;
        }

        timer = $timeout(function() {
          console.log('$scope.offsetH: ', $scope.offsetH);
          timer = null;
        }, 500);

      });
    };
  });
