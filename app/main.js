'use strict';

const path = require('path');
const {app, BrowserWindow, globalShortcut, Menu, nativeImage, protocol, Tray} = require('electron');

let localServerUrl = 'http://localhost:12345';
let openServerUrl = 'shang://server.musicplayer.com';
let mainWindow, willQuitApp, tray;

protocol.registerStandardSchemes(['shang']);

function createWindow() {
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


  /** start 设置menu **/
  let menuFromTemplate = Menu.buildFromTemplate(getTemplate(process.platform));
  Menu.setApplicationMenu(menuFromTemplate);
  /** end 设置menu **/

  /**start 创建界面**/
  mainWindow = new BrowserWindow({
    width: 837,
    height: 626,
    // frame: false,
    titleBarStyle: 'hidden-inset',
    // webPreferences: {
    //   nodeIntegration: false
    // }
  });
  /**end 创建界面**/

  /** start 设置tray**/
  let image = nativeImage.createFromPath(path.join(__dirname, './public/images/status_bar.png'));
  image.setTemplateImage(true);

  tray = new Tray(image);

  // let contextMenu = Menu.buildFromTemplate([{
  //   label: 'Show',
  //   click: tollageWindow
  // }, {
  //   label: 'Exit',
  //   click: () => app.exit(0)
  // }]);
  // tray.setContextMenu(contextMenu);
  tray.on('click', toggleWindow);
  /** end 设置tray**/


  mainWindow.on('close', (e) => {
    if(willQuitApp) {
      mainWindow = null;
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  registerGlobalShortcut();

  require('./app')
    .then(function() {
      // mainWindow.loadURL('http://xinshangshangxin.com');
      mainWindow.loadURL(openServerUrl);
      // mainWindow.loadURL(localServerUrl);

      mainWindow.openDevTools();
    })
    .catch(function(e){
      console.log(e);
      serverError(e);
    });

}

function registerGlobalShortcut() {

  var obj = {
    'F6': {
      action: 'playOrPause'
    },
    'Ctrl+Option+Right': {
      action: 'nextSong'
    },
    'Ctrl+Option+Left': {
      action: 'preSong'
    },
    'Command+Option+Shift+H': function() {
      if(mainWindow.isFocused()) {
        mainWindow.hide();
      }
      else {
        mainWindow.show();
        mainWindow.focus();
      }
    },
  };

  Object.keys(obj).forEach(function(key) {
    var value = obj[key];

    let ret = globalShortcut.register(key, function() {
      console.log(`${key} is pressed`);

      if(typeof value === 'function') {
        return value();
      }

      mainWindow.webContents.send('globalShortcut', value);
    });

    if (!ret) {
      console.log(`${key} registration failed`);
    }
  });
}

function serverError(e){
  require('node-notifier').notify({
    'title': 'Music Player',
    'message': JSON.stringify(e)
  });

}

function toggleWindow() {
  if(!mainWindow) {
    return;
  }
  if(mainWindow.isFocused()) {
    mainWindow.hide();
  }
  else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function getTemplate(platform) {
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
      selector: 'unhideAllApplications:'
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

  let linuxTemplate = [
    {
      label: 'Window',
      submenu: [{
        label: 'Reload This Window',
        accelerator: 'Ctrl+R',
        click: () => reload
      }, {
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
      }]
    }];

  if(platform === 'darwin') {
    return darwinTemplate;
  } else {
    return linuxTemplate;
  }
}

function reload() {
  mainWindow.loadURL(openServerUrl);
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => mainWindow.show());
app.on('before-quit', () => willQuitApp = true);
app.on('will-quit', function() {
  globalShortcut.unregisterAll();
});