$(document).ready(function() {

    var audio = null,
        $addplay = $('#addandplay'),
        $mayplay = $('.mayplay'),
        $addr = $('#addr'),
        $playpushbtn = $('#playpaush'), // 暂停播放按钮
        $previewsong = $('#previewsong'), //上一首
        $nextsong = $('#nextsong'), //下一首
        $mutebtn = $('#mute'), //静音按钮
        $volumebar = $('#volumebar'), // 音量条
        $currentvolumebar = $('#currentvolumebar'), //当前音量
        $progressbar = $('#progressbar'), // 进度条
        $currentprogressbar = $('#currentprogress'), //当前进度
        $loadedprogress = $('#loadedprogress'), // 已经载入的长度
        $coverimg = $('#coverimg'),
        $title = $('#title'),
        $artist = $('#artist'),
        $info = $('#info'),
        $alllistul = $('#alllistul'),
        $lrctimereduce = $('#lrctimereduce'),
        $lrctimeadd = $('#lrctimeadd'),
        $lrctimecurrent = $('#lrctimecurrent'),
        $ensurebtn = $('#ensurebtn'),
        $showtext = $('#showtext'),
        $notsurebtn = $('#notsurebtn'),
        $textdiv = $('.textdiv'),
        $searcharea = $('#searcharea'),
        $player = $('#player'),
        $alllist = $('#alllist'),
        $lrcdiv = $('#lrcdiv'),
        $download = $('#download'),
        $single = $('#single');

    var currentprogress = 0, //当前进度
        currentIndex = -1, // 当前播放 index
        currentVolum = 1, // 当前音量
        playlistinfo = [], // 所有 歌曲
        audiolisthtml = [], // 所有歌曲 的 html 格式
        isplaying = true, // 是否正在播放
        temptimer = null,
        isProgressBar = false, //判断是否鼠标移动在 进度条上
        isVolumBar = false, // 判断是否鼠标移动在 音量条上
        lrcObj, // 歌词对象
        localInfo = {}, //localStorage 存储对象
        progressbarLen, // 进度条长度
        volumBarlen, //音量条长度
        downloadId, //下载音乐的 编号
        timedownload, //下载音乐 按钮点击 时间
        isSingle = false, //是否 单曲循环
        lastPlayId = -1; // 上次播放ID;

    var serverUrl = 'http://cors.coding.io/';
    // var serverUrl = 'http://nodecors.sturgeon.mopaas.com/';
    //var serverUrl = 'http://121.40.81.63:1337/';

    initLocalInfo();

    $(window).on('resize', function() {
        resizeInit();
    });


    $(window).on('beforeunload', function() {
        // 判断是否点击下载音乐
        if (new Date().getTime() - (timedownload || 0) > 1000) {
            saveInfo(playlistinfo[currentIndex].rate128.id);
            return "提示: ";
        }
    });

    // 列表点击 事件代理
    $alllistul.on('click', 'li', function(e) {
        var nu = $(this).data('nu');
        palynewaudio(nu, false, null, true);
        e.stopPropagation();
    });


    $alllistul.on('click', 'li img', function(e) {
        var parentLi = $(this).parents('li.maydelete');
        var nu = parentLi.data('nu');

        if (e.target.id === 'imgdel') {
            playlistinfo[nu] = undefined;
            audiolisthtml.splice(nu, 1);
            parentLi.remove();
            var ishad = saveInfo();

            if (nu === currentIndex) {
                if (ishad) {
                    nextpreview(1);
                }
                else {
                    removeAllInfo();
                }
            }
        }
        else {
            if (nu >= 0) {
                downloadId = playlistinfo[nu].rate128.id;
                showdownloadhtml();
            }
        }
        e.stopPropagation();
    });

    $alllistul.on('mouseover', 'li', function() {
        $(this).addClass('maydelete');
        $(this).find('img').removeClass('visible-xs');
        $(this).find('img').css('display', 'block');
    });
    $alllistul.on('mouseout', 'li', function() {
        $(this).removeClass('maydelete');
        $(this).find('img').addClass('visible-xs');
        $(this).find('img').css('display', 'none');
    });

    // 播放监听
    $textdiv.on('click', 'li', function(e) {
        var id = '' + $(this).data('songid');
        playAudioById(id);
        e.stopPropagation();
    });

    // 下载监听
    $textdiv.on('click', 'a', function() {
        getbdmInfo(downloadId, [this.getAttribute('data-rate')], function(obj) {
            timedownload = new Date().getTime();
            if (/pan.baidu/.test(obj.showLink)) {
                //prompt("网盘音乐,请复制链接下载~~", obj.mp3);
                if (obj.mp3.match(serverUrl)) {
                    downloadhref(obj.mp3);
                }
                else {
                    downloadhref(serverUrl + '?fun=fun&url=' + obj.mp3);
                }
            }
            else {
                downloadhref(obj.mp3);
                //var tempstr = $textdiv.html();
                //$notsurebtn.html('返回');
                //$notsurebtn.get(0).dataset.dismiss = '';
                //$notsurebtn.one('click', function() {
                //  $textdiv.html(tempstr);
                //  setTimeout(function() {
                //    $notsurebtn.get(0).dataset.dismiss = 'modal';
                //  }, 200);
                //  $notsurebtn.html('关闭');
                //});
                //$textdiv.html('备用链接; 复制下面链接至迅雷/旋风等下载;如果下载的不是音频文件;说明没有此码率<br><input type="text" id="backdownload" onfocus="this.select();" value="' + obj.downloadhref + '"></input>');
            }
        });
    });

    // 下载监听
    $textdiv.on('click', 'li img', function(e) {
        downloadId = $(this).parents('li').data('songid') + "";
        showdownloadhtml();
        e.stopPropagation();
    });


    $(document).on('keydown', function(e) {
        if (e.keyCode === 13) {
            $mayplay.first().trigger('click');
        }
    });

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

    $addr.on('focus', function() {
        setTimeout(function() {
            $addr.select();
        }, 20);
    });

    $lrctimereduce.on('click', function() {
        lrctimeUpdate(-1);
    });

    $lrctimeadd.on('click', function() {
        lrctimeUpdate(1);
    });

    $lrctimecurrent.on('click', function() {
        lrctimeUpdate(0);
    });

    $download.on('click', function() {
        if (currentIndex >= 0) {
            downloadId = playlistinfo[currentIndex].rate128.id;
            showdownloadhtml();
        }
    });

    $single.on('click', function() {
        isSingle = !isSingle;
        if (!isSingle) {
            $single.attr('src', 'images/all.png');
        }
        else {
            $single.attr('src', 'images/single.png');
        }
    });

    function showdownloadhtml() {
        $textdiv.html('如果下载的码率不存在,默认下载为128码率[如果文件大小为3~4M就是128码率]<br><a data-rate="128" href = "javascript:void(0);">128</a><br><a data-rate="192" href = "javascript:void(0);">192</a><br><a data-rate="320" href = "javascript:void(0);">320</a><br><a data-rate="flac" href = "javascript:void(0);">flac</a>');
        $showtext.modal('show');
        $ensurebtn.hide();
    }


    function downloadhref(href, fileName) {
        var aLink = document.createElement('a');
        aLink.href = href;
        aLink.target = '_blank';
        fileName ? (aLink.download = fileName) : (aLink.download = 'download');
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        aLink.dispatchEvent(evt);
    }

    function resizeInit() {
        progressbarLen = $progressbar.width();
        volumBarlen = $volumebar.width();

        var height = $(window).height() - $searcharea.height() - $player.height() - 50;
        $alllist.height(height > 0 ? height : 100);
        $lrcdiv.height(height - 50 > 0 ? (height - 50) : 100);
    }

    //界面初始化
    function initLocalInfo() {
        resizeInit();

        var localStr = localStorage.shang_music;

        if (localStr) {
            localInfo = JSON.parse(localStr);
            if (localInfo) {
                isSingle = localInfo.isSingle;
                if (!isSingle) {
                    $single.attr('src', 'images/all.png');
                }
                lastPlayId = localInfo.lastPlayId || 0;
                playlistinfo = localInfo.playlistinfo || [];
                for (var i = 0; i < playlistinfo.length; i++) {
                    if (!playlistinfo[i]) {
                        continue;
                    }
                    var temp = playlistinfo[i].rate128;
                    checkAudio(temp);
                    addAudiolisthtml(temp, i);
                    if (temp.id === lastPlayId) {
                        palynewaudio(i, false);
                    }
                }
            }
        }
    }

    function lrctimeUpdate(nu) {
        if (!audio) {
            return;
        }
        clearTimeout($lrctimecurrent.timer);

        if (nu === 0) {
            playlistinfo[currentIndex].rate128.repaireTimeNu = 0;
        }
        else {
            playlistinfo[currentIndex].rate128.repaireTimeNu = (playlistinfo[currentIndex].rate128.repaireTimeNu || 0) + nu;
        }

        lrcObj.repaireTimeNu = playlistinfo[currentIndex].rate128.repaireTimeNu;
        $lrctimecurrent.html('[' + lrcObj.repaireTimeNu / 10 + ']');

        saveInfo();
        $lrctimecurrent.timer = setTimeout(function() {
            $lrctimecurrent.html('');
        }, 2000);
    }

    function calculateProgressBar(e, isupdate) {
        if (isProgressBar && !!audio) {
            var len = e.clientX - $progressbar.offset().left;
            var percentLen = len / progressbarLen;
            if (percentLen < 0) {
                percentLen = 0;
            }
            else if (percentLen > 1) {
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
            }
            else if (percentLen > 1) {
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

    function getBufferPercent() {
        if (!audio) {
            return 0;
        }
        var timeRanges = audio.buffered;
        if (timeRanges.length) {
            // 获取以缓存的时间
            var timeBuffered = timeRanges.end(timeRanges.length - 1);
            // 获取缓存进度，值为0到1
            var bufferPercent = timeBuffered / audio.duration;
            return bufferPercent;
        }
    }

    $showtext.on('hidden.bs.modal', function() {
        $mayplay.first().button('reset');
        $ensurebtn.show();
        $ensurebtn.unbind();
        $notsurebtn.html('关闭');
        $notsurebtn.unbind();
        clearTimeout(temptimer);
        $notsurebtn.get(0).dataset.dismiss = 'modal';
    });


    $mayplay.each(function(i) {
        (function(j, _this) {
            $(_this).on('click', function() {
                $mayplay.first().button('loading');
                temptimer = setTimeout(function() {
                    $addplay.button('reset');
                }, 5000);


                var temp = ($addr.val()).match('\\d{7,}');
                var id = '';

                if (temp) {
                    if (j === 1) {
                        id = temp[0];
                        playAudioById(id);
                    }
                    else {
                        $notsurebtn.html('否');
                        $notsurebtn.get(0).dataset.dismiss = '';

                        $textdiv.html('检测到ID,直接播放?');
                        $showtext.modal('show');
                        $ensurebtn.one('click', function() {
                            id = temp[0];
                            playAudioById(id);
                        });
                        $notsurebtn.one('click', function() {
                            $notsurebtn.html('关闭');
                            playAudioById('');
                            setTimeout(function() {
                                $notsurebtn.get(0).dataset.dismiss = 'modal';
                            }, 200);
                        });
                    }
                }
                else {
                    playAudioById('');
                }
            });
        })(i, this);
    });


    function playAudioById(id) {
        if (id) {
            var hadNu = -1;
            for (var i = 0; i < playlistinfo.length; i++) {
                if (playlistinfo[i] && id === playlistinfo[i].rate128.id) {
                    hadNu = i;
                    break;
                }
            }

            if (hadNu !== -1) {
                $ensurebtn.show();
                var tempstr = $textdiv.html();
                $textdiv.html('已经在列表中,点击确定跳转播放');
                $showtext.modal('show');
                $notsurebtn.html('返回');
                $notsurebtn.get(0).dataset.dismiss = '';
                $notsurebtn.one('click', function() {
                    $textdiv.html(tempstr);
                    $notsurebtn.html('关闭');
                    setTimeout(function() {
                        $notsurebtn.get(0).dataset.dismiss = 'modal';
                    }, 200);
                });
                $ensurebtn.one('click', function() {
                    $showtext.modal('hide');
                    currentIndex = hadNu;
                    palynewaudio(currentIndex);
                });
            }
            else {
                var newaudio = {};
                playlistinfo.push(newaudio);
                getbdmInfo(id, ['128'], function(obj) {
                    newaudio['rate' + obj.rate] = obj;
                    if (obj.rate === '128') {
                        currentIndex = playlistinfo.length - 1;

                        if (/pan.baidu/.test(obj.showLink)) {
                            obj.mp3 = serverUrl + '?fun=fun&url=' + encodeURIComponent(obj.mp3);
                            palynewaudio(currentIndex, true);
                            $showtext.modal('hide');
                            //playlistinfo.length = playlistinfo.length - 1;
                            //
                            //var tempstr = $textdiv.html();
                            //$textdiv.html('此音乐为网网盘音乐, 点击确定打开此音乐网盘地址, 点击返回重新选取');
                            //$ensurebtn.show();
                            //$notsurebtn.html('返回');
                            //$ensurebtn.html('<a href="' + obj.showLink + '" target = "_blank" style="color: white">跳转</a>');
                            //$ensurebtn.one('click', function() {
                            //  $showtext.modal('hide');
                            //  return true;
                            //});
                            //$notsurebtn.get(0).dataset.dismiss = '';
                            //$notsurebtn.one('click', function() {
                            //  $textdiv.html(tempstr);
                            //  $notsurebtn.html('关闭');
                            //  $ensurebtn.hide();
                            //  setTimeout(function() {
                            //    $notsurebtn.get(0).dataset.dismiss = 'modal';
                            //  }, 200);
                            //});
                        }
                        else {
                            palynewaudio(currentIndex, true);
                            $showtext.modal('hide');
                        }

                        saveInfo();
                    }
                });
            }
        }
        else {
            searchSong($addr.val());
        }
    }


    function searchSong(str) {
        if (!str) {

            $textdiv.html('请输入 歌曲名/歌手/百度音乐ID链接');
            $ensurebtn.hide();
            $showtext.modal('show');

            temptimer = setTimeout(function() {
                $showtext.modal('hide');
            }, 3 * 1000);

            return;
        }


        ajaxGet(serverUrl + '?method=get&url=' + encodeURIComponent('http://sug.music.baidu.com/info/suggestion?format=json&word=' + str + '&version=2&from=0'), function(d) {
            var data = JSON.parse(d).data;

            var $searchSongDiv = $('<div id="searchsongdiv">');

            if (!data.song.length) {
                $searchSongDiv.html('未找到....');
            }
            else {
                var $ul = $('<ul>');
                for (var i = 0; i < data.song.length; i++) {
                    var obj = data.song[i];
                    var $li = $('<li data-songid="' + obj.songid + '">');
                    $li.html('<hr><div class="row"> <div class="col-md-7 col-xs-5 text-nowrap" title="' + (obj.songname || 'SHANG') + '">' + (obj.songname || 'SHANG') + '</div><div class="col-md-4 col-xs-5 text-nowrap" title="' + (obj.artistname || 'SHANG') + '">' + (obj.artistname || 'SHANG') + '</div><div class="col-md-1 col-xs-2"><img class="liimg pull-left" src="images/download.png"/></div></div>');
                    $ul.append($li);
                }
                $searchSongDiv.append($ul);
            }

            $textdiv.html('');
            $textdiv.append($searchSongDiv);
            $ensurebtn.hide();
            $showtext.modal('show');
        });
    }


    $addplay.on('click', function() {

        $addplay.button('loading');
        temptimer = setTimeout(function() {
            $addplay.button('reset');
        }, 10000);

        var tempstr = $addr.val();
        if (!tempstr) {

            $textdiv.html('请输入 搜索内容!');
            $ensurebtn.hide();
            $showtext.modal('show');

            return;
        }

        var temp = tempstr.match('\\d+');
        var id = '';
        if (temp) {
            id = temp[0];
        }

        var hadNu = -1;
        for (var i = 0; i < playlistinfo.length; i++) {
            if (id === playlistinfo[i].rate128.id) {
                hadNu = i;
                break;
            }
        }

        if (hadNu !== -1) {
            $textdiv.html('已经在列表中,点击确定跳转播放');
            $showtext.modal('show');
            $ensurebtn.one('click', function() {
                $showtext.modal('hide');

                currentIndex = hadNu;
                palynewaudio(currentIndex);
            });
            return;
        }

        var newaudio = {};
        playlistinfo.push(newaudio);


        getbdmInfo(id, ['128'], function(obj) {
            newaudio['rate' + obj.rate] = obj;
            if (obj.rate === '128') {
                $addplay.button('reset');
                currentIndex = playlistinfo.length - 1;
                palynewaudio(currentIndex, true);
                //本地存储
                saveInfo();
            }
        });
    });


    $previewsong.on('click', function() {
        nextpreview(-1, true);
    });
    $nextsong.on('click', function() {
        nextpreview(1, true);
    });

    $mutebtn.on('click', function() {
        if (!audio) {
            return;
        }

        if (audio.muted) {
            audio.muted = false;
            $mutebtn.attr('src', './images/volume.png');
        }
        else {
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
            }
            else {
                audio.play();
                $playpushbtn.attr('src', './images/pause.png');
                isplaying = true;
            }
        }
    });


    // 判断网盘音乐是否过期
    function checkAudio(audioobj) {
        var prevSrc = decodeURIComponent(audioobj.mp3.replace(/(.*url=)|(xcode.*)/gi, ''));
        if (/file.qianqian.com/.test(prevSrc) && ( !audioobj.timeUpdate || (new Date().getTime() - audioobj.timeUpdate) > 24 * 60 * 60 * 1000) ) {
            getbdmInfo(audioobj.id, ['128'], function(obj) {
                audioobj.mp3 = serverUrl + '?fun=fun&url=' + encodeURIComponent(obj.mp3);
                audioobj.timeUpdate = new Date().getTime();
                saveInfo(audioobj.id);
                // 是当前播放的歌曲,并且歌曲处于无法播放状态
                if (audio && decodeURIComponent(audio.src).match(prevSrc) && audio.currentTime < 500) {
                    audio.src = null;
                    audio.load();
                    audio.src = audioobj.mp3;
                    audio.play();
                    if(!isplaying) {
                        audio.pause();
                    }
                }
            });
        }
    }


    function palynewaudio(nu, isaddlist, which, isplay) {

        if (!playlistinfo[nu]) {
            nextpreview(which || 1);
            return;
        }


        var audioobj = playlistinfo[nu].rate128;
        console.log(audioobj);

        if (audio) {
            // 设为null 并且 load() 为了让android不在下载此歌曲
            audio.src = null;
            audio.load();
        }
        else {
            audio = new Audio();

            audio.onerror = function(e) {
                console.log(e)
            };
            audio.ontimeupdate = function() {
                updateShowTime();
            };
            audio.onended = function() {
                nextpreview(1);
            };
        }

        audio.src = audioobj.mp3;
        audio.play();
        currentIndex = nu;

        // 新歌 进度条重置
        $currentprogressbar.width(0);
        $loadedprogress.width(0);


        if (isplay) {
            $playpushbtn.attr('src', './images/pause.png');
            isplaying = true;
        }

        if (!isplaying) {
            audio.pause();
        }


        lrcObj = shangLrcLoad(audio, 'lrcdiv');
        jsonpGet('http://cors.coding.io?method=get&url=' + audioobj.lrc, function(data) {
            lrcObj.parseLrc(data.data);
            lrcObj.repaireTimeNu = audioobj.repaireTimeNu || 0;
            console.log(audioobj.repaireTimeNu);
            lrcObj.init();
        }, function() {
            lrcObj.parseLrc('[00:00]未找到(┬＿┬)');
            lrcObj.repaireTimeNu = audioobj.repaireTimeNu || 0;
            lrcObj.init();
        });

        showinfo(audioobj, nu, isaddlist);
    }

    function showinfo(obj, nu, isaddlist) {
        $title.html(obj.title || 'SHANG');
        $artist.html(obj.artist || 'SHANG');
        $coverimg.attr('src', (obj.cover && (serverUrl + '?fun=fun&url=' + obj.cover)) || 'http://i1.tietuku.com/f3f9084123926501.jpg');


        if (isaddlist) {
            addAudiolisthtml(obj, nu);
        }

        $alllistul.find('li').each(function(i) {
            if ($(this).data('nu') === nu) {
                audiolisthtml[i].addClass('playing');
            }
            else {
                audiolisthtml[i].removeClass('playing');
            }
        });
    }

    function addAudiolisthtml(obj, nu) {
        var all = (obj.time || 0);
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);

        var $li = $('<li>');

        $li.html('<hr><div class="row"> <div class="col-md-7 col-xs-6 text-nowrap" title="' + (obj.title || 'SHANG') + ' - ' + (obj.artist || 'SHANG') + '">' + (obj.title || 'SHANG') + ' - ' + (obj.artist || 'SHANG') + '</div><div class="col-md-2 col-xs-3 text-right">' + (minute + ":" + second) + '</div><div class="col-md-2 col-xs-3"><img id="imgdel" class="liimg pull-left" src="images/delete.png"/><img class="liimg pull-left" src="images/download.png"/></div></div>');

        $li.data('nu', nu);
        $alllistul.append($li);
        audiolisthtml.push($li);
    }

    function nextpreview(nu, isClick) {
        if (currentIndex !== -1) {
            // 循环播放  isClick判断是否人为切换下一首
            if (isSingle && !isClick) {
                palynewaudio(currentIndex, false, nu);
                return;
            }

            currentIndex = (currentIndex + playlistinfo.length + nu) % playlistinfo.length;
            palynewaudio(currentIndex, false, nu);
        }
    }


    //更新 播放进度 和 时间显示
    function updateShowTime() {
        if (!audio) {
            return;
        }
        var all = audio.currentTime;
        var minute = Math.floor(all / 60);
        var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);
        $info.html(minute + ":" + second);

        if (!isProgressBar) {
            $currentprogressbar.width(audio.currentTime / audio.duration * progressbarLen);
            $loadedprogress.width(getBufferPercent() * progressbarLen);
        }
    }


    function removeAllInfo() {

        if (audio) {
            document.body.removeChild(audio);
            audio = null;
            currentIndex = -1;
        }

        $alllistul.html('');
        $('#lrcdiv').html('');

        $title.html('SHANG');
        $artist.html('SHANG');
        $coverimg.attr('src', 'http://i1.tietuku.com/f3f9084123926501.jpg');
        $currentprogressbar.width(0);
        $loadedprogress.width(0);
        $info.html('');
    }


    function saveInfo(id) {
        var arr = [];
        var ishad = false;
        //去除 undefined
        for (var i = 0; i < playlistinfo.length; i++) {
            if (playlistinfo[i]) {
                arr.push(playlistinfo[i]);
                ishad = true;
            }
        }
        localInfo.playlistinfo = arr;
        localInfo.isSingle = isSingle;
        if (id) {
            localInfo.lastPlayId = id;
        }
        localStorage.shang_music = JSON.stringify(localInfo);
        return ishad;
    }
});
