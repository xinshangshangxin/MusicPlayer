'use strict';

const {BrowserWindow} = require('electron');
const nodeNotifier = require('node-notifier');

function serverError(e) {
  nodeNotifier.notify({
    'title': 'Music Player',
    'message': JSON.stringify(e)
  });
}

module.exports = {
  create: function(opt) {
    opt.mainWindow = new BrowserWindow({
      width: 837,
      height: 626,
      titleBarStyle: 'hidden-inset',
    });
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