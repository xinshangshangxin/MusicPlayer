'use strict';


angular
  .module('musicPlayer')
  .controller('searchController', function($scope, $sce, $stateParams, musicSearchEntity, playListService) {

    $scope.key = '';
    $scope.keyChange = keyChange;
    $scope.addAndPlay = addAndPlay;

    init();

    function init(){
      console.log('$stateParams.key: ', $stateParams.key);
      if($stateParams.key) {
        $scope.key = $stateParams.key;
      }
      return search();
    }

    function keyChange(e){
      if(!e || e.keyCode !== 13) {
        return;
      }
      if(!$scope.key) {
        return;
      }

      return search();
    }

    function search() {
      if(!$scope.key) {
        return;
      }

      $scope.songList = [];
      return musicSearchEntity
        .query({
          key: $scope.key
        })
        .$promise
        .then(function(data) {
          $scope.songList = data;
          console.log($scope.songList);
          return data;
        });
    }

    function addAndPlay(song){
      playListService.addSongToFavor(song);
      $scope.playSong(song);
    }
  });

