import {app} from "electron";
import path from "path";
import fs from "fs";
import {EventEmitter} from "events";
import {spawn} from "child_process";
import {fileURLToPath} from "url";
import {tmpdir} from "os";
import {randomUUID} from "crypto";
import migrateScript from "./migrate.sh";

const {log} = console;

const hostIndex = `
require(${JSON.stringify(path.join(__dirname, "main.js"))});
require("../betterdiscord.app.asar");
`;
const hostPackage = "{\"name\":\"discord\",\"main\":\"index.js\"}";

function retainOpenAsar() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ofs = require("original-fs") as typeof import("fs");

        const appPath = app.getAppPath();
        const source = ofs.statSync(appPath).isDirectory() ? path.join(appPath, "..", "betterdiscord.app.asar") : appPath;
        const copy = path.join(tmpdir(), `${randomUUID()}.asar`);

        ofs.copyFileSync(source, copy);

        return copy;
    }
    catch (e) {
        log(`Could not retain OpenAsar, only BetterDiscord will be kept: ${String(e)}`);
        return "no";
    }
}

function patchStagedHost(Updater: any) {
    const original = Updater.prototype._updateMacOSHostVersion;
    if (typeof original !== "function") return log("_updateMacOSHostVersion not found, skipping staged host patch");

    Updater.prototype._updateMacOSHostVersion = new Proxy(original, {
        apply(target, thisArg, argArray) {
            const [stagedApp] = argArray as [string];

            const result = Reflect.apply(target, thisArg, argArray);

            try {
                const request = JSON.parse(fs.readFileSync(path.join(app.getPath("userData"), "ShipIt_request.json"), "utf8")) as {
                    targetBundleURL: string;
                    useUpdateBundleName?: boolean;
                };

                const targetBundle = fileURLToPath(request.targetBundleURL);
                const installed = request.useUpdateBundleName ? path.join(path.dirname(targetBundle), path.basename(stagedApp)) : targetBundle;
                const version = JSON.parse(fs.readFileSync(path.join(stagedApp, "Contents", "Resources", "build_info.json"), "utf8")).version as string;

                const asarpath = thisArg._isoa ? retainOpenAsar() : "no";

                log(`ShipIt will install ${version} from ${stagedApp} to ${installed}`);

                spawn("/bin/sh", [
                    "-c", migrateScript,
                    "sh",
                    path.join(installed, "Contents", "Resources"),
                    version,
                    path.join(tmpdir(), "betterdiscord-migrate.lock"),
                    hostIndex,
                    hostPackage,
                    installed,
                    asarpath
                ], {detached: true, stdio: ["ignore", "inherit", "inherit"]}).unref();
            }
            catch (e) {
                log(`Could not schedule migration of the installed host: ${String(e)}`);
            }

            return result;
        }
    });
}

export function init() {
    const Emitter = EventEmitter as typeof EventEmitter & {init: (...args: any[]) => void;};

    let hasPatchedUpdater = false;
    Emitter.init = new Proxy(Emitter.init, {
        apply(target, thisArg, argArray) {
            if (thisArg?.constructor?.name === "Updater" && !hasPatchedUpdater) {
                hasPatchedUpdater = true;

                const Updater = thisArg.constructor;

                // https://github.com/GooseMod/OpenAsar/blob/5a44615cad9db23ae57573c498b26bae4e6e255b/src/updater/updater.js#L162
                if (!("_relaunchToNewHost" in Updater.prototype)) {
                    Updater.prototype._isoa = true;

                    let currentVersion: string | undefined;
                    try {
                        const buildInfoFile = path.resolve(app.getAppPath(), "..", "build_info.json");

                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        currentVersion = require(buildInfoFile).version;
                    }
                    catch {/* empty */}

                    // Disable all of oa's migration code
                    Updater.prototype._startCurrentVersionInner = function (options: any, versions: any) {
                        if (this.committedHostVersion == null) this.committedHostVersion = versions.current_host;

                        const next = path.resolve(this._getHostExePath());
                        if (currentVersion !== this.committedHostVersion.join(".") && !options?.allowObsoleteHost) {
                            this._updateMacOSHostVersion(next);

                            log("Updater", "Restarting", next);
                            return app.quit();
                        }

                        this._commitModulesInner(versions);
                    };
                }

                patchStagedHost(Updater);
            }

            return Reflect.apply(target, thisArg, argArray);
        }
    });
}
