import type {Webpack} from "discord";
import Logger from "@common/logger";

export let webpackRequire: Webpack.Require;

export const lazyListeners = new Set<Webpack.Filter>();


let __ORIGINAL_PUSH__ = window.webpackChunkdiscord_app.push;

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

function handlePush(chunk: Webpack.ModuleWithoutEffect | Webpack.ModuleWithEffect) {
    const [, modules] = chunk;

    for (const moduleId in modules) {
        const originalModule = modules[moduleId];

        modules[moduleId] = (module, exports, require) => {
            try {
                Reflect.apply(originalModule, null, [module, exports, require]);

                const listeners = [...lazyListeners];
                for (let i = 0; i < listeners.length; i++) {
                    try {listeners[i](exports, module, module.id);}
                    catch (error) {
                        Logger.stacktrace("WebpackModules", "Could not fire callback listener:", error);
                    }
                }
            }
            catch (error) {
                Logger.stacktrace("WebpackModules", "Could not patch pushed module", error);
            }
            finally {
                require.m[moduleId] = originalModule;
            }
        };

        Object.assign(modules[moduleId], originalModule, {
            toString: () => originalModule.toString()
        });
    }

    return Reflect.apply(__ORIGINAL_PUSH__, window.webpackChunkdiscord_app, [chunk]);
}

window.webpackChunkdiscord_app.push([
    [Symbol("BetterDiscord")],
    {},
    (__webpack_require__: any) => {
        if ("b" in __webpack_require__) {
            webpackRequire = __webpack_require__;
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