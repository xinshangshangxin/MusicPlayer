'use strict';

const parseString = Promise.promisify(require('xml2js').parseString);
const request = Promise.promisify(require('request'), {
  multiArgs: true
});

const utilitiesService = require('./utilitiesService');

var svc = {
  typeCode: utilitiesService.typeCodes.xiami,
  search: function(key) {
    return request(
      {
        url: `http://www.xiami.com/web/search-songs?key=` + encodeURI(key),
        json: true
      })
      .spread(function(res, arr) {
        if(!_.isArray(arr)) {
          return Promise.reject('获取搜索信息失败, 查看是否使用了国外IP');
        }
        return arr.map(function(obj) {
          return svc.mapSearchKey(obj);
        });
      });
  },
  mapSearchKey: function(obj) {
    return {
      type: svc.typeCode,
      singer: obj.author,
      song: obj.title,
      id: obj.id,
      cover: obj.cover,
      url: obj.src
    };
  },
  parse: function(url) {
    var sid;
    if(/www.xiami.com\/song\/\d+/.test(url)) {
      sid = /(\d+)/.exec(url)[1];
    }
    else if(/^\d+$/.test(url)) {
      sid = url;
    }

    if(!sid) {
      return Promise.reject('解析虾米sid错误');
    }

    return svc.getDetail(sid);
  },
  getDetail: function(sid) {
    return request(`http://www.xiami.com/song/playlist/id/${sid}/object_name/default/object_id/0`)
      .spread(function(res, body) {
        return parseString(body, {explicitArray: false});
      })
      .then(function(obj) {
        var result = {
          type: svc.typeCode,
          id: _.get(obj, 'playlist.trackList.track.songId'),
          singer: _.get(obj, 'playlist.trackList.track.artist'),
          song: _.get(obj, 'playlist.trackList.track.songName'),
          cover: _.get(obj, 'playlist.trackList.track.pic'),
          lrc: _.get(obj, 'playlist.trackList.track.lyric'),
          url: '',
          album: _.get(obj, 'playlist.trackList.track.album_name'),
          title: _.get(obj, 'playlist.trackList.track.title'),
          location: _.get(obj, 'playlist.trackList.track.location'),
        };

        var coverReg = /http:\/\/[a-zA-Z0-9-.-\/-_]+.(jpg|jpeg|png|gif|bmp)/g;
        if(coverReg.test(result.cover)) {
          result.bigCover = result.cover.replace('_1', '');
        }

        result.url = svc.urlDecode(result.location || '');
        return result;
      });
  },
  urlDecode: function(str) {
    try {
      let a1 = parseInt(str.charAt(0)),
        a2 = str.substring(1),
        a3 = Math.floor(a2.length / a1),
        a4 = a2.length % a1,
        a5 = [],
        a6 = 0,
        a7 = '',
        a8 = '';
      for(; a6 < a4; ++a6) {
        a5[a6] = a2.substr((a3 + 1) * a6, (a3 + 1));
      }
      for(; a6 < a1; ++a6) {
        a5[a6] = a2.substr(a3 * (a6 - a4) + (a3 + 1) * a4, a3);
      }
      for(let i = 0, a5_0_length = a5[0].length; i < a5_0_length; ++i) {
        for(let j = 0, a5_length = a5.length; j < a5_length; ++j) {
          a7 += a5[j].charAt(i);
        }
      }
      a7 = decodeURIComponent(a7);
      for(let i = 0, a7_length = a7.length; i < a7_length; ++i) {
        a8 += a7.charAt(i) === '^' ? '0' : a7.charAt(i);
      }
      return a8;
    } catch(e) {
      return false;
    }
  }
};


module.exports = svc;
