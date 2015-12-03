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


check(discordPath + "/app/app/index.js", "35CAB26E794CDA4123927F2DC932958B");
check(bdPath + "/package.json", 		 "26EF86E0910272D3ACA1B854D2F25340");
check(bdPath + "/betterdiscord.js", 	 "31DD3E3D37D6FD5F6C2784D06F1162C4");
check(bdPath + "/lib/BetterDiscord.js",  "84D281EDF38F945A5F6DFAAA2D951A6A");
check(bdPath + "/lib/config.json", 		 "9A6E146B64A2D2D459B081B910D60582");
check(bdPath + "/lib/Utils.js", 		 "FD1FFCE03E999B80636D200F78383BF8"); 

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