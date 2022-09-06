import path from "path";
import Module from "module";

Module.globalPaths.push(path.resolve(process.env.DISCORD_APP_PATH, "..", "app.asar", "node_modules"));

export * as filesystem from "./filesystem";
export * as https from "./https";
export * as electron from "./electron";
export * as crypto from "./crypto";

// We can expose that without any issues.
export * as path from "path";
export * as net from "net"; // TODO: evaluate need and create wrapper
export * as os from "os";