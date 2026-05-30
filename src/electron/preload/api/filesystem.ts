import * as fs from "fs";
import {clone} from "@common/utils";
import Logger from "@common/logger";
import {wrapFunction} from "@common/utils/clone";

export const readDirectory = wrapFunction(fs.readdirSync);
export const createDirectory = wrapFunction(fs.mkdirSync);
export const deleteDirectory = wrapFunction(fs.rmdirSync);
export const exists = wrapFunction(fs.existsSync);
export const getRealPath = wrapFunction(fs.realpathSync);
export const renameSync = wrapFunction(fs.renameSync);
export const rmSync = wrapFunction(fs.rmSync);
export const unlinkSync = wrapFunction(fs.unlinkSync);

export function readFile(path: fs.PathOrFileDescriptor, options: Parameters<typeof fs.readFileSync>[1] = "utf-8") {
    return fs.readFileSync(path, options);
}

export function writeFile(path: fs.PathOrFileDescriptor, content: string | Uint8Array, options?: fs.WriteFileOptions & {originalFs: boolean;}) {
    if (content instanceof Uint8Array) {
        content = Buffer.from(content);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const doWriteFile = options?.originalFs ? require("original-fs").writeFileSync : fs.writeFileSync;

    return doWriteFile(path, content, options);
}

export function createWriteStream(...args: Parameters<typeof fs.createWriteStream>) {
    // @ts-expect-error this should be deprecated probably
    return clone(fs.createWriteStream(...args));
}

export function watch(path: string, options: fs.WatchOptions | BufferEncoding | null, listener: fs.WatchListener<string>) {
    const watcher = fs.watch(path, options, (event, filename) => {
        try {
            listener(event, filename!);
        }
        catch (error) {
            Logger.stacktrace("filesystem", "Failed to watch path", error as Error);
        }
    });

    return {
        close: () => {
            watcher.close();
        }
    };
}

export function getStats(path: string, options?: fs.StatSyncOptions & {bigint?: false;}) {
    const stats = fs.statSync(path, options);

    return {
        ...stats,
        isFile: stats.isFile.bind(stats),
        isDirectory: stats.isDirectory.bind(stats),
        isSymbolicLink: stats.isSymbolicLink.bind(stats)
    };
}