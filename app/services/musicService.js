'use strict';

const xiamiService = require('./xiamiService');
const QQService = require('./QQService');
const neteaseService = require('./neteaseService');
const utilitiesService = require('./utilitiesService');

var svc = {
  typeCodes: utilitiesService.typeCodes,
  search: function(key) {
    var arr = [];
    return Promise
      .all([
        xiamiService.search(key).reflect(),
        QQService.search(key).reflect(),
        neteaseService.search(key).reflect(),
      ])
      .map(function(data, index) {
        if(data.isFulfilled()) {
          return data.value();
        }

        console.log(`${index} 搜索失败!!`);

        return [];
      })
      .then(function(data) {
        for(var i = 0; i < data[0].length || i < data[1].length || i < data[2].length; i++) {
          if(data[0][i]) {
            arr.push(data[0][i]);
          }
          if(data[1][i]) {
            arr.push(data[1][i]);
          }
          if(data[2][i]) {
            arr.push(data[2][i]);
          }
        }

        return arr;
      });
  },
  parse: function(id, typeCode) {
    console.log('start parse: ', id, typeCode);
    typeCode = parseInt(typeCode);
    return Promise.resolve()
      .then(()=> {
        if(typeCode === svc.typeCodes.xiami) {
          return xiamiService.parse(id);
        }

        if(typeCode === svc.typeCodes.qq) {
          return Promise.reject('qq not support');
        }

        if(typeCode === svc.typeCodes.netease) {
          return neteaseService.parse(id);
        }
        return Promise.reject(new Error('not match typeCodes: ' + typeCode));
      })
      .then(function(song) {
        // 设置更新时间
        song.updatedAt = new Date();
        song.name = song.name || (song.song + '-' + song.singer);
        console.log('parse song: ', song);
        return song;
      });
  },
  getNeteaseLrc: function(id) {
    return neteaseService.getLrc(id);
  },
  getQQMusicLrc: function(id) {
    return QQService.getLrc(id);
  },
  getLatestSongInfo: function(song = {}, isForce = false) {
    let {id, type, updatedAt} = song;
    // 非强制更新并且上次更新时间为1分钟之内
    if(!isForce && updatedAt && (new Date().getTime() - new Date(updatedAt).getTime() < 60 * 1000)) {
      return song;
    }

    if(!id || !type) {
      return Promise.reject(new Error('参数不正确'));
    }

    return svc.parse(id, type)
      .catch((e)=> {
        // 解析失败, 使用旧数据
        console.log(`解析失败, 使用旧数据`, e);
        return song;
      });
  },
};

module.exports = svc;