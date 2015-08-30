/*
 * BetterDiscordApp Installer v0.2 for Discord 0.0.277
 */

var asar = require('asar');
var wrench = require('wrench');
var fs = require('fs');
var readline = require('readline');
var util = require('util');

var _discordPath;
var _appFolder = "\\app";
var _appArchive = "\\app.asar";
var _packageJson = _appFolder + "\\package.json";
var _index = _appFolder + "\\app\\index.js";

function install() {

    _discordPath = process.env.LOCALAPPDATA + "\\Discord\\app-0.0.277\\resources";
    console.log("Looking for discord resources at: " + _discordPath);

    fs.exists(_discordPath, function(exists) {

        if(exists) {
            console.log("Discord resources found at: " + _discordPath + "\nLooking for app folder");

            if(fs.existsSync(_discordPath + _appFolder)) {
                console.log("Deleting " + _discordPath + _appFolder + " folder.");
                wrench.rmdirSyncRecursive(_discordPath + _appFolder);
                console.log("Deleted " + _discordPath + _appFolder + " folder.");
            }

            if(fs.existsSync(_discordPath + "\\node_modules")) {
                console.log("Deleting " + _discordPath + "\\node_modules" + " folder.");
                wrench.rmdirSyncRecursive(_discordPath + "\\node_modules");
                console.log("Deleted " + _discordPath + "\\node_modules" + " folder.");
            }

            console.log("Copying BetterDiscord");

            fs.mkdirSync(_discordPath + "\\node_modules");
            wrench.copyDirSyncRecursive(__dirname + "\\BetterDiscord\\", _discordPath + "\\node_modules\\BetterDiscord\\");

            console.log("Looking for app archive");
            if(fs.existsSync(_discordPath + _appArchive)) {
                console.log("App archive found at: " + _discordPath + _appArchive);
            } else {
                console.log("Failed to locate app archive at: " + _discordPath + _appArchive);
                process.exit();
            }

            console.log("Extracting app archive");

            asar.extractAll(_discordPath + _appArchive, _discordPath + _appFolder);

            fs.exists(_discordPath + _appFolder, function(exists) {
                if(exists) {
                    console.log("Extracted to: " + _discordPath + _appFolder);
                    console.log("Injecting index.js");

                    var data = fs.readFileSync(_discordPath + _index).toString().split("\n");
                    data.splice(80, 0, 'var _betterDiscord = require(\'betterdiscord\');\n');
                    data.splice(363, 0, '_betterDiscord = new _betterDiscord.BetterDiscord(mainWindow); \n _betterDiscord.init(); \n');


                    fs.writeFile(_discordPath + _index, data.join("\n"), function(err) {
                        if(err) return console.log(err);

                        console.log("Injected index.js");
                        console.log("Injecting package.json");

                        var data = fs.readFileSync(_discordPath + _packageJson).toString().split("\n");
                        data.splice(9, 0, ',"betterdiscord":"^0.1.2"');

                        fs.writeFile(_discordPath + _packageJson, data.join("\n"), function(err) {
                            if(err) return console.log(err);

                            console.log("Injected package.json");
                            console.log("Looks like were done here :)");
                            process.exit();
                        });
                    });

                } else {
                    console.log("Something went wrong, rerun.");
                    process.exit();
                }
            });



        } else {
            console.log("Discord resources not found at: " + _discordPath);
            process.exit();
        }

    });

}

function init() {

    console.log("BetterDiscord Simple Installer v0.1 for Discord 0.0.277 by Jiiks.");
    console.log("If Discord has updated then download the latest installer.");

    var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question("The following directories will be deleted if they exists: discorpath\\app, discordpath\\node_modules, is this ok? Y/N", function(answer) {

        var alc = answer.toLowerCase();

        switch(alc) {
            case "y":
                install();
                break;
            case "yes":
                install();
                break;
            case "n":
                process.exit();
                break;
            case "no":
                process.exit();
                break;
        }
    });
}

init();