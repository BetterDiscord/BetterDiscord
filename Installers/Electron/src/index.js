'use strict';

var devMode = false;

const
	electron = require('electron'),
	app = electron.app,
	BrowserWindow = electron.BrowserWindow,
	ipcMain = electron.ipcMain,
	utils = require('./utils'),
	_utils = new utils();

var 
	mainWindow,
	windowOptions = {
		width: 300,
		height: 100,
		fullscreenable: false,
		maximizable: false,
		frame: false,
		resizable: devMode ? true : false,
		alwaysOnTop: devMode ? true : false,
		transparent: false
	};


class Index {

	constructor() {
		app.on("ready", () => this.appReady());
	}

	appReady() {
		mainWindow = new BrowserWindow(windowOptions);
		this.loadInstaller();
	}

	loadInstaller() {
		this.installer = require('./installer_index');
		this.installerInstance = new this.installer(app, mainWindow, ipcMain, _utils);
	}

}

module.exports = new Index();