'use strict';

const {protocol} = require('electron');

const portProbe = require('./portProbe');
const openServerUrl = 'shang://server.musicplayer.com';

// be called before app is ready
protocol.registerStandardSchemes(['shang']);


const svc = {
  getLocalServerPort(startPort, endPort, done) {
    portProbe(startPort, (err, port)=> {
      if(!err) {
        console.log('get port success: ', port);
        return done(undefined, startPort);
      }

      console.warn('err: ', err);
      if(startPort >= endPort) {
        return done(new Error('no port found'));
      }

      return svc.getLocalServerPort(startPort + 1, endPort, done);
    });

  },
  registerUserProtocol: (opt, port)=> {
    opt.openServerUrl = openServerUrl;
    opt.localServerUrl = 'http://localhost:' + port;
    opt.PORT = port;

    protocol.registerHttpProtocol('shang', function(request, callback) {
      let url = request.url.replace(opt.openServerUrl, '');
      if(!/^\//.test(url)) {
        url = '/' + url;
      }
      request.url = opt.localServerUrl + url;
      callback(request);
    }, function(e) {
      if(e) {
        console.error('Failed to register protocol: ', e);
      }
    });
  },
  create: (opt, done)=> {
    svc.getLocalServerPort(12345, 12349, function(err, port) {
      if(err) {
        return done(err);
      }

      svc.registerUserProtocol(opt, port);
      return done();
    });
  }
};


module.exports = svc;