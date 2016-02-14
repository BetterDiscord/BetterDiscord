/*
 * BetterDiscordApp Installer v0.3.2
 */

var dver = "0.0.284";

var asar = require('asar');
var wrench = require('wrench');
var fs = require('fs');
var readline = require('readline');
var util = require('util');

var _importSplice;
var _functionSplice;
var _functionCallSplice;

var _discordPath;
var _appFolder = "/app";
var _appArchive = "/app.asar";
var _packageJson = _appFolder + "/package.json";
var _index = _appFolder + "/app/index.js";

var _force = false;

// Get Arguments
process.argv.forEach(function (val, index, array) {
    if (val == "--force") {
        _force = true;
    }

    if (val == "-d" || val == "--directory") {
        _discordPath = array[(index+1)]
    }
});

function install() {

    if (typeof _discordPath == 'undefined') {
        var _os = process.platform;
        if (_os == "win32") {
            _importSplice = 89;
            _functionCallSplice = 497;
            _functionSplice = 601;
           _discordPath = process.env.LOCALAPPDATA + "/Discord/app-"+dver+"/resources";
        } else if (_os == "darwin") {
            _importSplice = 67;
            _functionCallSplice = 446;
            _functionSplice = 547;
            _discordPath = "/Applications/Discord.app/Contents/Resources" // Defaults to Applications directory
        }
    }
    console.log("Looking for discord resources at: " + _discordPath);

    fs.exists(_discordPath, function(exists) {

        if(exists) {
            console.log("Discord resources found at: " + _discordPath + "\nLooking for app folder");

            if(fs.existsSync(_discordPath + _appFolder)) {
                console.log("Deleting " + _discordPath + _appFolder + " folder.");
                wrench.rmdirSyncRecursive(_discordPath + _appFolder);
                console.log("Deleted " + _discordPath + _appFolder + " folder.");
            }

            if(fs.existsSync(_discordPath + "/node_modules/BetterDiscord")) {
                console.log("Deleting " + _discordPath + "/node_modules/BetterDiscord" + " folder.");
                wrench.rmdirSyncRecursive(_discordPath + "/node_modules/BetterDiscord");
                console.log("Deleted " + _discordPath + "/node_modules/BetterDiscord" + " folder.");
            }

            console.log("Looking for app archive");
            if(fs.existsSync(_discordPath + _appArchive)) {
                console.log("App archive found at: " + _discordPath + _appArchive);
            } else {
                console.log("Failed to locate app archive at: " + _discordPath + _appArchive);
                process.exit();
            }

            console.log("Extracting app archive");
            asar.extractAll(_discordPath + _appArchive, _discordPath + _appFolder);

            console.log("Copying BetterDiscord");

            fs.mkdirSync(_discordPath + "/node_modules/BetterDiscord");

            wrench.copyDirSyncRecursive(__dirname + "/BetterDiscord/", _discordPath + _appFolder  +  "/node_modules/BetterDiscord/", {forceDelete: true});

            if(!fs.existsSync("splice")) {
                console.log("Missing splice file");
                process.exit();
            }

            var splice = fs.readFileSync("splice");


            fs.exists(_discordPath + _appFolder, function(exists) {
                if(exists) {
                    console.log("Extracted to: " + _discordPath + _appFolder);
                    console.log("Injecting index.js");

                    var data = fs.readFileSync(_discordPath + _index).toString().split("\n");
                    data.splice(_importSplice, 0, 'var _betterDiscord = require(\'betterdiscord\');\n');
                    data.splice(_functionCallSplice, 0, splice);

                    fs.writeFile(_discordPath + _index, data.join("\n"), function(err) {
                        if(err) return console.log(err);
                        console.log("Injected index.js");

                        console.log("Deleting old cache files");

                        var counter = 0;
                        var _prefsPath = '/Library/Preferences/BetterDiscord/';

                        var emotes_twitch_global = 'emotes_twitch_global.json';
                        fs.exists(process.env.HOME + _prefsPath + emotes_twitch_global, (exists) => {
                            if (exists) {
                                console.log("Deleting " + emotes_twitch_global);
                                fs.unlinkSync(process.env.HOME + _prefsPath + emotes_twitch_global, (err) => {
                                    if(err) throw err;
                                });
                                console.log("Deleted " + emotes_twitch_global);
                            }
                            counter++;
                            finished();

                        });

                        var emotes_twitch_subscriber = 'emotes_twitch_subscriber.json';
                        fs.exists(process.env.HOME + _prefsPath + emotes_twitch_subscriber, (exists) => {
                            if (exists) {
                                console.log("Deleting " + emotes_twitch_subscriber);
                                fs.unlinkSync(process.env.HOME + _prefsPath + emotes_twitch_subscriber, (err) => {
                                    if(err) throw err;
                                });
                                console.log("Deleted " + emotes_twitch_subscriber);
                            }
                            counter++;
                            finished();
                        });

                        var emotes_bttv = 'emotes_bttv.json';
                        fs.exists(process.env.HOME + _prefsPath + emotes_bttv, (exists) => {
                            if (exists) {
                                console.log("Deleting " + emotes_bttv);
                                 fs.unlinkSync(process.env.HOME + _prefsPath + emotes_bttv, (err) => {
                                    if(err) throw err;
                                });
                                console.log("Deleted " + emotes_bttv);
                            }
                            counter++;
                            finished();
                        });

                        var emotes_bttv_2 = "emotes_bttv_2.json";
                        fs.exists(process.env.HOME + _prefsPath + emotes_bttv_2, (exists) => {
                            if (exists) {
                                console.log("Deleting " + emotes_bttv_2);
                                fs.unlinkSync(process.env.HOME + _prefsPath + emotes_bttv_2, (err) => {
                                    if(err) throw err;
                                });
                                console.log("Deleted " + emotes_bttv_2);
                            }
                            counter++;
                            finished();
                        });

                        var emotes_ffz = "emotes_ffz.json";
                        fs.exists(process.env.HOME + _prefsPath + emotes_ffz, (exists) => {
                            if (exists) {
                                console.log("Deleting " + emotes_ffz);
                                fs.unlinkSync(process.env.HOME + _prefsPath + emotes_ffz, (err) => {
                                    if(err) throw err;
                                });
                                console.log("Deleted " + emotes_ffz);
                            }
                            counter++;
                            finished();

                        });
                        var user_pref = "user.json";
                        fs.exists(process.env.HOME + _prefsPath + user_pref, (exists) => {
                            if (exists) {
                                console.log("Deleting " + user_pref);
                                fs.unlinkSync(process.env.HOME + _prefsPath + user_pref, (err) => {
                                    if(err) throw err;
                                });
                                console.log("Deleted " + user_pref);
                            }
                            counter++;
                            finished();
                        });

                        function finished() {
                            if(counter => 6) {
                                console.log("Looks like we're done here");
                                process.exit();
                            }
                        }
                    });

                } else {
                    console.log("Something went wrong. Please try again.");
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

    console.log("BetterDiscord Simple Installer v0.3 for Discord "+dver+" by Jiiks.");
    console.log("If Discord has updated then download the latest installer.");

    var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    if (_force == false) {
        rl.question("The following directories will be deleted if they exists: discorpath/app, discordpath/node_modules/BetterDiscord, is this ok? Y/N", function(answer) {

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
    } else {
        install();
    }
}

init();
