'use strict';

class Updater {

	constructor(utils) {
		this.utils = utils;
	}

	update() {
		var self = this;
		var promises = [
			new Promise((resolve, reject) => {
				downloadResource("/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/index.html", (error, data)
					if(error) {
						error(data, true);
						reject();
						return;
					}
					self.utils.log("Succesfully loaded index.html");
					resolve();
				});
			}),
			new Promise((resolve, reject) => {
				downloadResource("/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/js/main.js", (error, data)
					if(error) {
						error(data, true);
						reject();
						return;
					}
					self.utils.log("Succesfully loaded main.js");
					resolve();
				});
			}),
			new Promise((resolve, reject) => {
				downloadResource("/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/css/main.css", (error, dat
					if(error) {
						error(data, true);
						reject();
						return;
					}
					self.utils.log("Succesfully loaded main.css");
					resolve();
				});
			})
		];
		return Promise.all(promises);
	}

	checkForUpdates(okCb, errorCb) {
		_utils.downloadResource("/Jiiks/BetterDiscordApp/master/Installers/Electron/src/data/vi.json", (error, data) => {
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
					okCb(data.windows.version > vi.windows.version);
				break;
				case "darwin":
					okCb(data.osx.version > vi.osx.version);
				break;
			}
		});
	}
}

module.exports = Updater;