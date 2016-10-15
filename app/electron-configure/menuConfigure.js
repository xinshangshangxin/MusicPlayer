'use strict';

const {app, Menu} = require('electron');

const svc = {
  reload: function(mainWindow, serverUrl) {
    return function() {
      mainWindow.loadURL(serverUrl);
    };
  },
  getTemplate: function(platform, mainWindow, reloadServerUrl) {
    let reload = svc.reload(mainWindow, reloadServerUrl);

    let darwinTemplate = [{
      label: 'Music Player',
      submenu: [{
        label: 'About Music Player',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide Music Player',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unHideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.exit(0);
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: [{
        label: 'Reload This Window',
        accelerator: 'Command+R',
        click: reload,
      }, {
        label: 'Toggle DevTools',
        accelerator: 'Alt+Command+I',
        click: () => {
          mainWindow.toggleDevTools();
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }]
    }];

    let linuxTemplate = [{
      label: 'Toggle DevTools',
      accelerator: 'Ctrl+Shift+I',
      click: () => {
        mainWindow.toggleDevTools();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Quit The App',
      accelerator: 'Ctrl+Q',
      click: () => {
        app.exit(0);
      }
    }];

    if(platform === 'darwin') {
      return darwinTemplate;
    }
    else {
      return linuxTemplate;
    }
  },
  create: function(opt) {
    let menuTemplate = Menu.buildFromTemplate(svc.getTemplate(process.platform, opt.mainWindow, opt.openServerUrl));

    Menu.setApplicationMenu(menuTemplate);
  }
};


module.exports = svc;


