'use strict';

const request = Promise.promisify(require('request'), {
  multiArgs: true
});

const utilitiesService = require('./utilitiesService');

const crypto = require('crypto');
const bigInt = require('big-integer');

const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
const nonce = '0CoJUm6Qyw8W8jud';
const pubKey = '010001';

function createSecretKey(size) {
  const keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < size; i++) {
    let pos = Math.random() * keys.length;
    pos = Math.floor(pos);
    key = key + keys.charAt(pos);
  }
  return key;
}

function aesEncrypt(text, secKey) {
  const _text = text;
  const lv = new Buffer('0102030405060708', 'binary');
  const _secKey = new Buffer(secKey, 'binary');
  const cipher = crypto.createCipheriv('AES-128-CBC', _secKey, lv);
  let encrypted = cipher.update(_text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function zfill(str, size) {
  while (str.length < size) {
    str = '0' + str;
  }
  return str;
}

function rsaEncrypt(text, pubKey, modulus) {
  const _text = text.split('').reverse().join('');
  const biText = bigInt(new Buffer(_text).toString('hex'), 16),
    biEx = bigInt(pubKey, 16),
    biMod = bigInt(modulus, 16),
    biRet = biText.modPow(biEx, biMod);
  return zfill(biRet.toString(16), 256);
}

function Encrypt(obj) {
  const text = JSON.stringify(obj);
  const secKey = createSecretKey(16);
  const encText = aesEncrypt(aesEncrypt(text, nonce), secKey);
  const encSecKey = rsaEncrypt(secKey, pubKey, modulus);
  return {
    params: encText,
    encSecKey: encSecKey
  };
}

var svc = {
  typeCode: utilitiesService.typeCodes.netease,
  search: function (key) {
    let pageNu = 1;
    let perPage = 10;

    let url = `http://music.163.com/api/search/get/web`;

    return request(
      {
        url: url,
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'X-Real-IP': '211.161.244.70',
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
        if (!arr || !arr.length) {
          return [];
        }

        return _.chain(arr)
          .map(function (obj) {
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
  getLrc: function (id) {
    return request(
      {
        url: 'http://music.163.com/api/song/lyric/',
        method: 'POST',
        headers: {
          'X-Real-IP': '211.161.244.70',
          'Connection': 'keep-alive',
          'Host': 'music.163.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'
        },
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
  parse: function (id) {
    return svc.getDetail(id);
  },
  getDetail: (id) => {
    var formData = Encrypt({
      ids: [id],
      br: 128000,
      csrf_token: ''
    });

    var options = {
      method: 'POST',
      url: 'http://music.163.com/weapi/song/enhance/player/url',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36',
        host: 'music.163.com',
        referer: 'http://music.163.com'
      },
      form: formData
    };

    return request(options)
      .spread((response, data) => {
        return JSON.parse(data);
      })
      .then(function (json) {
        return svc.mapDetailKey(json);
      });
  },
  mapDetailKey: (obj) => {
    let id = _.get(obj, 'data[0].id');
    return {
      type: svc.typeCode,
      id: id,
      url: _.get(obj, 'data[0].url'),
    };
  },
  getToken: () => {
    let url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=9320260485&g_tk=938407465&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&jsonpCallback=jsonCallback&needNewCode=0';

    return request(url).spread(function (res, data) {
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

