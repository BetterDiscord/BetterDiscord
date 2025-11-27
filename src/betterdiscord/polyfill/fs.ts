import type {WriteFileOptions} from "node:fs";
import Remote from "./remote";


type WriteOptions = WriteFileOptions & {originalFs: boolean;};
type WriteCallback = (err: Error | null) => void;


export const readFileSync = function (path: string, options: object | BufferEncoding = "utf8") {
    return Remote.filesystem.readFile(path, options);
};

export const readFile = function (path: string, options: object | BufferEncoding = "utf8", callback: (err: Error | null, contents: string | Buffer<ArrayBufferLike> | null) => void) {
    try {
        const contents = Remote.filesystem.readFile(path, options);
        callback(null, contents);
    }
    catch (error) {
        callback(error as Error, null);
    }
};

export const writeFile = function (path: string, data: string | Uint8Array, options?: WriteOptions | WriteCallback, callback?: WriteCallback) {
    if (typeof (options) === "function") {
        callback = options;
        if (!["object", "string"].includes(typeof (options))) options = undefined;
    }

    try {
        Remote.filesystem.writeFile(path, data, options as WriteOptions);
        callback?.(null);
    }
    catch (error) {
        callback?.(error as Error);
    }
};

export const writeFileSync = function (path: string, data: string | Uint8Array, options?: WriteFileOptions & {originalFs: boolean;}) {
    Remote.filesystem.writeFile(path, data, options);
};

export const readdir = function (path: string, options: object, callback: (err: Error | null, result: string[] | Array<Buffer<ArrayBufferLike>> | null) => void) {
    try {
        const result = Remote.filesystem.readDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error as Error, null);
    }
};

export const readdirSync = function (path: string, options: object) {
    return Remote.filesystem.readDirectory(path, options);
};

export const mkdir = function (path: string, options: object, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.createDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const mkdirSync = function (path: string, options: object) {
    Remote.filesystem.createDirectory(path, options);
};

export const rmdir = function (path: string, options: object, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.deleteDirectory(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const rmdirSync = function (path: string, options: object) {
    Remote.filesystem.deleteDirectory(path, options);
};

export const rm = function (path: string, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.rm(path);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const rmSync = function (path: string) {
    Remote.filesystem.rmSync(path);
};

export const exists = function (path: string, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.exists(path);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const existsSync = function (path: string) {
    return Remote.filesystem.exists(path);
};

export const stat = function (path: string, options: object, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.getStats(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error);
    }
};

export const statSync = function (path: string, options: object) {
    return Remote.filesystem.getStats(path, options);
};

export const lstat = stat;
export const lstatSync = statSync;

export const rename = function (oldPath: string, newPath: string, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.rename(oldPath, newPath);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const renameSync = function (oldPath: string, newPath: string) {
    return Remote.filesystem.renameSync(oldPath, newPath);
};

export const realpath = function (path: string, options: object, callback: (...a: any[]) => void) {
    try {
        const result = Remote.filesystem.getStats(path, options);
        callback(null, result);
    }
    catch (error) {
        callback(error, null);
    }
};

export const realpathSync = function (path: string, options?: object) {
    return Remote.filesystem.getRealPath(path, options);
};

export const watch = (path: string, options: object, callback: (...a: any[]) => void) => {
    return Remote.filesystem.watch(path, options, callback);
};

export const createWriteStream = (path: string, options: object) => {
    return Remote.filesystem.createWriteStream(path, options);
};

export const unlinkSync = (path: string) => Remote.filesystem.unlinkSync(path);
export const unlink = (path: string) => Remote.filesystem.unlinkSync(path);

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