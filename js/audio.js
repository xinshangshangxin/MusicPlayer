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
    $textdiv = $('.textdiv');

  var currentprogress = 0, //当前进度
    currentIndex = -1, // 当前播放 index
    currentVolum = 1, // 当前音量
    playlistinfo = [], // 所有 歌曲
    audiolisthtml = [], // 所有歌曲 的 html 格式
    isplaying = true, // 是否正在播放
    temptimer = null;

  //本地存储
  var localStr = localStorage['shang_music'];
  var localInfo = {};
  if (localStr) {
    localInfo = JSON.parse(localStr);
    if (localInfo) {
      playlistinfo = localInfo.playlistinfo || [];
      for (var i = 0; i < playlistinfo.length; i++) {
        if (!playlistinfo[i]) {
          continue;
        }
        addAudiolisthtml(playlistinfo[i]['rate128'], i);
      }
    }
  }


  var isProgressBar = false;
  var progressbarLen = $progressbar.width();
  var isVolumBar = false;
  var volumBarlen = $volumebar.width();
  var lrcObj;

  $(document).on('keydown', function(e) {
    if (e.keyCode === 13) {
      $mayplay.trigger('click');
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

  function lrctimeUpdate(nu) {
    if (!audio) {
      return;
    }
    clearTimeout($lrctimecurrent.timer);

    if (nu === 0) {
      playlistinfo[currentIndex].repaireTimeNu = 0;
    }
    else {
      playlistinfo[currentIndex].repaireTimeNu = (playlistinfo[currentIndex].repaireTimeNu || 0) + nu;
    }

    lrcObj.repaireTimeNu = playlistinfo[currentIndex].repaireTimeNu;

    $lrctimecurrent.html('[' + lrcObj.repaireTimeNu / 10 + ']');

    $lrctimecurrent.timer = setTimeout(function() {
      $lrctimecurrent.html('');
      localInfo.playlistinfo = playlistinfo;
      localStorage['shang_music'] = JSON.stringify(localInfo);
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
            $textdiv.html('检测到ID,直接播放?');
            $showtext.modal('show');
            $ensurebtn.one('click', function() {
              id = temp[0];
              playAudioById(id);
            });
            $notsurebtn.one('click', function() {
              $notsurebtn.html('关闭');
              playAudioById('');
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
        if (playlistinfo[i] && id === playlistinfo[i]['rate128'].id) {
          hadNu = i;
          break;
        }
      }

      if (hadNu !== -1) {
        $ensurebtn.show();
        $textdiv.html('已经在列表中,点击确定跳转播放');
        $showtext.modal('show');
        $ensurebtn.one('click', function() {
          $showtext.modal('hide');
          currentIndex = hadNu;
          palynewaudio(currentIndex);
        });
      }
      else {
        var newaudio = {};
        playlistinfo.push(newaudio);

        getbdmInfo(id, [], function(obj) {
          newaudio['rate' + obj.rate] = obj;
          if (obj.rate === '128') {
            currentIndex = playlistinfo.length - 1;

            if (/pan.baidu/.test(obj.mp3)) {
              playlistinfo.length = playlistinfo.length - 1;

              var tempstr = $textdiv.html();
              $textdiv.html('此音乐为百度网盘音乐, 点击确定打开此音乐网盘地址, 点击返回重新选取');
              $ensurebtn.show();
              $notsurebtn.html('返回');
              $ensurebtn.html('<a href="' + obj.mp3 + '" target = "_blank">返回</a>');
              $ensurebtn.one('click', function() {
                $showtext.modal('hide');
                return true;
              });
              $notsurebtn.one('click', function() {
                $textdiv.html(tempstr);

                setTimeout(function() {
                  $showtext.modal('show');

                  $textdiv.find('li').each(function() {
                    $(this).on('click', function() {
                        var id = $(this).data('songid') + '';
                        playAudioById(id);
                      }
                    );
                  });
                }, 500);
              });
            }
            else {
              palynewaudio(currentIndex, true);
              $showtext.modal('hide');
            }


            //本地存储
            asyncSave();
            //localInfo.playlistinfo = playlistinfo;
            //localStorage['shang_music'] = JSON.stringify(localInfo);

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
    var serverUrl = 'http://azure.xinshangshangxin.com/getbyurl';

    ajaxGet(serverUrl + '?method=get&url=' + encodeURIComponent('http://sug.music.baidu.com/info/suggestion?format=json&word=' + str + '&version=2&from=0'), function(d) {
      var data = JSON.parse(d).data;

      var $searchSongDiv = $('<div id="searchsongdiv">');
      var $ul = $('<ul>');
      for (var i = 0; i < data.song.length; i++) {
        var obj = data.song[i];
        var $li = $('<li data-songid="' + obj.songid + '">');
        $li.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="' + (obj.songname || 'SHANG') + '">' + (obj.songname || 'SHANG') + '</div><div class="col-md-4 col-xs-5 text-nowrap" title="' + (obj.artistname || 'SHANG') + '">' + (obj.artistname || 'SHANG') + '</div></div>');

        $li.on('click', function() {
            var id = $(this).data('songid') + '';
            playAudioById(id);
          }
        );

        $ul.append($li);
      }

      $searchSongDiv.append($ul);

      $textdiv.html('');
      $textdiv.append($searchSongDiv);
      $ensurebtn.hide();
      $showtext.modal('show');
    });
  }


  $addplay.on('click', function() {
    alert();

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
      if (id === playlistinfo[i]['rate128'].id) {
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
        asyncSave();
        //localInfo.playlistinfo = playlistinfo;
        //localStorage['shang_music'] = JSON.stringify(localInfo);
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
    if (!playlistinfo[nu]) {
      nextpreview(which || 1);
      return;
    }

    var audioobj = playlistinfo[nu]['rate128'];

    if (/pan.baidu/.test(audioobj.mp3)) {
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
      document.body.removeChild(audio);
    }
    //audio = null;
    audio = document.createElement('audio');
    audio.innerHTML = '<source src=' + audioobj.mp3 + '>';
    document.body.appendChild(audio);
    audio.volume = currentVolum;
    audio.play();
    currentIndex = nu;

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

    $alllistul.find('li').each(function(i) {
      if ($(this).data('nu') == nu) {
        audiolisthtml[i].addClass('playing');
      }
    });
  }

  function addAudiolisthtml(obj, nu) {
    var all = (obj.time || 0);
    var minute = Math.floor(all / 60);
    var second = Math.round(all % 60) < 10 ? "0" + Math.round(all % 60) : Math.round(all % 60);

    var $li = $('<li>');
    $li.on('click', function() {
      palynewaudio(nu, false);
    });
    $li.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="' + (obj.title || 'SHANG') + '">' + (obj.title || 'SHANG') + ' - ' + (obj.artist || 'SHANG') + '</div><div class="col-md-2 col-xs-3 text-right">' + (minute + ":" + second) + '</div><div class="col-md-1 col-xs-1"><img class="visible-xs" src="images/delete.png" alt="删除"/></div></div>');
    $alllistul.append($li);
    $li.data('nu', nu);

    $li.on('mouseover', function() {
      $(this).addClass('maydelete');
      $(this).find('img').removeClass('visible-xs');
      $(this).find('img').css('display', 'block');
    });
    $li.on('mouseout', function() {
      $(this).removeClass('maydelete');
      $(this).find('img').addClass('visible-xs');
      $(this).find('img').css('display', 'none');
    });
    $li.find('img').on('click', function(e) {
      if (currentIndex === nu) {
        if (playlistinfo.length === 1) {
          currentIndex = -1;
          removeAllInfo();
        }
        else {
          nextpreview(1);
        }
      }
      //else if (currentIndex > nu) {
      //  currentIndex--;
      //}
      playlistinfo[nu] = undefined;
      //playlistinfo.splice(nu, 1);
      audiolisthtml.splice(nu, 1);
      $alllistul.find('li').remove('.maydelete');
      asyncSave();
      e.stopPropagation();
    });

    audiolisthtml.push($li);
  }

  function nextpreview(nu) {
    console.log(currentIndex);
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
      $currentprogressbar.width(audio.currentTime / audio.duration * 100 + "%");
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
    $info.html('');
  }


  function asyncSave() {
    setTimeout(function() {
      var arr = [];
      //去除 undefined
      for (var i = 0; i < playlistinfo.length; i++) {
        if (playlistinfo[i]) {
          arr.push(playlistinfo[i]);
        }
      }
      localInfo.playlistinfo = arr;
      localStorage['shang_music'] = JSON.stringify(localInfo);
    }, 0);
  }
});
