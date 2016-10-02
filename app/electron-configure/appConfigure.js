'use strict';


const {app} = require('electron');

module.exports = {
  registerListeners(opt) {
    app.on('window-all-closed', function() {
      if(process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      opt.mainWindow && opt.mainWindow.show();
    });
    app.on('before-quit', () => {
      opt.willQuitApp = true;
    });
    app.on('will-quit', ()=> {
      opt.globalShortcut && opt.globalShortcut.unregisterAll();
    });
  },
};