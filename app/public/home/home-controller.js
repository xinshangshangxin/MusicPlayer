'use strict';

angular
  .module('musicPlayer')
  .controller('homeController', function($scope, $sce, $q, $timeout, playListService, notificationService, musicInfoEntity, lyricEntity, MUSIC_TYPES, PLAY_URL_PREFIX) {
    var errorIndex = -1;
    var errorTimer = null;

    var globalShortcutAction = {
      playOrPause: function() {
        $scope.audioApi && $scope.audioApi.playPause();
      },
      nextSong: playNext,
      preSong: function() {
        if($scope.songList && $scope.songList.length) {
          setCurrentIndex(-1);
          playSong($scope.songList[$scope.currentIndex]);
        }
        else {
          // 停止播放
        }
      }
    };

    $scope.currentIndex = -1;
    $scope.currentSong = null;
    $scope.currentTime = -1;
    $scope.favorName = 'temp';
    $scope.lrcStr = '';
    $scope.timeFix = 100;
    $scope.config = {
      type: 'audio',
      loop: false,
      autoPlay: true,
      preload: 'auto',
      sources: [],
    };
    $scope.musicTypes = MUSIC_TYPES;
    $scope.songList = [];

    $scope.playSong = playSong;
    $scope.deleteSong = deleteSong;
    $scope.onComplete = playNext;
    $scope.onUpdateTime = onUpdateTime;
    $scope.onError = onError;
    $scope.onPlayerReady = onPlayerReady;
    $scope.setCurrentSongIndex = setCurrentSongIndex;

    $scope.$watch(function () {
      return $scope.config.loop;
    }, function () {
      asyncSaveSongInfo();
    });

    init();

    function onPlayerReady(api) {
      $scope.audioApi = api;
    }

    function init() {
      return playListService.getCurrentFavor()
        .then(function (currentFavor) {
          console.log('currentFavor: ', currentFavor);
          if(currentFavor.favorName) {
            $scope.favorName = currentFavor.favorName;
          }
          if(currentFavor.currentIndex >= 0) {
            $scope.currentIndex = currentFavor.currentIndex - 1;
          }
          if(currentFavor.loop) {
            $scope.config.loop = true;
          }
        })
        .then(function () {
          return playListService.getFavor($scope.favorName);
        })
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
        .then(function() {
          console.log('song: ', song);
          if(song.url) {
            return song;
          }

          // 没有链接/lrc 从后台重新获取
          return musicInfoEntity
            .get(getBaseSongInfo(song))
            .$promise
            .then(function(_song) {
              _.assign(song, _song);

              if(!song.url) {
                return $q.reject('这首歌无法播放!!');
              }

              if(!song.lrc) {
                song.lrc = 'NONE';
              }
              return song;
            });
        })
        .then(function(song) {
          asyncSaveSongInfo();
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
      if(!PLAY_URL_PREFIX) {
        return song.url;
      }

      return PLAY_URL_PREFIX + '?name=' + getSongInfoStr(song) + '&id=' + song.id + '&type=' + song.type + '&url=' + encodeURIComponent(song.url);
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
      var index = getSongIndex(song);
      if(index >= 0) {
        $scope.currentIndex = index;
      }
      $scope.currentSong = song;
    }

    function getSongIndex(song) {
      return _.findIndex($scope.songList, {id: song.id, type: song.type});
    }

    function setCurrentSongIndex() {
      setCurrentSong($scope.currentSong);
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

      if($scope.currentSong) {
        notificationService.warn(getSongInfoStr($scope.currentSong, true) + '  播放失败');
      }

      if(errorIndex !== $scope.currentIndex) {
        if(errorIndex === -1) {
          errorIndex = $scope.currentIndex;
        }
        playNext();
      }
    }

    function getSongInfoStr(song, isNeedType) {
      if(!song) {
        return 'NONE!';
      }

      var str = song.name || (song.song + '-' + song.singer);
      if(isNeedType) {
        str += '-' + MUSIC_TYPES[song.type];
      }
      return str;
    }

    function setLrc(song) {
      $scope.lrcStr = '';

      return lyricEntity
        .get(getBaseSongInfo(song))
        .$promise
        .then(function(data) {
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
      var index = getSongIndex(song);
      if(index === -1) {
        return;
      }
      playListService.deleteSongFromFavor(song)
        .then(function() {
          // 当前没有歌曲了
          if($scope.songList.length === 0) {
            $scope.currentIndex = -1;
            $scope.currentSong = null;
            $scope.config.sources = [{
              src: null,
              type: 'audio/mpeg'
            }];
            return;
          }

          if(index === $scope.currentIndex) {
            playNext();
            setCurrentIndex(-1);
          }
          else if(index < $scope.currentIndex) {
            setCurrentIndex(-1);
          }
          else if(index > $scope.currentIndex) {

          }
        });
    }

    function getBaseSongInfo(song) {
      return {
        id: song.id,
        song: song.song,
        singer: song.singer,
        name: song.name || (song.song + '-' + song.singer),
        type: parseInt(song.type),
        url: song.url,
        lrc: song.lrc,
        updatedAt: song.updatedAt,
      };
    }

    function asyncSaveSongInfo() {
      setTimeout(function () {
        playListService.saveSong($scope.songList, $scope.favorName);
        playListService.saveCurrentFavor($scope.currentIndex, $scope.favorName, $scope.config.loop);
      }, 0);
    }
    
    $scope.$on('globalShortcut', function(event, args) {
      args = args || {};
      console.log('globalShortcut args', args);
      globalShortcutAction[args.action] && globalShortcutAction[args.action]();
    });
  });

