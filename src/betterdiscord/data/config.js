let version = process.env.__VERSION__;

let path = "";
let appPath = process.env.DISCORD_APP_PATH;
let userData = process.env.DISCORD_USER_DATA;
let dataPath = process.env.BETTERDISCORD_DATA_PATH;

// TODO: refactor this away entirely
export default {
    get version() {return version;},
    set version(str) {version = str;},

    // Get from main process
    get path() {return path;},
    set path(str) {path = str;},

    get appPath() {return appPath;},
    set appPath(str) {appPath = str;},

    get userData() {return userData;},
    set userData(str) {userData = str;},

    get dataPath() {return dataPath;},
    set dataPath(str) {dataPath = str;},
};