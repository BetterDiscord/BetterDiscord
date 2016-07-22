'use strict';

const 
	fs = require('fs'),
	path = require('path'),
	walk = require('walk'),
	p = require('path');

fs.mkdirPSync = function(dirPath) {
	try {
		fs.mkdirSync(dirPath);
	} catch(err) {
		if(err.errno === -4058 || err.errno === -2) {
			fs.mkdirPSync(path.dirname(dirPath));
			fs.mkdirPSync(dirPath);
		} else if(err.errno === -4075) {
			return "EXIST";
		} else {
			return "NOT OK";
		}
	}
	return "OK";
}

class Asar {

	constructor(filePath) {
		this.path = filePath;
		this.files = [];
	}

	extract(statusCb, progressCb, cb) {
		this.walker = walk.walk(this.path, { followLinks: false });
		statusCb("Creating Directories");
		this.walker.on('file', (root, stat, next) => {
			this.files.push(`${root}/${stat.name}`);
			try {
				fs.statSync(root.replace("app.asar", "app"));
			} catch(err) {
				fs.mkdirPSync(root.replace("app.asar", "app"));
			}
			next();
		});

		this.walker.on('end', () => {
			var self = this;
			statusCb("Copying files");
			var p = 1;
			var filecount = this.files.length;

			function copy(files, index) {
				if(index >= filecount) {
					statusCb("Finished extracting app package");
					cb(null);
					return;
				}
				setTimeout(() => { self.copyfile(files, index, copy) }, 1);
				progressCb(index, filecount);
			}

			copy(this.files, 0);
		});
	}

	copyfile(files, index, cb) {
		fs.writeFileSync(files[index].replace("app.asar", "app"), fs.readFileSync(files[index]));
		cb(files, index+1);
	}
}

module.exports = Asar;