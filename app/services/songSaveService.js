'use strict';

const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');

var svc = {
  userDataPath: '',
  cacheNu: 0,
  lift: function() {
    try {
      svc.userDataPath = require('electron').app.getPath('userData');
    }
    catch(e) {
      svc.userDataPath = null;
    }

    return Promise.resolve()
      .then(()=> {
        if(svc.userDataPath) {
          return svc.userDataPath;
        }

        logger.info('未找到electron, 使用程序相对路径');
        svc.userDataPath = path.resolve(__dirname, '../../.tmp/');

        return fs.ensureDirAsync(svc.userDataPath)
          .then(()=> {
            return svc.userDataPath;
          });
      })
      .then(()=> {
        return Promise.all([
          fs.ensureDirAsync(path.resolve(svc.userDataPath, 'temp/')),
          fs.ensureDirAsync(path.resolve(svc.userDataPath, 'download/')),
          fs.ensureDirAsync(path.resolve(svc.userDataPath, 'download/lyric')),
        ]);
      })
      .then(()=> {
        logger.info('start remove temp file');
        return fs.remove(path.resolve(svc.userDataPath, 'temp/*'));
      });
  },
  getSongCachePath: function(name, id, type, preDir = './', suffix = '.tmp') {
    svc.cacheNu = svc.cacheNu + 1;
    return path.resolve(svc.userDataPath, 'temp/', preDir, `${svc.cacheNu}_${name}_${id}_${type}${suffix}`);
  },
  getSongDownloadPath: function(name, id, type, preDir = './', suffix = '.mp3') {
    return path.resolve(svc.userDataPath, 'download/', preDir, `${name}_${id}_${type}${suffix}`);
  }

};

module.exports = svc;