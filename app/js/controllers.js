var MusicModule = angular.module('MusicModule', []);

//var serverUrl = 'http://cors.coding.io/';
//var serverUrl = 'http://nodecors.sturgeon.mopaas.com/';
var serverUrl = 'http://121.40.81.63:1337/';

MusicModule.service('MusicService', ['$rootScope', function($rootScope) {

    var _allSongs = [];
    var _audio = new Audio();

    _audio.onerror = function(e) {
        console.log(e)
    };
    _audio.ontimeupdate = function() {
        updateShowTime();
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
        _saveInfo();
    }


    function _nextpreview(nu) {
        if (_currentIndex !== -1) {
            _currentIndex = (_currentIndex + _allSongs.length + nu) % _allSongs.length;
            _playMusic(_currentIndex);
        }
    }

    function _saveInfo() {
        var arr = [];
        for (var i = 0; i < _allSongs.length; i++) {
            arr.push({
                "id": _allSongs[i].id,
                "rate": _allSongs[i].rate,
                "mp3": _allSongs[i].mp3,
                "cover": _allSongs[i].cover,
                "title": _allSongs[i].title,
                "time": _allSongs[i].time,
                "artist": _allSongs[i].artist,
                "lrc": _allSongs[i].lrc,
                "repaireTimeNu": _allSongs[i].repaireTimeNu
            });
        }
        localStorage.shang_music = JSON.stringify({
            data: arr
        });
        console.log(localStorage.shang_music);
    }


    // 不知道 angularjs 下应该怎么实现..............
    var isProgressBar = false;
    var isVolumBar = false;
    var $info;
    var $currentprogressbar = $('#currentprogress'),
        $loadedprogress = $('#loadedprogress'); // 已经载入的长度
    var progressbarLen, // 进度条长度
        currentVolum,
        volumBarlen; //音量条长度
    function updateShowTime() {
        if (_currentIndex === -1) {
            return;
        }
        var all = _audio.currentTime;
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);
        $info.html(minute + ":" + second);

        if (!isProgressBar) {
            $currentprogressbar.width(_audio.currentTime / _audio.duration * progressbarLen);
            $loadedprogress.width(getBufferPercent() * progressbarLen);
        }
    }

    function getBufferPercent() {
        if (_currentIndex === -1) {
            return 0;
        }
        var timeRanges = _audio.buffered;
        if (timeRanges.length) {
            // 获取以缓存的时间
            var timeBuffered = timeRanges.end(timeRanges.length - 1);
            // 获取缓存进度，值为0到1
            return timeBuffered / _audio.duration;
        }
    }


    $(window).on('resize', function() {
        _chageSize();
    });

    _allSongs = (localStorage.shang_music && JSON.parse(localStorage.shang_music).data) || [];
    $rootScope.$broadcast('songs.update');

    function _chageSize() {

        var availableHeight = $(window).height() - $('#control').height() - 50;
        var $searchDiv = $('#searchDiv');
        var $alllist = $('#alllist');
        var $lrcDiv = $('#lrcdiv');
        var $cover = $('#cover');
        $info = $('#info');
        var songListHeight = availableHeight - $searchDiv.height();
        var lrcHeight = availableHeight - $cover.height() - 70;
        $alllist.height(songListHeight);
        $lrcDiv.height(lrcHeight);

        var $progressbar = $('#progressbar'), // 进度条
            $volumebar = $('#volumebar'),
            $currentvolumebar = $('#currentvolumebar'), //当前音量
            $mutebtn = $('#mute'); //静音按钮


        $currentprogressbar = $('#currentprogress'); //当前进度
        $loadedprogress = $('#loadedprogress'); // 已经载入的长度


        $(document).unbind();
        $progressbar.unbind();
        $volumebar.unbind();

        $(document).on('mousedown', function() {
            if (isProgressBar || isVolumBar) {
                document.body.style.cursor = 'pointer';
            }
        });

        $(document).on('mouseup', function(e) {

            calculateProgressBar(e, true);
            calculateVolumBar(e);

            isProgressBar = false;
            isVolumBar = false;
            document.body.style.cursor = 'default';
        });

        $(document).on('mousemove', function(e) {
            calculateProgressBar(e);
            calculateVolumBar(e);
            return (e.target.id === 'addr' || e.target.id === 'backdownload');
        });

        $progressbar.on('mousedown', function() {
            isProgressBar = true;
        });

        $volumebar.on('mousedown', function() {
            isVolumBar = true;
        });


        function calculateProgressBar(e, isupdate) {
            if (isProgressBar && _currentIndex !== -1) {
                var len = e.clientX - $progressbar.offset().left;
                var percentLen = len / progressbarLen;
                if (percentLen < 0) {
                    percentLen = 0;
                } else if (percentLen > 1) {
                    percentLen = 1;
                }

                var bufper = getBufferPercent();
                if (percentLen > bufper) {
                    percentLen = bufper;
                }
                // 不能直接使用百分比; 可能出现长度不正确问题
                $currentprogressbar.width(percentLen * progressbarLen);
                $loadedprogress.width(bufper * progressbarLen);
                if (isupdate) {
                    _audio.currentTime = Math.floor(percentLen * _audio.duration);
                }
            }
        }

        function calculateVolumBar(e) {

            if (isVolumBar) {
                var len = e.clientX - $volumebar.offset().left;
                var percentLen = len / volumBarlen;
                if (percentLen < 0) {
                    percentLen = 0;
                } else if (percentLen > 1) {
                    percentLen = 1;
                }
                $currentvolumebar.width(percentLen * 100 + '%');
                currentVolum = percentLen;

                if (_currentIndex !== -1) {
                    _audio.volume = percentLen;

                    if (_audio.muted) {
                        _audio.muted = false;
                        $mutebtn.attr('src', './images/volume.png');
                    }
                }
            }
        }

        progressbarLen = $progressbar.width();
        volumBarlen = $volumebar.width();
    }


    return {
        chageSize: _chageSize, //修改页面高度
        playMusic: _playMusic, // 播放一首新歌
        nextpreview: _nextpreview, // 下一首/上一首
        getAudio: function() { // 获取 audio
            return _audio;
        },
        getCurrentIndex: function() { // 获取 当前 播放index
            return _currentIndex;
        },
        getAllSongs: function() { //获取播放列表
            return _allSongs;
        },
        addOneSong: function(songObj, isPlay) {
            console.log(_allSongs);
            console.log(songObj);
            _allSongs.push(songObj);
            if (isPlay) {
                _playMusic(_allSongs.length - 1);
            }
        },
        removeSong: function(index) { //删除一首歌
            if (index < _currentIndex) {
                _currentIndex -= 1;
                _allSongs.splice(index, 1);
            } else if (index === _currentIndex) {
                if (_allSongs.length === 1) {
                    _allSongs.splice(index, 1);
                    _audio.src = null;
                    _audio.load();
                } else if (_currentIndex === _allSongs.length - 1) {
                    _allSongs.splice(index, 1);
                    _playMusic(0, false);
                } else {
                    _allSongs.splice(index, 1);
                    _playMusic(_currentIndex, false);
                }
            }
            $rootScope.$broadcast('songs.update');
            _saveInfo();
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
        getCurrentSong: function() { // 获取当前播放对象
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

        $http.get(serverUrl + '?method=get&callback=obj&url=' + $scope.songObj.lrc)
            .success(function(data) {
                $scope.songObj.lrcObj.parseLrc(data.data);
                $scope.songObj.lrcObj.init();
            })
            .error(function() {});
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
            } else {
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


MusicModule.controller('searchCtrl', ['$scope', '$http', 'MusicService', function($scope, $http, MusicService) {

    $scope.add = function(song) {

        getbdmInfo(song.id + '', ['128'], function(obj) {
            if (/pan.baidu/.test(obj.showLink)) {
                // obj.mp3 = 'http://localhost:1337';
                // MusicService.addOneSong(obj, true);
                prompt('此音乐为网网盘音乐,复制打开百度网盘~~~', obj.showLink);
            } else if (obj.showLink === '') {
                prompt('未获取到内容....', obj.showLink);
            } else {
                MusicService.addOneSong(obj, true);
            }
        });
        $scope.songs = [];
    };
    // 监控输入
    $scope.$watch('searchStr', function(str) {
        $scope.searchStr = str;
    });

    var timer = null;
    $scope.search = function() {
        clearTimeout(timer);
        searchSong($scope.searchStr);
        timer = setTimeout(function() {
            $scope.$apply($scope.songs = []);
        }, 5000);
    };


    function getbdmInfo(info, rate, funsuccess) {
        var id = info.match('\\d+')[0];
        var url = 'http://music.baidu.com/data/music/fmlink?songIds=' + id + '&type=mp3&rate=';
        if (typeof(rate) === 'string') {
            getoInfo(url + rate, id, rate, funsuccess);
        } else {
            if (!rate.length) {
                rate = ['128', '192', '320', 'flac'];
            }
            for (var i = 0; i < rate.length; i++) {
                getoInfo(url + rate[i], id, rate[i], funsuccess);
            }
        }
    }

    function getoInfo(url, id, rate, fun) {
        $http.get(serverUrl + '?method=get&url=' + url).success(
            function(json) {
                console.log(json);
                var songinfo = json.data.songList[0];
                var obj = {
                    'id': id,
                    'rate': rate,
                    'downloadhref': 'http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds=' + id + '&rate=' + (rate === 'flac' ? 835 : rate) + '&format=' + rate,
                    'mp3': songinfo.songLink.replace('yinyueshiting', 'musicdata').replace(/&src=.*/, ''),
                    'showLink': songinfo.showLink,
                    'cover': songinfo.songPicBig,
                    'title': songinfo.songName,
                    'time': songinfo.time,
                    'artist': songinfo.artistName,
                    'lrc': 'http://play.baidu.com' + songinfo.lrcLink
                };
                console.log(obj.mp3);
                if (fun) {
                    fun(obj);
                }
            }
        );
    }

    function searchSong(str) {
        if (!str) {
            return;
        }

        $http.get(serverUrl + '?method=get&url=' + encodeURIComponent('http://sug.music.baidu.com/info/suggestion?format=json&word=' + str + '&version=2&from=0')).success(function(d) {
            var data = d.data;

            if (!data.song.length) {
                $scope.songs = [{
                    title: '未找到'
                }];
            } else {
                var arr = [];
                for (var i = 0, l = data.song.length; i < l; i++) {
                    var obj = data.song[i];
                    arr.push({
                        id: obj.songid,
                        title: obj.songname,
                        artist: obj.artistname
                    })
                }
                $scope.songs = arr;
            }
        });
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
            } else {
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
            } else {
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
