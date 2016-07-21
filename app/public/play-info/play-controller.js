'use strict';

angular
  .module('musicPlayer')
  .controller('playController', function($scope, $state, playListService) {
    $scope.key = '';
    $scope.keyChange = keyChange;
    $scope.deleteSong = deleteSong;
    
    function deleteSong(song) {
      playListService.deleteSongFromFavor(song);
    }

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

