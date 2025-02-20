import Remote from "./remote";

export const readFileSync = (path, options = "utf8") =>
    Remote.filesystem.readFile(path, options);

export const readFile = (path, options = "utf8", callback) => {
    try {
        const contents = Remote.filesystem.readFile(path, options);
        callback(null, contents);
    }
    catch (error) {
        callback(error, null);
    }
};

export const writeFile = (path, data, options = "utf8", callback) => {
    if (typeof options === "function") {
        callback = options;
        if (!["object", "string"].includes(typeof options)) options = undefined;
    }

    try {
        Remote.filesystem.writeFile(path, data, options);
        callback(null);
    }
    catch (error) {
        callback(error);
    }
};

export const writeFileSync = (path, data, options) => {
    Remote.filesystem.writeFile(path, data, options);
};

export const readdir = (path, options, callback) => {
    try {
        const result = Remote.filesystem.readDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const readdirSync = (path, options) =>
    Remote.filesystem.readDirectory(path, options);

export const mkdir = (path, options, callback) => {
    try {
        const result = Remote.filesystem.createDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const mkdirSync = (path, options) => {
    Remote.filesystem.createDirectory(path, options);
};

export const rmdir = (path, options, callback) => {
    try {
        const result = Remote.filesystem.deleteDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const rmdirSync = (path, options) => {
    Remote.filesystem.deleteDirectory(path, options);
};

export const rm = (path, options, callback) => {
    try {
        const result = Remote.filesystem.rm(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const rmSync = (path, options) => {
    Remote.filesystem.rmSync(path, options);
};

export const exists = (path, options, callback) => {
    try {
        const result = Remote.filesystem.exists(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const existsSync = (path, options) =>
    Remote.filesystem.exists(path, options);

export const stat = (path, options, callback) => {
    try {
        const result = Remote.filesystem.getStats(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error);
    }
};

export const statSync = (path, options) =>
    Remote.filesystem.getStats(path, options);

export const lstat = stat;
export const lstatSync = statSync;

export const rename = (oldPath, newPath, options, callback) => {
    try {
        const result = Remote.filesystem.rename(oldPath, newPath, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const renameSync = (oldPath, newPath, options) =>
    Remote.filesystem.renameSync(oldPath, newPath, options);

export const realpath = (path, options, callback) => {
    try {
        const result = Remote.filesystem.getStats(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const realpathSync = (path, options) =>
    Remote.filesystem.getRealPath(path, options);

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
    createWriteStream,
};
