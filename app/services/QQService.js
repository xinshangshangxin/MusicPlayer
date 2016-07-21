'use strict';

const request = Promise.promisify(require('request'), {
  multiArgs: true
});

var svc = {
  typeCode: 1,
  search: function(key) {
    key = encodeURI(key);

    let pageNu = 1;
    let perPage = 10;

    let url = `http://s.music.qq.com/fcgi-bin/music_search_new_platform?n=${perPage}&p=${pageNu}&w=${key}&t=0&aggr=1&cr=1&loginUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=jqminiframe.json&needNewCode=0&catZhida=0&remoteplace=sizer.newclient.next_song`;

    return request(
      {
        url: url,
        json: true
      })
      .spread((res, json) => {
        return json;
      })
      .then((data) => {
        var arr = _.get(data, 'data.song.list');
        if(!arr || !arr.length) {
          return [];
        }

        return svc
          .getToken()
          .then(function(key) {
            return _.chain(arr)
              .map(function(obj) {
                return svc.mapSearchKey(obj, key);
              })
              .filter(function(obj) {
                return !!obj;
              })
              .value();
          });
      });
  },
  mapSearchKey: (obj, key) => {
    let f = obj.f || '';
    let arr = f.split('|');
    if(arr.length <= 4) {
      return null;
    }
    let id = arr[arr.length - 5];
    let imgId = arr[arr.length - 3];
    let imgKey1 = imgId.substring(imgId.length - 2, imgId.length - 1);
    let imgKey2 = imgId.substring(imgId.length - 1);
    let lrcId = arr[0];
    let lrcKey = parseInt(arr[0]) % 100;
    return {
      type: svc.typeCode,
      singer: obj.fsinger,
      song: obj.fsong,
      id: id,
      cover: `http://imgcache.qq.com/music/photo/mid_album_300/${imgKey1}/${imgKey2}/${imgId}.jpg`,
      lrc: `http://music.qq.com/miniportal/static/lyric/${lrcKey}/${lrcId}.xml`,
      url: svc.getUrlById(id, key)
    };
  },
  getUrlById: (id, key) => {
    if(key) {
      return `http://dl.stream.qqmusic.qq.com/C200${id}.m4a?vkey=${key}&guid=9320260485&fromtag=30`;
    }

    return svc.getToken()
      .then((key) => {
        return `http://dl.stream.qqmusic.qq.com/C200${id}.m4a?vkey=${key}&guid=9320260485&fromtag=30`;
      });
  },
  getToken: () => {
    let url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=9320260485&g_tk=938407465&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&jsonpCallback=jsonCallback&needNewCode=0';

    return request(url).spread(function(res, data) {
      return data.match(/"key":\s*"(\w+)"}/)[1];
    });
  }
};

module.exports = svc;