'use strict';

angular
  .module('musicPlayer')
  .controller('playController', function($scope, $state, playListService) {
    $scope.key = '';

    $scope.dragMoved = dragMoved;
    $scope.keyChange = keyChange;

    function dragMoved(event, index) {
      console.log('dragMoved: ', index);
      // 删除拖动的歌曲的原来位置
      $scope.songList.splice(index, 1);
      // 重新设置当前播放歌曲
      $scope.setCurrentSongIndex();
      // 保存当前播放顺序
      playListService.saveSong($scope.songList, $scope.favorName);
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

