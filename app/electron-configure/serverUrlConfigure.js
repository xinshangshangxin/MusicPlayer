'use strict';

const {protocol} = require('electron');

const openServerUrl = 'shang://server.musicplayer.com';
let localServerUrl = 'http://localhost:12345';

// be called before app is ready
protocol.registerStandardSchemes(['shang']);


module.exports = {
  registerUserProtocol: function(opt) {
    opt.openServerUrl = openServerUrl;
    opt.localServerUrl = localServerUrl;

    protocol.registerHttpProtocol('shang', function(request, callback) {
      let url = request.url.replace(openServerUrl, '');
      if(!/^\//.test(url)) {
        url = '/' + url;
      }
      request.url = localServerUrl + url;
      callback(request);
    }, function(e) {
      if(e) {
        console.error('Failed to register protocol: ', e);
      }
    });
  }
};
