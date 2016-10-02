'use strict';

const {app} = require('electron');

const appConfigure = require('./electron-configure/appConfigure');
const globalShortcutConfigure = require('./electron-configure/globalShortcutConfigure');
const mainWindowConfigure = require('./electron-configure/mainWindowConfigure');
const menuConfigure = require('./electron-configure/menuConfigure');
const serverUrlConfigure = require('./electron-configure/serverUrlConfigure');
const trayConfigure = require('./electron-configure/trayConfigure');

let opt = {
  mainWindow: null,
  willQuitApp: false,
};

// 注册应用事件监听
appConfigure.registerListeners(opt);
// 创建界面
app.on('ready', createWindow);

function createWindow() {
  // 注册自定义协议, 防止端口占用情况下localStorage无法使用
  serverUrlConfigure.registerUserProtocol(opt);
  // 创建界面
  mainWindowConfigure.create(opt);
  mainWindowConfigure.registerListeners(opt);
  mainWindowConfigure.startServer(opt);

  // 设置菜单
  menuConfigure.create(opt);
  // 托盘图标
  trayConfigure.create(opt);
  // 全局键盘快捷键
  globalShortcutConfigure.create(opt);
}