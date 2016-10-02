'use strict';

const {globalShortcut} = require('electron');

function registerGlobalShortcut(opt) {
  const obj = {
    'F6': {
      action: 'playOrPause'
    },
    'Ctrl+Option+Right': {
      action: 'nextSong'
    },
    'Ctrl+Option+Left': {
      action: 'preSong'
    },
    'Command+Option+Shift+H': () => {
      if(opt.mainWindow.isFocused()) {
        opt.mainWindow.hide();
      }
      else {
        opt.mainWindow.show();
        opt.mainWindow.focus();
      }
    },
  };

  Object.keys(obj).forEach((key) => {
    var value = obj[key];

    let ret = globalShortcut.register(key, () => {
      console.log(`${key} is pressed`);

      if(typeof value === 'function') {
        return value();
      }

      opt.mainWindow.webContents.send('globalShortcut', value);
    });

    if(!ret) {
      console.log(`${key} registration failed`);
    }
  });
}


module.exports = {
  create: registerGlobalShortcut
};