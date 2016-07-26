'use strict';

const fs = Promise.promisifyAll(require('fs-extra'));
const ms = require('mediaserver');
const through2 = require('through2');
const request = require('request');

const musicService = require('../services/musicService');
const songSaveService = require('../services/songSaveService');

var ctrl = {
  search: function(req, res) {
    var key = req.params.key;
    return musicService
      .search(key)
      .then(function(data) {
        return res.json(data);
      })
      .catch(function(e) {
        res.wrapError(e);
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
        res.wrapError(e);
      });
  },
  play: function(req, res) {
    let {url, id, type} = req.query;

    let cachePath = songSaveService.getSongCachePath(id, type);
    let downloadPath = songSaveService.getSongDownloadPath(id, type);

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
        return fs.removeAsync(downloadPath)
          .then(function() {
            return false;
          })
          .catch((e) => {
            console.log(e);
            return false;
          });
      })
      .then((data)=> {
        if(data) {
          return null;
        }
        console.log('cachePath: ', cachePath);
        return fs
          .removeAsync(cachePath)
          .reflect()
          .then(function() {
            return musicService.parse(id, type);
          })
          .then(function(obj) {
            url = obj.url || url;
            console.log(`边下边播: ${cachePath}`);
            var writeStream = null;

            request(url)
              .on('error', function(err) {
                console.log(`request url: ${url} error: ${err}`);
              })
              .on('response', (response) => {
                console.log('content-length: ', response.headers['content-length']);
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
                      console.warn('rename file error: ', e);
                    });
                });

                // 设置头
                res.writeHead(200, response.headers);
              })
              .pipe(through2(function(chunk, enc, callback) {
                //边下边播
                writeStream.write(chunk, () => {
                  this.push(chunk);
                  callback();
                });
              }))
              .on('end', ()=> {
                // 结束文件写入
                if(writeStream) {
                  writeStream.end();
                }
              })
              .pipe(res);
          });
      })
      .catch((e) => {
        return res.wrapError(e);
      });
  }
};


module.exports = ctrl;