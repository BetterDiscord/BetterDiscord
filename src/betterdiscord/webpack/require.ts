import type {Webpack} from "discord";
import Logger from "@common/logger";
import type {RawModule} from "../types/discord/webpack";
import Patcher from "@modules/patcher";

export let webpackRequire: Webpack.Require;

export const lazyListeners = new Set<Webpack.ModuleFilter>();

let __ORIGINAL_PUSH__ = (window.webpackChunkdiscord_app ??= []).push;

Object.defineProperty(window.webpackChunkdiscord_app, "push", {
    configurable: true,
    get: () => handlePush,
    set: (newPush) => {
        __ORIGINAL_PUSH__ = newPush;

        Object.defineProperty(window.webpackChunkdiscord_app, "push", {
            value: handlePush,
            configurable: true,
            writable: true
        });
    }
});

function listenToModules(modules: Record<PropertyKey, RawModule>) {
    for (const moduleId in modules) {
        if (!Reflect.has(modules, moduleId)) continue;
        if (Reflect.has(webpackRequire.c, moduleId)) continue;

        const originalModule = modules[moduleId];

        const runListeners: Webpack.RawModule = (module, exports, require) => {
            try {
                const listeners = [...lazyListeners];
                for (let i = 0; i < listeners.length; i++) {
                    try {listeners[i](exports, module, module.id);}
                    catch (error) {
                        Logger.stacktrace("WebpackModules", "Could not fire callback listener:", error as Error);
                    }
                }
            }
            catch (error) {
                Logger.stacktrace("WebpackModules", "Could not patch pushed module", error as Error);
            }
            finally {
                require.m[moduleId] = originalModule;
            }
        };

        const stringed = String(originalModule);

        modules[moduleId] = Object.assign(((module, exports, require) => {
            try {
                Reflect.apply(originalModule, null, [module, exports, require]);
            }
            finally {
                require.m[moduleId] = originalModule;
                runListeners(module, exports, require);
            }
        }) as RawModule, originalModule, {
            toString: () => stringed,
            __BD__: {runListeners, originalModule}
        });
    }
}

const {promise, resolve} = Promise.withResolvers<void>();
export const allModulesLoaded = promise;

let loadingModules = 1;
let moduleLoadTimeout: ReturnType<typeof setTimeout> | null = null;
requestIdleCallback(onLoadEnd);

function onLoadStart() {
    loadingModules++;
    if (moduleLoadTimeout) {
        clearTimeout(moduleLoadTimeout);
        moduleLoadTimeout = null;
    }
}

function onLoadEnd() {
    loadingModules--;
    if (loadingModules > 0) return;

    if (moduleLoadTimeout) clearTimeout(moduleLoadTimeout);
    moduleLoadTimeout = setTimeout(() => {
        resolve();
        Patcher.unpatchAll("WebpackRequire");
    }, 50);
}

function patchModuleLoading(require: Webpack.Require) {
    Patcher.after("WebpackRequire", require, "e", (_, __, loadPromise) => {
        onLoadStart();
        loadPromise.finally(onLoadEnd);
    });

    Patcher.before("WebpackRequire", require, "l", (_, args) => {
        onLoadStart();

        const onLoad = args[1];
        args[1] = function(event: Event) {
            onLoadEnd();
            onLoad.call(this, event);
        };
    });
}

function handlePush(chunk: Webpack.ModuleWithoutEffect | Webpack.ModuleWithEffect) {
    const [, modules] = chunk;
    listenToModules(modules);
    return Reflect.apply(__ORIGINAL_PUSH__, window.webpackChunkdiscord_app, [chunk]);
}

window.webpackChunkdiscord_app.push([
    [Symbol("BetterDiscord")],
    {},
    (__webpack_require__: any) => {
        if ("b" in __webpack_require__) {
            webpackRequire = __webpack_require__;
            listenToModules(__webpack_require__.m);
            patchModuleLoading(__webpack_require__);
        }
    }
]);

export const modules = new Proxy({} as Webpack.Require["m"], {
    ownKeys() {return Object.keys(webpackRequire.m);},
    getOwnPropertyDescriptor() {
        return {
            enumerable: true,
            configurable: true, // Not actually
        };
    },
    get(_, k) {
        return webpackRequire.m[k];
    },
    set() {
        throw new Error("[WebpackModules~modules] Setting modules is not allowed.");
    }
});