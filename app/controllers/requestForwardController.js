'use strict';

const request = Promise.promisify(require('request'), {
  multiArgs: true
});

const utilitiesService = require('../services/utilitiesService');
const musicService = require('../services/musicService');

var ctrl = {
  forward: function(req, res) {
    let url = req.query.url;
    let type = parseInt(req.query.type);
    let id = req.query.id;

    if(url === 'NONE') {
      console.log(`type|id ${type}|${id}have no lrc`);
    }

    if(type === utilitiesService.typeCodes.netease) {
      return musicService
        .getNeteaseLrc(id)
        .then(function(data) {
          return res.json({
            data: data
          });
        })
        .catch((e) => {
          res.wrapError(e);
        });
    }
    else if(type === utilitiesService.typeCodes.qq) {
      return musicService
        .getQQMusicLrc(id)
        .then(function(data) {
          return res.json({
            data: data
          });
        })
        .catch((e) => {
          res.wrapError(e);
        });
    }

    if(req.method === 'GET') {
      request({
        url: url,
        method: 'GET',
        qs: req.query
      })
        .spread(function(request, data) {
          return res.json({
            data: data
          });
        })
        .catch(function(e) {
          return res.wrapError(e);
        });
    }
    else {
      return res.wrapError(new ApplicationError(400, '未支持'));
    }
  }
};


module.exports = ctrl;