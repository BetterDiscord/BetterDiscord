import {webFrame} from "electron";


// TODO: could use better typing when this is rewritten
export default function () {
    const patcher = function () {
        const chunkName = "webpackChunkdiscord_app";
        const predefine = function (target: object, prop: keyof typeof target, effect: (v: any) => void) {
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
            // @ts-expect-error cba
            predefine(window, chunkName, instance => {
                instance.push([[Symbol()], {}, (require: any) => {
                    require.d = (target: object, exports: any) => {
                        for (const key in exports) {
                            if (!Reflect.has(exports, key)) continue;

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
                                newValue.call(this, module, exports, _require);

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

                                        definers[match[1]] = {value: element};
                                    }
                                }

                                Object.defineProperties(module.exports, definers);
                            }

                            className.toString = newValue.toString;

                            return className;
                        }

                        return newValue;
                    }

                    for (const key in require.m) {
                        if (!Object.hasOwn(require.m, key)) continue;

                        require.m[key] = setter(require.m[key]);
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
