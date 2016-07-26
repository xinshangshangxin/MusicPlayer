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
    typeCode = parseInt(typeCode);
    if(typeCode === svc.typeCodes.xiami) {
      return xiamiService.parse(id);
    }

    if(typeCode === svc.typeCodes.qq) {
      return Promise.resolve({});
    }

    if(typeCode === svc.typeCodes.netease) {
      return neteaseService.parse(id);
    }


    return Promise.reject(new Error('not match typeCodes: ' + typeCode));
  },
  getNeteaseLrc: function(id) {
    return neteaseService.getLrc(id);
  },
  getQQMusicLrc: function(id) {
    return QQService.getLrc(id);
  }
};

module.exports = svc;