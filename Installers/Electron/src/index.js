'use strict';

const utils = require('./utils');
const _utils = new utils.utils();

const electron = require('electron');
const fs = require('fs');
const path = require('path');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

var mainWindow = null;

var lastKnownVersion = "0.0.291";
var platform = process.platform;

var installPath = getInstallPath();
var dataPath = `${__dirname}/data/`;

var vi = require(`${dataPath}vi.json`);

function getInstallPath() {
	switch(platform) {
		case "win32":
			var hver = "0.0.0";
			var path = `${process.env.LOCALAPPDATA}/Discord/app-${lastKnownVersion}/`;
			fs.readdirSync(`${process.env.LOCALAPPDATA}/Discord/`).filter(function(file) {
				var tpath = `${process.env.LOCALAPPDATA}/Discord/${file}`;
				if(fs.statSync(tpath).isDirectory()) return;

				if(!file.startsWith("app-")) return;
				var ver = file.replace("app-", "");
				if(ver < hver) return;
				hver = ver;
			});
			return path;
		break;
		case "darwin":
		return "/Applications/Discord.app";
		break;
		default:
		return "";
		break;
	}
}

function loadContent(file, width, height, center) {
	if(mainWindow == null) {
		createMainWindow(file, width, height);
		return;
	}

	mainWindow.setSize(width, height);
	if(center) mainWindow.center();

	mainWindow.loadURL(`${dataPath}${file}.html`);
}

function createMainWindow(file, width, height) {
	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		fullscreenable: false,
		maximizable: false,
		frame: false,
		resizable: true,
		alwaysOnTop: true,
		transparent: true
	});

	mainWindow.loadURL(`${dataPath}${file}.html`);
}

function update() {
	var promises = [
		new Promise((resolve, reject) => {
			downloadResource("default", "/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/index.html", (error, data) => {
				if(error) {
					error(data);
					reject();
					return;
				}
				_utils.log("Succesfully loaded index.html");
				resolve();
			});
		}),
		new Promise((resolve, reject) => {
			downloadResource("default", "/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/js/main.js", (error, data) => {
				if(error) {
					error(data);
					reject();
					return;
				}
				_utils.log("Succesfully loaded main.js");
				resolve();
			});
		}),
		new Promise((resolve, reject) => {
			downloadResource("default", "/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/css/main.css", (error, data) => {
				if(error) {
					error(data);
					reject();
					return;
				}
				_utils.log("Succesfully loaded main.css");
				resolve();
			});
		})
	];

	return Promise.all(promises);
}

function checkForUpdates(okCb, errorCb) {
	_utils.downloadResource("default", "/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/vi.json", (error, data) => {
		if(error) {
			errorCb(data);
			return;
		}

		try {
			data = JSON.parse(data);
		}catch(err) {
			errorCb(err);
			return;
		}

		switch(platform) {
			case "win32":
				okCb(data.windows.version < vi.windows.version);
			break;
			case "darwin":
				okCb(data.osx.version < vi.osx.version);
			break;
		}
	});
}

ipcMain.on('async', (event, arg) => {
	var obj = JSON.parse(arg);

	switch(obj.arg) {
		case "update":
			checkForUpdates((update) => {
				if(update) {
					event.sender.send('async-reply', "update");
					update().then(() => {
						_utils.log("Update OK!");
						loadContent("index", 800, 400, true);
					}, () => {
						error("Update Failed!");
					});
				} else {
					loadContent("index", 800, 400, true);
				}
			}, (err) => {
				error(err);
			});
		break;
	}
});

function error(error) {
	_utils.log(error);
	loadContent("error");
}

app.on('ready', function() {
	//loadContent("https://raw.githubusercontent.com/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/index.html", 800, 400 ,true);
	//loadContent("splash", 300, 100, true);
});