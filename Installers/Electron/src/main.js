'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let mainWindow

const {dialog} = require('electron');

var installPath = process.platform == "win32"  ? process.env.LOCALAPPDATA + "\\Discord\\app-0.0.290\\" : 
				  process.platform == "darwin" ? "\\Applications\\Discord.app\\" : "";
function createWindow() {
	var width = 800;
	var height = 400;
	
	mainWindow = new BrowserWindow({
		width: width, 
		height: height, 
		maxWidth: width, 
		maxHeight: height, 
		minWidth: width, 
		minHeight: height, 
		fullscreenable: false,
		maximizable: false,
		frame: false
	});

	mainWindow.loadURL('file://' + __dirname + '/data/index.html');
}

ipcMain.on('sync', function(event, arg) {
	switch(arg) {
		case "openDirectory":
			var p = dialog.showOpenDialog({properties: ['openDirectory'], defaultPath: installPath });
			if(p != undefined) {
				installPath = p[0];
				event.returnValue = installPath;
			} else {
				event.returnValue = null;
			}
		break;
		case "getInstallPath":
			event.returnValue = installPath;
		break;
	}
});




app.on('ready', createWindow);