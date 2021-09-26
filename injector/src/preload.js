const Module = require("module");
const path = require("path");
const electron = require("electron");
const NodeEvents = require("events");

const cloneObject = function (target, newObject = {}, keys) {
    if (!Array.isArray(keys)) keys = Object.keys(Object.getOwnPropertyDescriptors(target));
    return keys.reduce((clone, key) => {
        if (typeof(target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null && !(target[key] instanceof NodeEvents)) clone[key] = cloneObject(target[key], {});
        else clone[key] = target[key];

        return clone;
    }, newObject);
};

/* global window:false */

// const context = electron.webFrame.top.context;
Object.defineProperty(window, "webpackJsonp", {
    get: () => electron.webFrame.top.context.webpackJsonp
});

electron.webFrame.top.context.global = electron.webFrame.top.context;
electron.webFrame.top.context.require = require;
electron.webFrame.top.context.Buffer = Buffer;


electron.webFrame.top.context.process = new class PatchedProcess extends NodeEvents {
    get __ORIGINAL_PROCESS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED__() {return process;}

    constructor() {
        super();

        Object.assign(this,
            cloneObject(process, {}, Object.keys(NodeEvents.prototype)),
            cloneObject(process, {})
        );
    }
};

// Load Discord's original preload
const preload = process.env.DISCORD_PRELOAD;
if (preload) {

    // Restore original preload for future windows
    electron.ipcRenderer.send("bd-register-preload", preload);
    // Run original preload
    try {
        const originalKill = process.kill;
        process.kill = function() {};
        require(preload);
        process.kill = originalKill;
    }
    catch (e) {
        // TODO bail out
    }
}

Module.globalPaths.push(path.resolve(process.env.DISCORD_APP_PATH, "..", "app.asar", "node_modules"));
