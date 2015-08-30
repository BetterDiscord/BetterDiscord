/*
 * BetterDiscordApp Installer v0.1 for Discord 0.0.277
 */

var asar = require('asar');
var fs = require('fs');

var _discordPath;
var _appFolder = "\\app";
var _appArchive = "\\app.asar";
var _packageJson = _appFolder + "\\package.json";
var _index = _appFolder + "\\app\\index.js";

function init() {

    console.log("BetterDiscord Simple Installer v0.1 for Discord 0.0.277 by Jiiks.");
    console.log("If Discord has updated then download the latest installer.");


    _discordPath = process.env.LOCALAPPDATA + "\\Discord\\app-0.0.277\\resources";
    console.log("Looking for discord resources at: " + _discordPath);

    fs.exists(_discordPath, function(exists) {
        if(exists) {
            console.log("Discord resources found at: " + _discordPath);

            console.log("Looking for app folder");
            fs.exists(_discordPath + _appFolder, function(exists) {
                if(exists) {
                    console.log("Delete/Move app folder and run again");
                    process.exit();
                } else {
                    console.log("Looking for app archive");
                    fs.exists(_discordPath + _appArchive, function(exists) {
                        if(exists) {
                            console.log("App archive found");
                            console.log("Extracting...");
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
                            console.log("App archive not found.");
                            process.exit();
                        }
                    });
                }
            });

        } else {
            console.log("Discord resources not found at: " + _discordPath);
        }
    });
}



init();