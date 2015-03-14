//{"playlistinfo":[{"rate128":{"id":"7276963","rate":"128","mp3":"http://musicdata.baidu.com/data2/music/52456966/7276963241200128.mp3?xcode=4734b53eeb88864534568fd8d7fa32a2e619f1cfa997b285","cover":"http://musicdata.baidu.com/data2/pic/115993826/115993826.jpg","title":"天空","time":278,"artist":"蔡依林","lrc":"http://play.baidu.com/data2/lrc/13818970/13818970.lrc"},"repaireTimeNu":-6},{"rate128":{"id":"2084983","rate":"128","mp3":"http://musicdata.baidu.com/data2/music/41830533/20849831425592861128.mp3?xcode=4734b53eeb8886455f65adcfd775b5301489e1db000d3934","cover":"http://b.hiphotos.baidu.com/ting/pic/item/d0c8a786c9177f3e34e8ae1b72cf3bc79e3d56c3.jpg","title":"来不及","time":203,"artist":"田馥甄","lrc":"http://play.baidu.com/data2/lrc/14967169/14967169.lrc"}}]}
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
    $lrcdiv = $('#lrcdiv');

  var currentprogress = 0, //当前进度
    currentIndex = -1, // 当前播放 index
    currentVolum = 1, // 当前音量
    playlistinfo = [], // 所有 歌曲
    audiolisthtml = [], // 所有歌曲 的 html 格式
    isplaying = true, // 是否正在播放
    temptimer = null,
    isProgressBar = false, //判断是否鼠标移动在 进度条上
    isVolumBar = false, // 判断是否鼠标移动在 音量条上
    lrcObj,             // 歌词对象
    localInfo = {},  //localStorage 存储对象
    progressbarLen,  // 进度条长度
    volumBarlen;    //音量条长度

  initLocalInfo();

  $(window).on('resize', function() {
    resizeInit();
  });


  $(window).on('beforeunload', function() {
    return "提示: ";
  });

  // 列表点击 事件代理
  $alllistul.on('click', 'li', function(e) {
    var nu = $(this).data('nu');
    palynewaudio(nu, false);
    e.stopPropagation();
  });

  $alllistul.on('click', 'li img', function(e) {
    var parentLi = $(this).parents('li.maydelete');
    var nu = parentLi.data('nu');
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

  $textdiv.on('click', 'li', function(e) {
    var id = '' + $(this).data('songid');
    playAudioById(id);
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

  $lrctimereduce.on('click', function() {
    lrctimeUpdate(-1);
  });

  $lrctimeadd.on('click', function() {
    lrctimeUpdate(1);
  });

  $lrctimecurrent.on('click', function() {
    lrctimeUpdate(0);
  });


  function resizeInit() {
    progressbarLen = $progressbar.width();
    volumBarlen = $volumebar.width();

    var height = $(window).height() - $searcharea.height() - $player.height() - 50;
    $alllist.height(height > 0 ? height : 100);
    $lrcdiv.height(height - 20 > 0 ? (height - 20) : 100);
  }

  //界面初始化
  function initLocalInfo() {
    resizeInit();

    var localStr = localStorage.shang_music;

    if (localStr) {
      localInfo = JSON.parse(localStr);
      if (localInfo) {
        playlistinfo = localInfo.playlistinfo || [];
        for (var i = 0; i < playlistinfo.length; i++) {
          if (!playlistinfo[i]) {
            continue;
          }
          addAudiolisthtml(playlistinfo[i].rate128, i);
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
  });


  $mayplay.each(function(i) {
    (function(j, _this) {
      $(_this).on('click', function() {
        $mayplay.first().button('loading');
        temptimer = setTimeout(function() {
          $addplay.button('reset');
        }, 5000);


        var temp = ($addr.val()).match('\\d+');
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
              playlistinfo.length = playlistinfo.length - 1;

              var tempstr = $textdiv.html();
              $textdiv.html('此音乐为网网盘音乐, 点击确定打开此音乐网盘地址, 点击返回重新选取');
              $ensurebtn.show();
              $notsurebtn.html('返回');
              $ensurebtn.html('<a href="' + obj.showLink + '" target = "_blank" style="color: white">跳转</a>');
              $ensurebtn.one('click', function() {
                $showtext.modal('hide');
                return true;
              });
              $notsurebtn.get(0).dataset.dismiss = '';
              $notsurebtn.one('click', function() {
                $textdiv.html(tempstr);
                $notsurebtn.html('关闭');
                $ensurebtn.hide();
                setTimeout(function() {
                  $notsurebtn.get(0).dataset.dismiss = 'modal';
                }, 200);
              });
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

      setTimeout(function() {
        $showtext.modal('hide');
      }, 3 * 1000);

      return;
    }

    //var serverUrl = 'http://cors.coding.io/';
    //var serverUrl = 'http://azure.xinshangshangxin.com/getbyurl';
    var serverUrl = 'http://121.40.81.63:1337/'

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
          $li.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="' + (obj.songname || 'SHANG') + '">' + (obj.songname || 'SHANG') + '</div><div class="col-md-4 col-xs-5 text-nowrap" title="' + (obj.artistname || 'SHANG') + '">' + (obj.artistname || 'SHANG') + '</div></div>');
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
        $addplay.button('reset');
        currentIndex = playlistinfo.length - 1;
        palynewaudio(currentIndex, true);
        //本地存储
        saveInfo();
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


  function palynewaudio(nu, isaddlist, which) {

    var ismute = false;
    //console.log(nu);
    if (!playlistinfo[nu]) {
      nextpreview(which || 1);
      return;
    }


    var audioobj = playlistinfo[nu].rate128;

    if (/pan.baidu/.test(audioobj.showLink)) {
      $textdiv.html('此音乐为百度网盘音乐, 删除并播放下一首?');
      $ensurebtn.show();
      $showtext.modal('show');
      $ensurebtn.one('click', function() {

        if (playlistinfo.length !== 1) {
          nextpreview(1);
        }

        $alllistul.find('li').each(function() {
          $(this).find('img').first().trigger('click');
        });
      });

      return;
    }


    if (audio) {
      ismute = audio.muted;
      document.body.removeChild(audio);
    }
    //audio = null;
    audio = document.createElement('audio');
    audio.innerHTML = '<source src=' + audioobj.mp3 + '>';
    document.body.appendChild(audio);
    audio.volume = currentVolum;
    audio.play();
    currentIndex = nu;

    if (!isplaying) {
      $playpushbtn.attr('src', './images/pause.png');
      isplaying = true;
    }

    if (ismute) {
      audio.muted = ismute;
      $mutebtn.attr('src', './images/mute.png');
    }


    $(audio).on('timeupdate', function() {
      updateShowTime();
    });
    $(audio).on('ended', function() {
      nextpreview(1);
    });


    lrcObj = shangLrcLoad(audio, 'lrcdiv');
    jsonpGet('http://cors.coding.io?method=get&url=' + audioobj.lrc, function(data) {
      lrcObj.parseLrc(data.data);
      lrcObj.repaireTimeNu = audioobj.repaireTimeNu || 0;
      console.log(audioobj.repaireTimeNu);
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

    $li.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="' + (obj.title || 'SHANG') + '">' + (obj.title || 'SHANG') + ' - ' + (obj.artist || 'SHANG') + '</div><div class="col-md-2 col-xs-3 text-right">' + (minute + ":" + second) + '</div><div class="col-md-1 col-xs-1"><img class="visible-xs" src="images/delete.png" alt="删除"/></div></div>');

    $li.data('nu', nu);
    $alllistul.append($li);
    audiolisthtml.push($li);
  }

  function nextpreview(nu) {
    if (currentIndex !== -1) {
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


  function saveInfo() {
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
    localStorage.shang_music = JSON.stringify(localInfo);

    return ishad;
  }

});
