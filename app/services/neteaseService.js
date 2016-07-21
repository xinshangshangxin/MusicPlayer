'use strict';

const request = Promise.promisify(require('request'), {
  multiArgs: true
});

var svc = {
  typeCode: 2,
  search: function(key) {
    let pageNu = 1;
    let perPage = 10;

    let url = `http://music.163.com/api/search/get/web`;

    return request(
      {
        url: url,
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
          'Connection': 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': 'music.163.com',
          'Referer': 'http://music.163.com/search/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'
        },
        form: {
          s: key,
          offset: pageNu - 1,
          limit: perPage,
          type: 1,
          sub: false,
        }
      })
      .spread((res, data) => {
        return JSON.parse(data);
      })
      .then((data) => {
        var arr = _.get(data, 'result.songs');
        if(!arr || !arr.length) {
          return [];
        }

        return _.chain(arr)
          .map(function(obj) {
            return svc.mapSearchKey(obj);
          })
          .value();
      });
  },
  mapSearchKey: (obj) => {
    return {
      type: svc.typeCode,
      singer: _.get(obj, 'artists[0].name'),
      song: obj.name,
      id: obj.id
    };
  },
  getLrc: function(id) {
    return request(
      {
        url: 'http://music.163.com/api/song/lyric/',
        method: 'POST',
        form: {
          id: id,
          os: 'pc',
          lv: -1,
          kv: -1,
          tv: -1,
        }
      })
      .spread((response, data) => {
        return JSON.parse(data).lrc.lyric;
      });
  },
  parse: function(id){
    return svc.getDetail(id);
  },
  getDetail: (id) => {
    return request(`http://music.163.com/api/song/detail/?id=${id}&ids=%5B${id}%5D&csrf_token=&Method=GET`)
      .spread((response, data) => {
        return JSON.parse(data);
      })
      .then(function(json) {
        return svc.mapDetailKey(json);
      });
  },
  mapDetailKey: (obj) => {
    let id = _.get(obj, 'songs[0].id');
    return {
      type: svc.typeCode,
      id: id,
      singer: _.get(obj, 'songs[0].artists[0].name'),
      song: _.get(obj, 'songs[0].name'),
      cover: _.get(obj, 'songs[0].album.picUrl'),
      url: _.get(obj, 'songs[0].mp3Url'),
      lrc: 'http://music.163.com/api/song/lyric/' + id,
      album: _.get(obj, 'songs[0].album.name'),
    };
  },
  getToken: () => {
    let url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=9320260485&g_tk=938407465&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&jsonpCallback=jsonCallback&needNewCode=0';

    return request(url).spread(function(res, data) {
      return data.match(/"key":\s*"(\w+)"}/)[1];
    });
  }
};

module.exports = svc;

//
// svc.getLrc('28935298')
//   .then(function(data) {
//     console.log(data);
//   });

