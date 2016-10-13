'use strict';

const {BrowserWindow} = require('electron');
const nodeNotifier = require('node-notifier');

function serverError(e) {
  nodeNotifier.notify({
    'title': 'Music Player',
    'message': e && e.toString()
  });
}

module.exports = {
  create: function(opt) {
    var options = {
      width: 837,
      height: 626,
    };

    if(process.platform === 'darwin') {
      options.titleBarStyle = 'hidden-inset';
    }
    else {
      options.transparent= true;
      options.frame = false;
    }

    opt.mainWindow = new BrowserWindow(options);
  },
  registerListeners: function(opt) {
    opt.mainWindow.on('close', (e) => {
      if(opt.willQuitApp) {
        opt.mainWindow = null;
      } else {
        e.preventDefault();
        opt.mainWindow.hide();
      }
    });
  },
  startServer: function(opt) {
    process.env.PORT = opt.PORT;
    // 启动后端服务
    require('../app')
      .then(function() {
        opt.mainWindow.loadURL(opt.openServerUrl);
      })
      .catch(function(e) {
        console.log(e);
        serverError(e);
      });
  }
};