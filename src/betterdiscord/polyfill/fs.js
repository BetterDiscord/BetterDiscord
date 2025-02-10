import Remote from "./remote";


export const readFileSync = function (path, options = "utf8") {
    return Remote.filesystem.readFile(path, options);
};

export const readFile = function (path, options = "utf8", callback) {
    try {
        const contents = Remote.filesystem.readFile(path, options);
        callback(null, contents);
    }
    catch (error) {
        callback(error, null);
    }
};

export const writeFile = function (path, data, options = "utf8", callback) {
    if (typeof (options) === "function") {
        callback = options;
        if (!["object", "string"].includes(typeof (options))) options = undefined;
    }

    try {
        Remote.filesystem.writeFile(path, data, options);
        callback(null);
    }
    catch (error) {
        callback(error);
    }
};

export const writeFileSync = function (path, data, options) {
    Remote.filesystem.writeFile(path, data, options);
};

export const readdir = function (path, options, callback) {
    try {
        const result = Remote.filesystem.readDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const readdirSync = function (path, options) {
    return Remote.filesystem.readDirectory(path, options);
};

export const mkdir = function (path, options, callback) {
    try {
        const result = Remote.filesystem.createDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const mkdirSync = function (path, options) {
    Remote.filesystem.createDirectory(path, options);
};

export const rmdir = function (path, options, callback) {
    try {
        const result = Remote.filesystem.deleteDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const rmdirSync = function (path, options) {
    Remote.filesystem.deleteDirectory(path, options);
};

export const rm = function (path, options, callback) {
    try {
        const result = Remote.filesystem.rm(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const rmSync = function (path, options) {
    Remote.filesystem.rmSync(path, options);
};

export const exists = function (path, options, callback) {
    try {
        const result = Remote.filesystem.exists(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const existsSync = function (path, options) {
    return Remote.filesystem.exists(path, options);
};

export const stat = function (path, options, callback) {
    try {
        const result = Remote.filesystem.getStats(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error);
    }
};

export const statSync = function (path, options) {
    return Remote.filesystem.getStats(path, options);
};

export const lstat = stat;
export const lstatSync = statSync;

export const rename = function (oldPath, newPath, options, callback) {
    try {
        const result = Remote.filesystem.rename(oldPath, newPath, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const renameSync = function (oldPath, newPath, options) {
    return Remote.filesystem.renameSync(oldPath, newPath, options);
};

export const realpath = function (path, options, callback) {
    try {
        const result = Remote.filesystem.getStats(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const realpathSync = function (path, options) {
    return Remote.filesystem.getRealPath(path, options);
};

export const watch = (path, options, callback) => {
    return Remote.filesystem.watch(path, options, callback);
};

export const createWriteStream = (path, options) => {
    return Remote.filesystem.createWriteStream(path, options);
};

export const unlinkSync = (path) => Remote.filesystem.unlinkSync(path);
export const unlink = (path) => Remote.filesystem.unlinkSync(path);

export default {
    readFile,
    exists,
    existsSync,
    lstat,
    lstatSync,
    mkdir,
    mkdirSync,
    readFileSync,
    readdir,
    readdirSync,
    realpath,
    realpathSync,
    rename,
    renameSync,
    rm,
    rmSync,
    rmdir,
    rmdirSync,
    stat,
    statSync,
    unlink,
    unlinkSync,
    watch,
    writeFile,
    writeFileSync,
    createWriteStream
};