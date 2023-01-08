import fs from "fs";
import originalFs from "original-fs";
import fsPromises from "fs/promises";

// Stats Stuff

export const statSync = (
    path: Parameters<typeof fs.statSync>[0],
    options?: {original?: boolean}
) => {
    const stats = (options?.original ? originalFs : fs).statSync(path);

    return {
        ...stats,
        isFile: stats.isFile.bind(stats),
        isDirectory: stats.isDirectory.bind(stats),
        isSymbolicLink: stats.isSymbolicLink.bind(stats)
    };
};

export const stat = async (
    path: Parameters<typeof fsPromises.stat>[0]
) => {
    const stats = await fsPromises.stat(path);

    return {
        ...stats,
        isFile: stats.isFile.bind(stats),
        isDirectory: stats.isDirectory.bind(stats),
        isSymbolicLink: stats.isSymbolicLink.bind(stats)
    };
};

// Exists Stuff

export const existsSync = (
    path: Parameters<typeof fs.existsSync>[0],
    options?: {original?: boolean}
) => {
    return (options?.original ? originalFs : fs).existsSync(path);
};

export const exists = async (
    path: Parameters<typeof fsPromises.access>[0]
) => {
    return fsPromises.access(path)
        .then(() => true)
        .catch(() => false);
}

// File Stuff

export const writeFileSync = (
    path: Parameters<typeof fs.writeFileSync>[0],
    data: Parameters<typeof fs.writeFileSync>[1],
    options?: Parameters<typeof fs.writeFileSync>[2] & {original?: boolean}
) => {
    return (options?.original ? originalFs : fs).writeFileSync(path, data, options);
};

export const writeFile = async (
    path: Parameters<typeof fsPromises.writeFile>[0],
    data: Parameters<typeof fsPromises.writeFile>[1],
    options?: Parameters<typeof fsPromises.writeFile>[2]
) => {
    return fsPromises.writeFile(path, data, options);
};

export const readFileSync = (
    path: Parameters<typeof fs.readFileSync>[0],
    options?: Parameters<typeof fs.readFileSync>[1] & {original?: boolean}
) => {
    return (options?.original ? originalFs : fs).readFileSync(path, options);
};

export const readFile = async (
    path: Parameters<typeof fsPromises.readFile>[0],
    options?: Parameters<typeof fsPromises.readFile>[1]
): ReturnType<typeof fsPromises.readFile> => {
    return fsPromises.readFile(path, options);
};

// Directory Stuff

export const mkdirSync = (
    path: Parameters<typeof fs.mkdirSync>[0],
    options?: Parameters<typeof fs.mkdirSync>[1] & {original?: boolean}
) => {
    return (options?.original ? originalFs : fs).mkdirSync(path, options);
};

export const mkdir = async (
    path: Parameters<typeof fsPromises.mkdir>[0],
    options?: Parameters<typeof fsPromises.mkdir>[1]
) => {
    return fsPromises.mkdir(path, options);
};

export const readdirSync = (
    path: Parameters<typeof fs.readdirSync>[0],
    options?: Parameters<typeof fs.readdirSync>[1] & {original?: boolean}
) => {
    return (options?.original ? originalFs : fs).readdirSync(path, options as Parameters<typeof fs.readdirSync>[1]);
};

export const readdir = async (
    path: Parameters<typeof fsPromises.readdir>[0],
    options?: {withFileTypes?: boolean}
) => {
    return fsPromises.readdir(path, options as any);
};

export default {
    statSync, stat,
    existsSync, exists,
    writeFileSync, writeFile,
    readFileSync, readFile,
    mkdirSync, mkdir,
    readdirSync, readdir
}
