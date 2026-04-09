import type * as fs from "node:fs";
import Remote from "./remote";
import {wrapFunction} from "@common/utils/clone";


type WriteOptions = fs.WriteFileOptions & {originalFs: boolean;};
type ErrorOnlyCallback = (err: Error | null) => void;

function wrapFunctionWithCallback<
    T extends (...args: any[]) => any,
    C extends (err: Error | null, data: any) => void
>(func: T) {
    return function (...args: [...Parameters<T>, C]) {
        const params = args.slice(0, -1) as Parameters<T>;
        const callback = args[args.length - 1] as C;
        try {
            const result = func(...params);
            callback(null, result);
        }
        catch(error) {
            callback(error as Error, null);
        }
    }
}

export const readFileSync = wrapFunction(Remote.filesystem.readFile);
export const writeFileSync = wrapFunction(Remote.filesystem.writeFile);
export const readdirSync = wrapFunction(Remote.filesystem.readDirectory);
export const mkdirSync = wrapFunction(Remote.filesystem.createDirectory);
export const rmdirSync = wrapFunction(Remote.filesystem.deleteDirectory);
export const existsSync = wrapFunction(Remote.filesystem.exists);
export const statSync = wrapFunction(Remote.filesystem.getStats);
export const renameSync = wrapFunction(Remote.filesystem.renameSync);
export const rmSync = wrapFunction(Remote.filesystem.rmSync);
export const realpathSync = wrapFunction(Remote.filesystem.getRealPath);
export const unlinkSync = wrapFunction(Remote.filesystem.unlinkSync);
export const watch = wrapFunction(Remote.filesystem.watch);
export const createWriteStream = wrapFunction(Remote.filesystem.createWriteStream);

export const rmdir = wrapFunctionWithCallback<typeof Remote.filesystem.deleteDirectory, ErrorOnlyCallback>(Remote.filesystem.deleteDirectory);
export const rm = wrapFunctionWithCallback<typeof Remote.filesystem.rmSync, ErrorOnlyCallback>(Remote.filesystem.rmSync);
export const rename = wrapFunctionWithCallback<typeof Remote.filesystem.renameSync, ErrorOnlyCallback>(Remote.filesystem.renameSync);
export const unlink = wrapFunctionWithCallback<typeof Remote.filesystem.unlinkSync, ErrorOnlyCallback>(Remote.filesystem.unlinkSync);

type ReadFileCallback = (err: Error | null, contents: string | Buffer<ArrayBufferLike> | null) => void;
export const readFile = wrapFunctionWithCallback<typeof Remote.filesystem.readFile, ReadFileCallback>(Remote.filesystem.readFile);

type ReaddirCallback = (err: Error | null, result: string[] | Array<Buffer<ArrayBufferLike>> | null) => void;
export const readdir = wrapFunctionWithCallback<typeof Remote.filesystem.readDirectory, ReaddirCallback>(Remote.filesystem.readDirectory);

type MkdirCallback = (err: Error | null, path?: string | null) => void;
export const mkdir = wrapFunctionWithCallback<typeof Remote.filesystem.createDirectory, MkdirCallback>(Remote.filesystem.createDirectory);

type ExistsCallback = (err: Error | null, exists: boolean | null) => void;
export const exists = wrapFunctionWithCallback<typeof Remote.filesystem.exists, ExistsCallback>(Remote.filesystem.exists);

type StatCallback = (err: Error | null, stats: fs.Stats | null) => void;
export const stat = wrapFunctionWithCallback<typeof Remote.filesystem.getStats, StatCallback>(Remote.filesystem.getStats);

type RealpathCallback = (err: Error | null, resolvedPath: string | null) => void;
export const realpath = wrapFunctionWithCallback<typeof Remote.filesystem.getRealPath, RealpathCallback>(Remote.filesystem.getRealPath);

export const writeFile = function (path: fs.PathOrFileDescriptor, data: string | Uint8Array, options?: WriteOptions | ErrorOnlyCallback, callback?: ErrorOnlyCallback) {
    if (typeof (options) === "function") {
        callback = options;
        options = undefined;
    }

    try {
        Remote.filesystem.writeFile(path, data, options as WriteOptions);
        callback?.(null);
    }
    catch (error) {
        callback?.(error as Error);
    }
};

export const lstat = stat;
export const lstatSync = statSync;

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