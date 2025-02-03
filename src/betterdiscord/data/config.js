let version = process.env.__VERSION__;

let path = "";
let appPath = "";
let userData = "";

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
};