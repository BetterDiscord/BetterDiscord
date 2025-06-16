import * as fs from "fs";
import {clone} from "@common/utils";
import Logger from "@common/logger";


// TODO: this whole file could use better typing

export function readFile(path: string, options: object | BufferEncoding = "utf8") {
    return fs.readFileSync(path, options);
}

export function writeFile(path: string, content: string | Uint8Array, options?: fs.WriteFileOptions & {originalFs: boolean;}) {
    if (content instanceof Uint8Array) {
        content = Buffer.from(content);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const doWriteFile = options?.originalFs ? require("original-fs").writeFileSync : fs.writeFileSync;

    return doWriteFile(path, content, options);
}

export function readDirectory(path: string, options?: object) {
    return fs.readdirSync(path, options);
}

export function createDirectory(path: string, options: object) {
    return fs.mkdirSync(path, options);
}

export function deleteDirectory(path: string, options: object) {
    fs.rmdirSync(path, options);
}

export function exists(path: string) {
    return fs.existsSync(path);
}

export function getRealPath(path: string, options?: object) {
    return fs.realpathSync(path, options);
}

export function rename(oldPath: string, newPath: string) {
    return fs.renameSync(oldPath, newPath);
}

export function renameSync(oldPath: string, newPath: string) {
    return fs.renameSync(oldPath, newPath);
}

export function rm(pathToFile: string) {
    return fs.rmSync(pathToFile);
}

export function rmSync(pathToFile: string) {
    return fs.rmSync(pathToFile);
}

export function unlinkSync(fileToDelete: string) {
    return fs.unlinkSync(fileToDelete);
}

export function createWriteStream(path: string, options: object) {
    // @ts-expect-error this should be deprecated probably
    return clone(fs.createWriteStream(path, options));
}

export function watch(path: string, options: object, callback: (e: string, f: string) => void) {
    const watcher = fs.watch(path, options, (event, filename) => {
        try {
            callback(event, filename!);
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

export function getStats(path: string, options?: object) {
    const stats = fs.statSync(path, options);

    return {
        ...stats,
        isFile: stats.isFile.bind(stats),
        isDirectory: stats.isDirectory.bind(stats),
        isSymbolicLink: stats.isSymbolicLink.bind(stats)
    };
}