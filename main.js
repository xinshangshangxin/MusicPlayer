const path = require('path');
const {app, BrowserWindow, protocol} = require('electron');

let localServerUrl = 'http://localhost:9999';
let mainWindow;

function createWindow() {
  protocol.registerHttpProtocol('server-url', function(request, callback) {
    let url = request.url.replace('server-url://hostname.com', '');
    if(!/^\//.test(url)) {
      url = '/' + url;
    }
    request.url = localServerUrl + url;
    console.info('request: ', JSON.stringify(request, null, 2));
    callback(request);
  }, function(e) {
    if(e) {
      console.error('Failed to register protocol: ', e);
    }
  });


  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  });

  mainWindow.on('closed', function() {
    mainWindow = null
  });

  mainWindow.webContents.openDevTools();

  require('./app/app')
    .then(function() {
      // mainWindow.loadURL('server-url://hostname.com/');
      mainWindow.loadURL('https://xinshangshangxin.com');
      setTimeout(function(){
        mainWindow.loadURL(localServerUrl);
      }, 10000);
    });

}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if(process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function() {
  if(mainWindow === null) {
    createWindow();
  }
});