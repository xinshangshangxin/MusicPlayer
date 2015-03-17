function getbdmInfo(info, rate, funsuccess) {
    var id = info.match('\\d+')[0];
    var url = 'http://music.baidu.com/data/music/fmlink?songIds=' + id + '&type=mp3&rate=';
    if (typeof (rate) === 'string') {
        getoInfo(url + rate, id, rate, funsuccess);
    }
    else {
        if (!rate.length) {
            rate = ['128', '192', '320', 'flac'];
        }
        for (var i = 0; i < rate.length; i++) {
            getoInfo(url + rate[i], id, rate[i], funsuccess);
        }
    }
}

function getoInfo(url, id, rate, fun) {
    jsonpGet(url, function (json) {
      console.log(json);
        var songinfo = json.data.songList[0];
        var obj = {
            'id': id,
            'rate': rate,
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
    });
}