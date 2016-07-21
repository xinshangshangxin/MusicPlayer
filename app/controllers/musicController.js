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
        return false;
      })
      .then((data)=> {
        if(data) {
          return null;
        }

        return musicService.parse(id, type)
          .then(function(obj){
            url = obj.url || url;
            console.log(`边下边播: ${cachePath}`);
            var writeStream = fs.createWriteStream(cachePath);

            writeStream.on('finish', ()=> {
              fs.moveAsync(cachePath, downloadPath)
                .then(()=> {
                  console.log(`下载完成: ${downloadPath}`);
                });
            });

            request(url)
              .on('response', (response) => {
                res.writeHead(200, response.headers);
              })
              .pipe(through2(function(chunk, enc, callback) {
                writeStream.write(chunk, () => {
                  this.push(chunk);
                  callback();
                });
              }))
              .on('end', ()=> {
                writeStream.end();
              })
              .pipe(res);
          });
      });
  }
};


module.exports = ctrl;