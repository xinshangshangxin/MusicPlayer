'use strict';

angular
  .module('musicPlayer')
  .controller('homeController', function($scope, $sce, $q, $timeout, playListService, notificationService, musicInfoEntity, forwardEntity, MUSIC_TYPES) {
    let favorName = 'temp';
    let errorIndex = -1;
    let errorTimer = null;

    $scope.currentIndex = -1;
    $scope.currentSong = null;
    $scope.currentTime = -1;
    $scope.lrcStr = '';
    $scope.config = {
      type: 'audio',
      loop: false,
      autoPlay: true,
      preload: 'auto',
      sources: [],
      // theme: 'vendor/videogular-themes-default/videogular.min.css'
    };
    $scope.musicTypes = MUSIC_TYPES;
    $scope.songList = [];

    $scope.playSong = playSong;
    $scope.deleteSong = deleteSong;
    $scope.onComplete = playNext;
    $scope.onUpdateTime = onUpdateTime;
    $scope.onError = onError;
    $scope.onPlayerReady = onPlayerReady;

    init();

    function onPlayerReady(api) {
      $scope.audioApi = api;
    }

    function init() {
      return playListService.getFavor(favorName)
        .then(function(data) {
          $scope.songList = data;
          playNext();
        });
    }

    function playSong(song) {

      if(!song.id) {
        return;
      }

      $q.resolve()
        .then(() => {
          console.log('song: ', song);
          if(song.url && song.lrc) {
            return song;
          }

          // 没有链接/lrc 从后台重新获取
          return musicInfoEntity
            .get({
              id: song.id,
              type: song.type
            })
            .$promise
            .then(function(_song) {
              _.assign(song, _song);

              if(!song.url) {
                return $q.reject('这首歌无法播放!!');
              }

              playListService.saveSong($scope.songList, favorName);

              if(!song.lrc) {
                _song.lrc = 'NONE';
                return $q.reject(new Error('没有找到歌词链接'));
              }
              return song;
            });
        })
        .then(function(song) {
          console.log('start play song: ', song);
          setLrc(song);
          $scope.config.sources = [{
            src: $sce.trustAsResourceUrl(getPlayUrl(song)),
            type: 'audio/mpeg'
          }];
          setCurrentSong(song);
        })
        .catch(notificationService.error);
    }

    function getPlayUrl(song) {
      let playUrlPrefix = '/api/v1/music/play';
      return playUrlPrefix + '?id=' + song.id + '&type=' + song.type + '&url=' + encodeURIComponent(song.url);
    }

    function playNext() {
      if($scope.songList && $scope.songList.length) {
        setCurrentIndex(1);
        playSong($scope.songList[$scope.currentIndex]);
      }
      else {
        // 停止播放
      }
    }

    function setCurrentSong(song) {
      let index = getSongIndex(song);
      if(index >= 0) {
        $scope.currentIndex = index;
      }
      $scope.currentSong = song;
    }

    function getSongIndex(song) {
      return _.findIndex($scope.songList, {id: song.id, type: song.type});
    }

    function onUpdateTime(currentTime) {
      $scope.currentTime = currentTime;
    }

    function onError(event) {
      console.log(event);
      $timeout.cancel(errorTimer);
      errorTimer = $timeout(function() {
        errorIndex = -1;
      }, 5000);

      notificationService.warn(getSongInfoStr($scope.currentSong) + '  播放失败');

      if(errorIndex !== $scope.currentIndex) {
        if(errorIndex === -1) {
          errorIndex = $scope.currentIndex;
        }
        playNext();
      }
    }

    function getSongInfoStr(song) {
      if(!song) {
        return '没有歌曲!!';
      }

      return song.song + '-' + song.singer + '-' + MUSIC_TYPES[song.type];
    }

    function setLrc(song) {
      $scope.lrcStr = '';

      return forwardEntity
        .get({
          url: song.lrc,
          type: song.type,
          id: song.id
        })
        .$promise
        .then((data) => {
          if($scope.currentIndex === getSongIndex(song)) {
            $scope.lrcStr = data.data;
          }
          else {
            console.log('歌词获取和当前播放歌曲不匹配');
          }
        });
    }

    function setCurrentIndex(nu) {
      $scope.currentIndex = ($scope.currentIndex + nu + $scope.songList.length) % $scope.songList.length;
    }

    function deleteSong(song) {
      let index = getSongIndex(song);
      if(index === -1) {
        return;
      }

      playListService.deleteSongFromFavor(song);
      if(index === $scope.currentIndex) {
        playNext();
        setCurrentIndex(-1);
      }
      else if(index < $scope.currentIndex) {
        setCurrentIndex(-1);
      }
      else if(index > $scope.currentIndex) {

      }

    }
  });
