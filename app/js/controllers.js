var MusicModule = angular.module('MusicModule', []);
MusicModule.service('MusicService', ['$rootScope', function($rootScope) {

    var _allSongs = [
        {
            "id": "7276963",
            "rate": "128",
            "mp3": "http://musicdata.baidu.com/data2/music/52456966/7276963241200128.mp3?xcode=4734b53eeb88864534568fd8d7fa32a2e619f1cfa997b285",
            "cover": "http://musicdata.baidu.com/data2/pic/115993826/115993826.jpg",
            "title": "天空",
            "time": 278,
            "artist": "蔡依林",
            "lrc": "http://play.baidu.com/data2/lrc/13818970/13818970.lrc",
            "repaireTimeNu": -6
        }, {
            "id": "1257283",
            "rate": "128",
            "mp3": "http://musicdata.baidu.com/data2/music/123982096/12572831425636061128.mp3?xcode=619064273af1701989caae3c4179826d0adc63c2c22bd960",
            "cover": "http://musicdata.baidu.com/data2/pic/115457837/115457837.jpg",
            "title": "安静了",
            "time": 271,
            "artist": "S.H.E",
            "lrc": "http://play.baidu.com/data2/lrc/13821752/13821752.lrc",
            "repaireTimeNu": 1
        }
        //, {
        //    "id": "10291107",
        //    "rate": "128",
        //    "mp3": "http://musicdata.baidu.com/data2/music/123005173/102911071425837661128.mp3?xcode=e4ed2dc61ab225b49519e57d242c0df1ac1d750e675deb75",
        //    "showLink": "http://yinyueshiting.baidu.com/data2/music/123005173/102911071425837661128.mp3?xcode=e4ed2dc61ab225b49519e57d242c0df1ac1d750e675deb75",
        //    "cover": "",
        //    "title": "遇到",
        //    "time": 181,
        //    "artist": "方雅贤",
        //    "lrc": "http://play.baidu.com/data2/lrc/13894818/13894818.lrc"
        //}, {
        //    "id": "16020672",
        //    "rate": "128",
        //    "mp3": "http://musicdata.baidu.com/data2/music/64369953/1602067286400128.mp3?xcode=f884d25a042d2833b4a29c06de6d36961a9947b7e295abf2",
        //    "showLink": "http://yinyueshiting.baidu.com/data2/music/64369953/1602067286400128.mp3?xcode=f884d25a042d2833b4a29c06de6d36961a9947b7e295abf2",
        //    "cover": "http://b.hiphotos.baidu.com/ting/pic/item/71cf3bc79f3df8dc7a9dafb0cf11728b4710286a.jpg",
        //    "title": "月光",
        //    "time": 272,
        //    "artist": "胡彦斌",
        //    "lrc": "http://play.baidu.com/data2/lrc/31540057/31540057.lrc",
        //    "repaireTimeNu": 3
        //}, {
        //    "id": "8212741",
        //    "rate": "128",
        //    "mp3": "http://musicdata.baidu.com/data2/music/134367211/8212741219600128.mp3?xcode=46ba0569e47afe6983068cd7eae54ff8091a9e0497e92a7b",
        //    "showLink": "http://yinyueshiting.baidu.com/data2/music/134367211/8212741219600128.mp3?xcode=46ba0569e47afe6983068cd7eae54ff8091a9e0497e92a7b",
        //    "cover": "http://musicdata.baidu.com/data2/pic/115363578/115363578.jpg",
        //    "title": "Innocence",
        //    "time": 233,
        //    "artist": "Avril Lavigne",
        //    "lrc": "http://play.baidu.com/data2/lrc/15367672/15367672.lrc",
        //    "repaireTimeNu": 0
        //}, {
        //    "id": "7478534",
        //    "rate": "128",
        //    "downloadhref": "http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds=7478534&rate=128&format=128",
        //    "mp3": "http://musicdata.baidu.com/data2/music/134380977/74785341427259661128.mp3?xcode=f55ab1779a87a0a525a3aea980cb2fa63e538734e9d44d4d",
        //    "showLink": "http://yinyueshiting.baidu.com/data2/music/134380977/74785341427259661128.mp3?xcode=f55ab1779a87a0a525a3aea980cb2fa63e538734e9d44d4d",
        //    "cover": "http://musicdata.baidu.com/data2/pic/115364048/115364048.jpg",
        //    "title": "Love The Way You Lie (Part Ii)",
        //    "time": 296,
        //    "artist": "Rihanna,Eminem",
        //    "lrc": "http://play.baidu.com/data2/lrc/13897497/13897497.lrc"
        //}, {
        //    "id": "5738289",
        //    "rate": "128",
        //    "downloadhref": "http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds=5738289&rate=128&format=128",
        //    "mp3": "http://musicdata.baidu.com/data2/music/64012031/5738289118800128.mp3?xcode=f138c3a0e79897ade9b3d05f2523081980e33211bd4619fd",
        //    "showLink": "http://yinyueshiting.baidu.com/data2/music/64012031/5738289118800128.mp3?xcode=f138c3a0e79897ade9b3d05f2523081980e33211bd4619fd",
        //    "cover": "http://musicdata.baidu.com/data2/pic/115459336/115459336.jpg",
        //    "title": "她说",
        //    "time": 320,
        //    "artist": "林俊杰",
        //    "lrc": "http://play.baidu.com/data2/lrc/14894429/14894429.lrc"
        //}
    ];
    var _audio = new Audio();


    _audio.onerror = function(e) {
        console.log(e)
    };
    _audio.ontimeupdate = function() {
        //updateShowTime();
    };
    _audio.onended = function() {
        _nextpreview(1);
    };

    var _currentIndex = -1;
    var _isPlaying = false;
    var _isMute = false;

    function _playMusic(index, isnotbroadcast) {
        _currentIndex = index;
        _audio.src = _allSongs[_currentIndex].mp3;
        _audio.play();
        _audio.mute = _isMute;
        _isPlaying = true;
        !isnotbroadcast && $rootScope.$broadcast('songs.update');
    }


    function _nextpreview(nu) {
        if (_currentIndex !== -1) {
            _currentIndex = (_currentIndex + _allSongs.length + nu) % _allSongs.length;
            _playMusic(_currentIndex);
        }
    }

    function _chageSize() {
        var availableHeight = $(window).height() - $('#control').height() - 50;
        var $searchDiv = $('#searchDiv');
        var $alllist = $('#alllist');
        var $lrcDiv = $('#lrcdiv');
        var $cover = $('#cover');
        var songListHeight = availableHeight - $searchDiv.height();
        var lrcHeight = availableHeight - $cover.height() - 70;
        $alllist.height(songListHeight);
        $lrcDiv.height(lrcHeight);
    }

    return {
        chageSize: _chageSize,      //修改页面高度
        playMusic: _playMusic,      // 播放一首新歌
        nextpreview: _nextpreview,  // 下一首/上一首
        getAudio: function() {      // 获取 audio
            return _audio;
        },
        getCurrentIndex: function() {   // 获取 当前 播放index
            return _currentIndex;
        },
        getAllSongs: function() {       //获取播放列表
            return _allSongs;
        },
        addOneSong: function(songObj, isPlay) {
            _allSongs.push(songObj);
            if (isPlay) {
                _playMusic(_allSongs.length - 1);
            }
        },
        removeSong: function(index) {       //删除一首歌
            if (index < _currentIndex) {
                _currentIndex -= 1;
                _allSongs.splice(index, 1);
            }
            else if (index === _currentIndex) {
                if (_allSongs.length === 1) {
                    _allSongs.splice(index, 1);
                    _audio.src = null;
                    _audio.load();
                }
                else if (_currentIndex === _allSongs.length - 1) {
                    _allSongs.splice(index, 1);
                    _playMusic(0, false);
                }
                else {
                    _allSongs.splice(index, 1);
                    _playMusic(_currentIndex, false);
                }
            }
            $rootScope.$broadcast('songs.update');
        },
        getIsPlaying: function() {
            return _isPlaying;
        },
        setPlaying: function(play) {
            _isPlaying = play;
        },
        getIsMute: function() {
            return _isMute;
        },
        setMute: function(mute) {
            _isMute = mute;
            _audio.muted = _isMute;
        },
        getCurrentSong: function() {            // 获取当前播放对象
            return _allSongs[_currentIndex];
        }
    };
}]);


// 修改页面高度...............
MusicModule.controller('mainCtrl', ['$scope', 'MusicService', function($scope, MusicService) {
    var i = 0;
    $scope.$on('$viewContentLoaded', function() {
        i++;
        if (i > 3) {
            MusicService.chageSize();
        }
    });
}]);

MusicModule.controller("lrcCtrl", ['$scope', '$http', 'MusicService', function($scope, $http, MusicService) {
    $scope.$on('songs.update', function() {
        if (MusicService.getCurrentIndex() === -1) {
            console.log('无歌曲播放');
            return;
        }
        $scope.songObj = MusicService.getCurrentSong();
        $scope.songObj.lrcObj = null;
        $scope.songObj.lrcObj = shangLrcLoad(MusicService.getAudio(), 'lrcdiv');

        $http.get('http://localhost:1337/?method=get&callback=obj&url=' + $scope.songObj.lrc)
            .success(function(data) {
                $scope.songObj.lrcObj.parseLrc(data.data);
                $scope.songObj.lrcObj.init();
            })
            .error(function() {
            });
    });

    $scope.decrease = function() {
        lrctimeUpdate(-1);
    };
    $scope.increase = function() {
        lrctimeUpdate(1);
    };
    $scope.reset = function() {
        lrctimeUpdate(0);
    };

    var tempTimer = null;

    function lrctimeUpdate(nu) {
        if (MusicService.getCurrentIndex() !== -1 && $scope.songObj && $scope.songObj.lrcObj) {
            clearTimeout(tempTimer);
            if (nu === 0) {
                $scope.songObj.lrcObj.repaireTimeNu = 0;
            }
            else {
                $scope.songObj.lrcObj.repaireTimeNu = ($scope.songObj.lrcObj.repaireTimeNu || 0) + nu;
            }
            $('#lrctimecurrent').html('[' + $scope.songObj.lrcObj.repaireTimeNu / 10 + ']');
            tempTimer = setTimeout(function() {
                $('#lrctimecurrent').html('');
            }, 2000);
        }
    }
}]);


MusicModule.controller('listCtrl', ['$scope', 'MusicService', function($scope, MusicService) {
    $scope.songs = MusicService.getAllSongs();

    $scope.changeTime = function(all) {
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);
        return minute + ':' + second;
    };

    $scope.play = function($event) {
        $event.stopPropagation();
        MusicService.playMusic(this.$index);
    };

    $scope.del = function($event) {
        $event.stopPropagation();
        MusicService.removeSong(this.$index);
    };

    $scope.$on('songs.update', function() {
        console.log('update');
        $scope.songs = MusicService.getAllSongs();
    });

}]);


MusicModule.directive('hover', [function() {
    return {
        restrict: 'A',
        link: function(scope, ele) {
            ele.on('mouseover', function() {
                ele.find('img').toggleClass('imghide');
            });
            ele.on('mouseout', function() {
                ele.find('img').toggleClass('imghide');
            });
        }
    }
}]);


MusicModule.controller('searchCtrl', ['$scope', function($scope) {
    // 监控输入
    $scope.$watch('searchStr', function(str) {
        $scope.searchStr = str;
    });

    $scope.search = function() {
        console.log($scope.searchStr);
    }
}]);

MusicModule.controller('conCtrl', ['$scope', 'MusicService', function($scope, MusicService) {
    $scope.changeTime = function(all) {
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);
        return minute + ':' + second;
    };

    $scope.playorpause = function() {
        if (MusicService.getCurrentIndex() !== -1 && $scope.song) {
            if (MusicService.getIsPlaying()) {
                MusicService.getAudio().pause();
                $scope.pause_play = 'play.png';
                MusicService.setPlaying(false);
            }
            else {
                MusicService.getAudio().play();
                $scope.pause_play = 'pause.png';
                MusicService.setPlaying(true);
            }

        }
    };

    $scope.pause_play = 'pause.png';
    $scope.mutepng = 'volume.png';
    $scope.time = 0;
    $scope.title = 'SHANG';
    $scope.artist = 'SHANG';

    $scope.$on('songs.update', function() {
        $scope.song = MusicService.getCurrentSong();
        if (MusicService.getCurrentIndex() !== -1) {
            $scope.time = $scope.song.time;
            $scope.title = $scope.song.title;
            $scope.artist = $scope.song.artist;
        }
    });

    $scope.silence = function() {
        if (MusicService.getCurrentSong() !== -1) {
            var isMute = MusicService.getIsMute();
            if (isMute) {
                $scope.mutepng = 'volume.png';
                MusicService.setMute(false);
            }
            else {
                $scope.mutepng = 'mute.png';
                MusicService.setMute(true);
            }
        }
    };

    $scope.prevSong = function() {
        MusicService.nextpreview(-1);
    };
    $scope.nextSong = function() {
        MusicService.nextpreview(1);
    };
}]);

