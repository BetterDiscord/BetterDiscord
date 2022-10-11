import fs from "fs";
import path from "path";
import Module from "module";

// const Module = require("module");
Module.globalPaths.push(path.resolve(process.env.DISCORD_APP_PATH, "..", "app.asar", "node_modules"));
// module.paths.push(path.resolve(process.env.DISCORD_APP_PATH, "..", "app.asar", "node_modules"));

Module._load = (load => (req, parent, isMain) => {
    if (req.includes("./") || req.includes("..")) return load(req, parent, isMain);
    const found = Module.globalPaths.find(m => fs.existsSync(path.resolve(m, req)));

    return found ? load(path.resolve(found, req), parent, isMain) : load(req, parent, isMain);
})(Module._load);

// const originalLoad = Module.prototype.load;
// Module.prototype.load = function() {
//     const returnValue = Reflect.apply(originalLoad, this, arguments);
//     console.log(this, arguments, returnValue);
//     return returnValue;
// };


// const nodeModulePaths = Module._nodeModulePaths;
// console.log(nodeModulePaths);
// Module._nodeModulePaths = (from) => {
//   return nodeModulePaths(from).concat([path.resolve(process.env.DISCORD_APP_PATH, "..", "app.asar", "node_modules")]);
// };

// console.log(Module._nodeModulePaths, Module._nodeModulePaths("request"));
// console.dir(Module);
// console.log(Object.keys(Module));
// console.log(require("request"));

export * as filesystem from "./filesystem";
export {default as https} from "./https";
export * as electron from "./electron";
export * as crypto from "./crypto";
export * as vm from "./vm";

// We can expose that without any issues.
export * as path from "path";
export * as net from "net"; // TODO: evaluate need and create wrapper
export * as os from "os";
