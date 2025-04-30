import EventEmitter from "@common/events";

import Module from "./module";
import vm from "./vm";
import fs from "./fs";
import request from "./request";
import https from "./https";
import buffer from "./buffer";
import crypto from "./crypto";
import Remote from "./remote";
import Logger from "@common/logger";

const deprecated = new Map([
    ["request", "Use BdApi.Net.fetch instead."],
    ["https", "Use BdApi.Net.fetch instead."],
]);


const originalFs = Object.assign({}, fs);
originalFs.writeFileSync = (path, data, options) => fs.writeFileSync(path, data, Object.assign({}, options, {originalFs: true}));
originalFs.writeFile = (path, data, options) => fs.writeFile(path, data, Object.assign({}, options, {originalFs: true}));

export const createRequire = function (path) {
    return mod => {
        // Ignore relative require attempts because Discord
        // erroneously does this a lot apparently which
        // causes us to do filesystem accesses in our default
        // switch statement mainly used for absolute paths
        if (typeof (mod) === "string" && mod.startsWith("./")) return;

        if (deprecated.has(mod)) {
            Logger.warn("Remote~Require", `The "${mod}" module is marked as deprecated. ${deprecated.get(mod)}`);
        }

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
            case "buffer": return buffer;
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
