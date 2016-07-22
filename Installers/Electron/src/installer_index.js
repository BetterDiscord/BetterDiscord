'use strict';

//Imports
const 
	path = require('path'),
	dialog = require('electron').dialog,
	fs = require("fs"),
	fse = require("fs-extra"),
	request = require('request'),
	unzip = require('unzip'),
	readline = require('readline'),
	asar = require('./asar');

const platform = (process.platform !== "win32" && process.platform !== "darwin") ? "linux" : process.platform;


var 
	config = {
	    urls: {
	        package: "https://github.com/Jiiks/BetterDiscordApp/archive/stable16.zip",
	        finish: "https://betterdiscord.net/installed"
	    },
	    discord: {
	        lastKnownVersion: "0.0.292"
	    },
	    import: "BetterDiscordApp-stable16",
	    cache: [
	        "emotes_bttv.json",
	        "emotes_bttv_2.json",
	        "emotes_ffz.json",
	        "emotes_twitch_global.json",
	        "emotes_twitch_subscriber.json",
	        "user.json"
	    ],
	    paths: {
	    	installPath: "",
	    	libPath: ""
	    }
	};


class Installer {

	constructor(app, mainWindow, ipc, utils) {
		this.app = app;
		this.utils = utils;
		this.initConfig();
		mainWindow.setSize(800, 400);
		mainWindow.center();
		mainWindow.loadURL(`file://${__dirname}/data/index.html`);
		this.webContents = mainWindow.webContents;
		ipc.on('async', (event, arg) => this.receiveAsync(event, arg));
	}

	initConfig() {
		config.paths.installPath = path.normalize(this.utils.installPath(config.discord.lastKnownVersion));
		config.paths.libPath = path.normalize(this.utils.libPath());
	}

	install() {
		this.utils.log("Config: " + JSON.stringify(config));
		this.appendLog("Initializing");
		this.locateAppPackage();
	}

	locateAppPackage() {
		var p = path.normalize(`${config.paths.installPath}/resources`);
		var pkg = fs.readdirSync(p).filter(file => {
			if(file === "app.asar") {
				return true;
			}
		});
		if(pkg.length <= 0) {
			//App package not found
			this.appendLog("Unable to locate app package, check the logs for errors");
			return;
		}

		this.appendLog("Located app package");
		this.downloadBd();
		//this.extractAppPackage();
	}

	downloadBd() {

		var self = this;
		this.appendLog("Downloading BetterDiscord");

		var error = false;
		var size = 0;
		var downloaded = 0;

		var req = request({
			method: 'GET',
			uri: config.urls.package
		});

		req.pipe(unzip.Extract({ path: path.normalize(config.paths.libPath) }));

		req.on('data', chunk => {
			downloaded += chunk.length;
			this.updatePb(downloaded, size);
		});

		req.on('response', data => {
			size = data.headers['content-length'];
		});

		req.on('error', err => {
			error = true;
			self.utils.log(err);
			self.appendLog("Failed to download BetterDiscord package, check the logs for errors");
		});

		req.on('end', () => {
			console.log("got here?");
			if(error) {
				self.appendLog("Failed to download BetterDiscord package, check the logs for errors");
			} else {
				self.extractAppPackage();
			}
		});
	}

	extractAppPackage() {
		var self = this;

		try {
			if(fs.existsSync(`${config.paths.installPath}/resources/app`)) {
				self.appendLog("Deleting old app directory");
				setTimeout(() => {
					fse.removeSync(`${config.paths.installPath}/resources/app`);
					extract();
				}, 500);
			} else {
				extract();
			}
		} catch(err) {
			self.appendLog("Could not delete old app directory, check the logs for errors");
			return;
		}

		function extract() {
			try {
				self.appendLog("Extracting app package");
				var a = new asar(`${config.paths.installPath}/resources/app.asar`);
				a.extract(msg => {
					self.appendLog(msg);
				}, (curIndex, total) => {
					self.updatePb(curIndex, total);
				}, err => {
					if(err === null) {
						self.inject();
					} else {
						self.log(err);
						self.appendLog("Failed to extract app package, check the logs for errors");
						self.clean();
					}
				});
			}catch(err) {
				console.log(err);
			}
		}
	}

	inject() {
		var self = this;
		this.updatePb(0, 5);
		this.appendLog("Injecting loader");

		var lines = [];
		var lr = readline.createInterface({
			input: fs.createReadStream(`${config.paths.installPath}/resources/app/app/index.js`)
		});

		lr.on('line', line => {
			lines.push(line);

			if(line.indexOf("'use strict';") > -1) { 
				lines.push(path.normalize(`var _betterDiscord = require('${config.paths.libPath}/${config.import}');`).replace(/\\/g,"/"));
				lines.push("var _betterDiscord2;");
			}

			if(line.indexOf("mainWindow = new BrowserWindow(mainWindowOptions);") > -1) { 
				lines.push(`    _betterDiscord2 = new _betterDiscord.BetterDiscord(mainWindow, false);`);
			}
		});

		lr.on('close', () => {
			fs.writeFileSync(`${config.paths.installPath}/resources/app/app/index.js`, lines.join('\n'));
			self.appendLog("Finished installing BetterDiscord");
			self.updatePb(5, 5);
		});
	}

	clean() {
		this.appendLog("Cleaning installation");
		try {
			if(fs.existsSync(`${config.paths.installPath}/resources/app`)) {
				self.appendLog("Deleting app directory");
				setTimeout(() => {
					fse.removeSync(`${config.paths.installPath}/resources/app`);
				}, 500);
			}
		} catch(err) {
			self.appendLog("Could not delete old app directory, check the logs for errors");
		}
	}

	appendLog(msg) {
		this.utils.log(msg);
		this.webContents.executeJavaScript(`appendLog("${msg}");`);
	}

	updatePb(cur, max) {
		this.webContents.executeJavaScript(`updatePbar(${cur}, ${max});`);
	}

	getData(e) {
		switch(e) {
			case "discordpath":
				return config.paths.installPath;
			case "libpath":
				return config.paths.libPath;
		}
	}

	receiveAsync(event, arg) {

		var data = arg.data || '';
		arg = arg.arg;

		switch(arg) {
			case "get":
				this.replyAsync(event, data, this.getData(data));
				break;
			case "browsedialog":
				var path = dialog.showOpenDialog({ properties: ['openDirectory'] });

				switch(data) {
					case "discordpath":
						path = path === undefined ? config.paths.installPath : path[0];
						config.paths.installPath = path;
						break;
					case "libpath":
						path = path === undefined ? config.paths.libPath : path[0];
						config.paths.libPath = path;
						break;
				}

				this.replyAsync(event, data, path);
				break;
			case "install":
				this.install();
				break;
			case "quit":
				this.app.quit();
				break;
		}

	}

	replyAsync(event, arg, data) {
		event.sender.send('async-reply', { "arg": arg, "data": data });
	}

}

module.exports = Installer;