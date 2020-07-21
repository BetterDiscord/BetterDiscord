const path = require('path');
const fs = require('fs');
const electron = require('electron');
electron.contextBridge.exposeInMainWorld = (key, val) => {window[key] = val;};

const Module =  require('module').Module;
Module.globalPaths.push(path.resolve(electron.remote.app.getAppPath(), 'node_modules'));

const currentWindow = electron.remote.getCurrentWindow();
if (currentWindow.__preload) require(currentWindow.__preload);

