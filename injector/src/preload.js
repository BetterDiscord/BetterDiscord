const Module = require("module");
const path = require("path");
const electron = require("electron");

/* global window:false */

// const context = electron.webFrame.top.context;
Object.defineProperty(window, "webpackJsonp", {
    get: () => electron.webFrame.top.context.webpackJsonp
});

electron.webFrame.top.context.global = electron.webFrame.top.context;
electron.webFrame.top.context.require = require;
electron.webFrame.top.context.process = process;
electron.webFrame.top.context.Buffer = Buffer;

// Load Discord's original preload
const preload = process.env.DISCORD_PRELOAD;
if (preload) {

    // Restore original preload for future windows
    process.electronBinding("command_line").appendSwitch("preload", preload);

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
