$(document).ready(function() {

    var audio = null,
        $addplay = $('#addandplay'),
        $addr = $('#addr'),
        $playpushbtn = $('#playpaush'), // 暂停播放按钮
        $previewsong = $('#previewsong'), //上一首
        $nextsong = $('#nextsong'), //下一首
        $mutebtn = $('#mute'), //静音按钮
        $volumebar = $('#volumebar'), // 音量条
        $currentvolumebar = $('#currentvolumebar'), //当前音量
        $progressbar = $('#progressbar'), // 进度条
        $currentprogressbar = $('#currentprogress'), //当前进度
        $coverimg = $('#coverimg'),
        $title = $('#title'),
        $artist = $('#artist'),
        $info = $('#info'),
        $alllistul = $('#alllistul');

    var currentprogress = 0, //当前进度
        currentIndex = -1, // 当前播放 index
        currentVolum = 1, // 当前音量
        playlistinfo = [], // 所有 歌曲
        audiolisthtml = [], // 所有歌曲 的 html 格式
        isplaying = true, // 是否正在播放
        audiolist = {}; //列表中所有歌曲 对象; 用于判断是否在列表中

    //本地存储
    var localStr = localStorage['shang_music'];
    var localInfo = {};
    if (localStr) {
        localInfo = JSON.parse(localStr);
        if (localInfo) {
            playlistinfo = localInfo.playlistinfo || [];
            for (var i = 0; i < playlistinfo.length; i++) {
                console.log(playlistinfo[i]['rate128'].id);
                audiolist['id' + playlistinfo[i]['rate128'].id] = true;
                addAudiolisthtml(playlistinfo[i]['rate128'], i);
            }
        }
    }



    var isProgressBar = false;
    var progressbarLen = $progressbar.width();
    var isVolumBar = false;
    var volumBarlen = $volumebar.width();
    var lrcObj;

    //noinspection JSCheckFunctionSignatures
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
        return (e.target.id === 'addr');
    });

    $progressbar.on('mousedown', function() {
        isProgressBar = true;
    });

    $volumebar.on('mousedown', function() {
        isVolumBar = true;
    });

    $addr.on('focus', function() {
        $addr.select();
    });

    function calculateProgressBar(e, isupdate) {
        if (isProgressBar && !!audio) {
            var len = e.clientX - $progressbar.offset().left;
            var percentLen = len / progressbarLen;
            if (percentLen < 0) {
                percentLen = 0;
            } else if (percentLen > 1) {
                percentLen = 1;
            }
            $currentprogressbar.width(percentLen * 100 + '%');

            if (isupdate) {
                audio.currentTime = Math.floor(percentLen * audio.duration);
                lrcObj.clearClass();
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

            if (!!audio) {
                audio.volume = percentLen;

                if (audio.muted) {
                    audio.muted = false;
                    $mutebtn.attr('src', './images/volume.png');
                }
            }
        }
    }


    $('#showtext').on('hidden.bs.modal', function() {
        $addplay.button('reset');
    });


    $addplay.on('click', function() {

        $addplay.button('loading');
        var temptimer = setTimeout(function() {
            $addplay.button('reset');
        }, 10000);

        var temp = ($addr.val()).match('\\d+');
        var id = '';
        if (temp) {
            id = temp[0];
        }
        if (audiolist['id' + id]) {
            $('.textdiv').html('已经在列表中,点击确定跳转播放');
            $('#showtext').modal('show');
            $('#ensurebtn').one('click', function() {
                clearTimeout(temptimer);
                $('#showtext').modal('hide');
                for (var i = 0; i < playlistinfo.length; i++) {
                    if (id === playlistinfo[i]['rate128'].id) {
                        currentIndex = i;
                        palynewaudio(currentIndex);
                        break;
                    }
                }

            });
            return;
        }

        var newaudio = {};
        audiolist['id' + id] = newaudio;
        playlistinfo.push(newaudio);


        //if (false) {
        //    newaudio['rate128'] = {
        //        'id': '123',
        //        'rate': 128,
        //        'mp3': 'http://xinshangshangxin.com/test/tiankong.mp3',
        //        'cover': '',
        //        'title': '天空',
        //        'time': '436',
        //        'artist': '蔡依林',
        //        'lrc': 'http://xinshangshangxin.com/test/test.txt'
        //    };
        //
        //    clearTimeout(temptimer);
        //    $addplay.button('reset');
        //    currentIndex = playlistinfo.length - 1;
        //    palynewaudio(currentIndex, true);
        //    //本地存储
        //    localInfo.playlistinfo = playlistinfo;
        //    localStorage['shang_music'] = JSON.stringify(localInfo);
        //
        //    return;
        //}


        getbdmInfo(id, [], function(obj) {
            newaudio['rate' + obj.rate] = obj;
            if (obj.rate === '128') {
                clearTimeout(temptimer);
                $addplay.button('reset');
                currentIndex = playlistinfo.length - 1;
                palynewaudio(currentIndex, true);
                //本地存储
                localInfo.playlistinfo = playlistinfo;
                localStorage['shang_music'] = JSON.stringify(localInfo);
            }
        });
    });


    $previewsong.on('click', function() {
        nextpreview(-1);
    });
    $nextsong.on('click', function() {
        nextpreview(1);
    });

    $mutebtn.on('click', function() {
        if (!audio) {
            return;
        }

        if (audio.muted) {
            audio.muted = false;
            $mutebtn.attr('src', './images/volume.png');
        } else {
            audio.muted = true;
            $mutebtn.attr('src', './images/mute.png');
        }
    });

    $playpushbtn.on('click', function() {
        if (audio) {
            if (isplaying) {
                audio.pause();
                $playpushbtn.attr('src', './images/play.png');
                isplaying = false;
            } else {
                audio.play();
                $playpushbtn.attr('src', './images/pause.png');
                isplaying = true;
            }
        }
    });

    function palynewaudio(nu, isaddlist) {

        var audioobj = playlistinfo[nu]['rate128'];
        if (audio) {
            document.body.removeChild(audio);
        }
        //audio = null;
        audio = document.createElement('audio');
        audio.innerHTML = '<source src=' + audioobj.mp3 + '>';
        document.body.appendChild(audio);
        audio.volume = currentVolum;
        audio.play();

        $(audio).on('timeupdate', function() {
            updateShowTime();
        });
        $(audio).on('ended', function() {
            nextpreview(1);
        });


        lrcObj = shangLrcLoad(audio, 'lrcdiv');
        jsonpGet('http://xinshangshangxin.com/getbyurl?method=get&url=' + audioobj.lrc, function(data) {
            lrcObj.parseLrc(data.data);
            lrcObj.init();
        });

        showinfo(audioobj, nu, isaddlist);
    }

    function showinfo(obj, nu, isaddlist) {
        $title.html(obj.title || 'SHANG');
        $artist.html(obj.artist || 'SHANG');
        $coverimg.attr('src', obj.cover || 'http://i1.tietuku.com/f3f9084123926501.jpg');


        if (isaddlist) {
            addAudiolisthtml(obj, nu);
        }

        for (var i = 0; i < audiolisthtml.length; i++) {
            audiolisthtml[i].removeClass('playing');
        }
        audiolisthtml[nu].addClass('playing');
    }

    function addAudiolisthtml(obj, nu) {
        var all = (obj.time || 0);
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);

        var $li = $('<li>');
        $li.on('click', function() {
            palynewaudio(nu, false);
        });
        $li.html('<hr><div class="row">    <div class="col-xs-8 text-nowrap" title="' + (obj.title || 'SHANG') + '">' + (obj.title || 'SHANG') + '</div>    <div class="col-xs-1">    </div>    <div class="col-xs-3">' + (minute + ":" + second) + '</div></div>');
        $alllistul.append($li);

        audiolisthtml.push($li);
    }

    function nextpreview(nu) {
        if (currentIndex !== -1) {
            currentIndex = (currentIndex + playlistinfo.length + nu) % playlistinfo.length;
            palynewaudio(currentIndex, false);
        }
    }


    //更新 播放进度 和 时间显示
    function updateShowTime() {
        var all = audio.currentTime;
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);
        $info.html(minute + ":" + second);

        if (!isProgressBar) {
            $currentprogressbar.width(audio.currentTime / audio.duration * 100 + "%");
        }
    }
});
