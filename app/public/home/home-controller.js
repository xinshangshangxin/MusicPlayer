'use strict';

angular
  .module('musicPlayer')
  .controller('homeController', function($scope, $sce, $q, playListService, notificationService, musicInfoEntity, forwardEntity, MUSIC_TYPES) {
    let favorName = 'temp';

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

    $scope.playSong = playSong;
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
        $scope.currentIndex = ($scope.currentIndex + 1) % $scope.songList.length;
        playSong($scope.songList[$scope.currentIndex]);
      }
    }

    function setCurrentSong(song) {
      let index = _.findIndex($scope.songList, {id: song.id, type: song.type});
      if(index >= 0) {
        $scope.currentIndex = index;
      }
      $scope.currentSong = song;
    }

    function onUpdateTime(currentTime) {
      $scope.currentTime = currentTime;
    }

    function onError(event) {
      console.log(event);
      playNext();
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
          $scope.lrcStr = data.data;
        });

      //   $timeout(function(){
      //     $scope.lrcStr = `[ti:独善其身]
      // [ar:田馥甄]
      // [al:]
      // [ly:蓝小邪]
      // [mu:郑楠]
      // [ma:郑楠]
      // [pu:]
      // [by:ttpod]
      // [total:227213]
      // [offset:0]
      // [00:00.572]独善其身 - 田馥甄
      //   [00:02.357]作词：蓝小邪
      //   [00:03.558]作曲：郑楠
      //   [00:04.606]编曲：郑楠
      //   [00:05.562]制作人：郑楠
      //   [00:06.765]配唱制作人：郑楠 / 郭文宗
      //   [00:09.027]录音室：华研猛蛋录音室
      //   [00:11.123]录音师：马丁
      //   [00:12.381]和声设计：郑楠
      //   [00:13.786]弦乐编写：郑楠
      //   [00:15.238]和声：田馥甄
      //   [00:16.390]吉他：薛峰
      //   [00:17.353]贝斯：韩阳
      //   [00:18.351]鼓：郝稷伦
      //   [00:19.306]鼓录音室：Tweak Tone Labs
      //   [00:20.753]弦乐：国际首席爱乐乐团
      //   [00:22.766]混音师：赵靖
      //   [00:23.920]混音录音室：Big.J Studio
      //   [00:25.476]OP：HIM Music Publishing Inc.
      //   [00:26.262]
      // [00:26.912]眼睛在忙着看风景
      //   [00:31.178]嘴巴想念着甜品
      //   [00:34.346]这双耳朵只想保持安静
      //   [00:40.657]头发在缠着它自己
      //   [00:44.919]呼吸在挑剔空气
      //   [00:48.182]这个脑袋知道何时微醺
      //   [00:53.249]
      // [01:09.723]要什么道理
      //   [01:12.151]身体发肤 天生爱自己
      //   [01:16.628]有什么逻辑
      //   [01:18.929]想爱别人何止要运气
      //   [01:23.405]先善待这身体
      //   [01:28.052]灵魂再相遇
      //   [01:30.312]先善待这颗心
      //   [01:35.031]再懂别的心
      //   [01:37.186]
      // [01:49.246]眼睛会是谁的风景
      //   [01:53.451]嘴巴被谁当甜品
      //   [01:56.656]这双耳朵为谁不再安静
      //   [02:02.832]头发为谁放开自己
      //   [02:07.226]呼吸能被谁呼吸
      //   [02:10.490]这个脑袋知道让谁微醺
      //   [02:15.849]
      // [02:32.119]要什么道理
      //   [02:34.297]身体发肤 自会有灵犀
      //   [02:38.791]有什么逻辑
      //   [02:41.193]想爱的人 也在爱自己
      //   [02:45.740]先善待这身体
      //   [02:50.458]灵魂才相遇
      //   [02:52.614]先善待这颗心
      //   [02:57.318]就懂谁的心
      //   [03:04.228]就懂谁的心
      //   [03:11.091]就懂谁的心
      //   [03:17.841]就懂谁的心
      //   `;
      //   }, 100);
    }
  });

