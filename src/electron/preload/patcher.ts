import {webFrame} from "electron";


// TODO: could use better typing when this is rewritten
export default function () {
    const patcher = function () {
        const chunkName = "webpackChunkdiscord_app";
        const predefine = function<T extends object, K extends keyof T>(target: T, prop: K, effect: (v: T[K]) => void) {
            const value = target[prop];
            Object.defineProperty(target, prop, {
                get() {return value;},
                set(newValue) {
                    Object.defineProperty(target, prop, {
                        value: newValue,
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });

                    try {
                        effect(newValue);
                    }
                    catch (error) {
                        // eslint-disable-next-line no-console
                        console.error(error);
                    }


                    return newValue;
                },
                configurable: true
            });
        };

        if (!Reflect.has(window, chunkName)) {
            predefine(window, chunkName, instance => {
                instance.push([[Symbol()], {}, (require: any) => {
                    if (!require.b) return;

                    require.d = (target: object, exports: any) => {
                        for (const key in exports) {
                            if (!Reflect.has(exports, key)) continue;
                            if (Reflect.has(target, key)) continue;

                            try {
                                Object.defineProperty(target, key, {
                                    get: () => exports[key](),
                                    set: v => {exports[key] = () => v;},
                                    enumerable: true,
                                    configurable: true
                                });
                            }
                            catch (error) {
                                // eslint-disable-next-line no-console
                                console.error(error);
                            }
                        }
                    };

                    const IS_CLASSNAME_MODULE = /^\d+(?:e\d+)?\((.{1,3}),.{1,3},.{1,3}\){("use strict";)?\1.exports={.+}}$/;
                    const EXTRACT_CLASS = /^(.+?)_/;

                    function setter(newValue: any) {
                        if (IS_CLASSNAME_MODULE.test(String(newValue))) {

                            function className(this: any, module: any, exports: any, _require: any) {
                                if (newValue.__BD__) {
                                    newValue.__BD__.originalModule.call(this, module, exports, _require);
                                }
                                else {
                                    newValue.call(this, module, exports, _require);
                                }


                                if (!Object.values(module.exports).every((item) => typeof item === "string")) {
                                    if (newValue.__BD__) {
                                        newValue.__BD__.runListeners.call(this, module, exports, _require);
                                    }

                                    return;
                                }

                                const definers: PropertyDescriptorMap = {
                                    [Symbol.for("BetterDiscord.Polyfilled.class")]: {
                                        value: true
                                    }
                                };

                                for (const key in module.exports) {
                                    if (!Object.hasOwn(module.exports, key)) continue;

                                    const element = module.exports[key];

                                    if (typeof element === "string") {
                                        const match = element.match(EXTRACT_CLASS);

                                        if (!match) continue;
                                        if (match[1] in module.exports) continue;

                                        definers[match[1]] = {value: element, enumerable: true};
                                        definers[key] = {value: element, enumerable: false};
                                    }
                                }

                                Object.defineProperties(module.exports, definers);

                                if (newValue.__BD__) {
                                    newValue.__BD__.runListeners.call(this, module, exports, _require);
                                }
                            }

                            className.toString = () => newValue.toString();

                            return className;
                        }

                        return newValue;
                    }

                    const sym = Symbol.for("BetterDiscord.ModulesTest");

                    const fakeModule = require.m[sym] = () => {};
                    const isModulesProxied = fakeModule !== require.m[sym];

                    if (isModulesProxied) {
                        const definers: PropertyDescriptorMap = {};

                        for (const key in require.m) {
                            if (!Object.hasOwn(require.m, key)) continue;
                            if (Object.hasOwn(require.c, key)) continue;

                            definers[key] = {
                                value: setter(require.m[key]),
                                configurable: true,
                                writable: true,
                                enumerable: true
                            };
                        }

                        Object.defineProperties(require.m, definers);
                    }
                    else {
                        for (const key in require.m) {
                            if (!Object.hasOwn(require.m, key)) continue;
                            if (Object.hasOwn(require.c, key)) continue;

                            require.m[key] = setter(require.m[key]);
                        }
                    }

                    require.m = new Proxy(require.m, {
                        set(target, p, newValue, receiver) {
                            return Reflect.set(target, p, setter(newValue), receiver);
                        },
                    });
                }]);
            });
        }
    };

    webFrame.top?.executeJavaScript("(" + patcher + ")()");
}
