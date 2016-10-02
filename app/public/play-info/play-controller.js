'use strict';

angular
  .module('musicPlayer')
  .controller('playController', function($scope, $state, playListService) {
    $scope.key = '';

    $scope.dragMoved = dragMoved;
    $scope.keyChange = keyChange;

    $scope.theme = {
      row: 4
    };
    changeTheme();
    $scope.changeTheme = changeTheme;
    function changeTheme() {
      $scope.theme.row = 12 - $scope.theme.row;
      $scope.theme.row1 = 'col-xs-' + $scope.theme.row;
      $scope.theme.row2 = 'col-xs-' + (12 - $scope.theme.row);
      console.log('$scope.theme: ', $scope.theme);
      setTimeout(function() {
        window.dispatchEvent(new Event('resize'));
      }, 1000);
    }

    function dragMoved(event, index) {
      console.log('dragMoved: ', index);
      // 删除拖动的歌曲的原来位置
      $scope.songList.splice(index, 1);
      catchDragSongError($scope.songList);
      // 重新设置当前播放歌曲
      $scope.setCurrentSongIndex();
      // 保存当前播放顺序
      playListService.saveSong($scope.songList, $scope.favorName);
    }

    // 几率出现,未找到方法重现和防止
    function catchDragSongError(songList){
      console.log('songList.length: ', songList.length);
      var uniqSongList = _.uniqBy(songList, 'id');
      if(uniqSongList.length !== songList.length) {
        alert('拖动出错!!!!');
        songList.length = 0;
        songList.push.apply(songList, uniqSongList);
      }
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

