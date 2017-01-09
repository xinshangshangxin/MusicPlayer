'use strict';

const path = require('path');
const {Menu, nativeImage, Tray} = require('electron');

const {getTemplate} = require('./menuConfigure');
const imagePath = path.join(__dirname, '../public/images/status_bar.png');

const svc = {
  toggleWindow: function(mainWindow) {
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
  },
  create: function(opt) {
    let image = nativeImage.createFromPath(imagePath);
    image.setTemplateImage(true);
    opt.tray = new Tray(image);

    let contextMenu = Menu.buildFromTemplate(getTemplate(process.platform, opt.mainWindow, opt.openServerUrl));

    opt.tray.on('right-click', () => opt.tray.popUpContextMenu(contextMenu));
    opt.tray.on('click', () => this.toggleWindow(opt.mainWindow));
  },
};


module.exports = svc;





