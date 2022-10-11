import Module from "./module";
import * as vm from "./vm";
import * as fs from "./fs";
import request from "./request";
import EventEmitter from "common/events";
import * as https from "./https";
import Buffer from "./buffer";
import crypto from "./crypto";
import Remote from "./remote";

const originalFs = Object.assign({}, fs);
originalFs.writeFileSync = (path, data, options) => fs.writeFileSync(path, data, Object.assign({}, options, {originalFs: true}));
originalFs.writeFile = (path, data, options) => fs.writeFile(path, data, Object.assign({}, options, {originalFs: true}));

export const createRequire = function (path) {
    return mod => {
        switch (mod) {
            case "request": return request;
            case "https": return https;
            case "original-fs": return originalFs;
            case "fs": return fs;
            case "path": return Remote.path;
            case "events": return EventEmitter;
            case "electron": return Remote.electron;
            case "process": return window.process;
            case "vm": return vm;
            case "module": return Module;
            case "buffer": return Buffer.getBuffer();
            case "crypto": return crypto;
    
            default:
                return Module._load(mod, path, createRequire);
        }
    };
};

const require = window.require = createRequire(".");
require.cache = {};
require.resolve = (path) => {
    for (const key of Object.keys(require.cache)) {
        if (key.startsWith(path)) return require.cache[key];
    }
};

export default require;