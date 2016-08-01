'use strict';

const fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var svc = {
  userDataPath: '',
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

        console.log('未找到electron, 使用程序相对路径');
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
      });
  },
  getSongCachePath: function(name, id, type, preDir = './', suffix = '.tmp') {
    return path.resolve(svc.userDataPath, 'temp/', preDir, `${name}_${id}_${type}${suffix}`);
  },
  getSongDownloadPath: function(name, id, type, preDir = './', suffix = '.mp3') {
    return path.resolve(svc.userDataPath, 'download/', preDir, `${name}_${id}_${type}${suffix}`);
  }

};

module.exports = svc;