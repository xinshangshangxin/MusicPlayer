'use strict';

/**
 * 11001: 搜索歌曲失败
 * 11002: 获取歌曲详情失败
 * 11003: 播放歌曲失败
 * 11004: 获取歌词失败
 */

const fs = Promise.promisifyAll(require('fs-extra'));
const ms = require('mediaserver');
const through2 = require('through2');
const request = require('request');
const rp = Promise.promisify(require('request'), {
  multiArgs: true
});

const musicService = require('../services/musicService');
const songSaveService = require('../services/songSaveService');
const utilitiesService = require('../services/utilitiesService');

var ctrl = {
  search: function(req, res) {
    var key = req.params.key;
    return musicService
      .search(key)
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11001, '搜索歌曲失败'));
      });
  },
  detail: function(req, res) {
    var id = req.params.id;
    var type = req.query.type;

    return musicService
      .parse(id, type)
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e, new ApplicationError(11002, '获取歌曲详情失败'));
      });
  },
  tryRemoveFile: function(filePath) {
    return fs.removeAsync(filePath)
      .catch((e) => {
        console.log(`remove file: ${filePath} error: `, e);
      });
  },
  downloadAndPipe: function({cachePath, downloadPath, song, res}) {
    return ctrl.tryRemoveFile(cachePath)
      .then(function() {
        console.log('start getLatestSongInfo');
        return musicService.getLatestSongInfo(song);
      })
      .then(function(obj) {
        let {url} = obj;
        console.log(`边下边播: ${cachePath}`);
        let writeStream = null;

        request(url)
          .on('error', function(err) {
            console.log(`request url: ${url} error: ${err}`);
            if(res.headersSent) {
              return;
            }
            return res.sendStatus(400);
          })
          .on('response', (response) => {
            console.log('content-length: ', response.headers['content-length']);
            // 获取歌曲错误
            if(response.statusCode >= 300) {
              return res.writeHead(400, response.headers);
            }
            // 设置缓存文件
            if(writeStream) {
              return;
            }
            writeStream = fs.createWriteStream(cachePath);
            // 缓存文件重命名成正常文件
            writeStream.on('finish', ()=> {
              fs.moveAsync(cachePath, downloadPath)
                .then(()=> {
                  console.log(`下载完成: ${downloadPath}`);
                })
                .catch(function(e) {
                  console.warn(`rename ${downloadPath} error: `, e);
                });
            });

            // 设置头
            res.writeHead(200, response.headers);
          })
          .pipe(through2(function(chunk, enc, done) {
            //边下边播
            writeStream.write(chunk, () => {
              this.push(chunk);
              done();
            });
          }))
          .on('end', ()=> {
            // 结束文件写入
            if(writeStream) {
              writeStream.end();
            }
          })
          .pipe(res);

        return null;
      });
  },
  play: function(req, res) {
    let song = ctrl.getBaseSongInfo(req);
    let {name, id, type} = song;
    let cachePath = songSaveService.getSongCachePath(name, id, type);
    let downloadPath = songSaveService.getSongDownloadPath(name, id, type);

    fs.statAsync(downloadPath)
      .then((stats) => {
        if(stats.isFile()) {
          console.log(`use local song, path: ${downloadPath}`);
          ms.pipe(req, res, downloadPath);
          return true;
        }

        return false;
      })
      .catch(()=> {
        return ctrl.tryRemoveFile(downloadPath)
          .then(()=> {
            return false;
          });
      })
      .then((data)=> {
        if(data) {
          return null;
        }
        console.log('cachePath: ', cachePath);
        return ctrl.downloadAndPipe({cachePath, downloadPath, song, res});
      })
      .catch((e) => {
        return res.wrapError(e, new ApplicationError(11003, '播放歌曲失败'));
      });
  },
  downloadLyric: function(song, lyricFilePath, isForce) {
    console.log('-----downloadLyric-----');
    return ctrl.tryRemoveFile(lyricFilePath)
      .then(()=> {
        return musicService.getLatestSongInfo(song, isForce);
      })
      .then(({lrc: url, type, id} = song) => {

        if(url === 'NONE') {
          console.log(`type|id ${type}|${id}have no lrc`);
          return Promise.reject('no lrc');
        }

        if(type === utilitiesService.typeCodes.netease) {
          return musicService.getNeteaseLrc(id);
        }
        else if(type === utilitiesService.typeCodes.qq) {
          return musicService.getQQMusicLrc(id);
        }

        if(!url) {
          return Promise.reject(`no url to download lrc for ${song.name} ${id}`);
        }

        return rp(
          {
            url: url,
            method: 'GET'
          })
          .spread(function(response, data) {
            return data;
          });
      })
      .then(function(lyricStr) {
        return fs.writeFileAsync(lyricFilePath, lyricStr)
          .then(()=> {
            return lyricStr;
          });
      });
  },
  lyric: function(req, res) {
    let song = ctrl.getBaseSongInfo(req);
    let {id, name, type} = song;
    let {isForce} = req.query;

    let lyricFilePath = songSaveService.getSongDownloadPath(name, id, type, './lyric', '.lrc');

    console.log('lyricFilePath: ', lyricFilePath);

    return fs.statAsync(lyricFilePath)
      .reflect()
      .then((result) => {
        if(result.isFulfilled()) {
          let stats = result.value();
          if(stats.isFile() && !isForce) {
            return fs.readFileAsync(lyricFilePath, {
              encoding: 'utf8'
            });
          }
        }
        // 非强制更新, 并且存在文件
        return ctrl.downloadLyric(song, lyricFilePath, isForce);
      })
      .then((data)=> {
        return res.json({
          data: data
        });
      })
      .catch((e) => {
        return res.wrapError(e, new ApplicationError(11004, '获取歌词失败'));
      });
  },
  getBaseSongInfo: function(req) {
    let obj = {};
    if(req.method === 'GET') {
      obj = req.query;
    }
    else {
      obj = req.body;
    }

    return {
      id: obj.id,
      song: obj.song,
      singer: obj.singer,
      name: obj.name || (obj.song + '-' + obj.singer),
      type: parseInt(obj.type),
      url: obj.url,
      lrc: obj.lrc,
      updatedAt: obj.updatedAt,
    };
  }
};


module.exports = ctrl;