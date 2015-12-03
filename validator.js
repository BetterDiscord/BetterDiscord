var fs = require('fs');
var crypto = require('crypto');

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}


var dver = "0.0.283";

console.log("BetterDiscord Validator v0.1");


var discordPath = process.env.LOCALAPPDATA + "/Discord/app-" + dver + "/resources";

exists(discordPath + "/app");
exists(discordPath + "/app/app/index.js");

var bdPath = discordPath + "/node_modules/BetterDiscord";

exists(bdPath);
exists(bdPath + "/package.json");
exists(bdPath + "/betterdiscord.js");
exists(bdPath + "/lib");
exists(bdPath + "/lib/BetterDiscord.js");
exists(bdPath + "/lib/config.json");
exists(bdPath + "/lib/Utils.js");


check(discordPath + "/app/app/index.js", "5b70d6fac7f5b2761cb50233134f5084");

check(bdPath + "/package.json", "9D469DC7C6D74443B41F74046A4088BA");
check(bdPath + "/betterdiscord.js", "31DD3E3D37D6FD5F6C2784D06F1162C4");
check(bdPath + "/lib/BetterDiscord.js", "B14C0A4841FBDE474C1AB164A9DBCCBC");
check(bdPath + "/lib/config.json", "F0A00FDB993C9F9E9CE49383C0588190");
check(bdPath + "/lib/Utils.js", "8DACE92500A16C8F113863D42001A09D");

console.log("Everything seems to be fine");


function exists(path) {
	
	console.log("Checking for " + path);
	var exists = fs.existsSync(path);
	if(exists) {
		console.log(path + " exists");
	} else {
		console.log(path  + " doesn't exists");
		process.exit();
	}
}

function check(path, cm) {
	console.log("Checking " + path + " checksum");
	
	var read = fs.readFileSync(path);
	
	if(cm.toLowerCase() == checksum(read).toLowerCase()) {
		console.log(path + " checksum matches");
	} else {
		console.log(path + " checksum mismatch");
		console.log("Expected: " + cm + " Got: " + checksum(read));
		process.exit();
	}
	
}