import {webFrame} from "electron";


export default function () {
    const patcher = function () {
        const chunkName = "webpackChunkdiscord_app";
        const predefine = function (target, prop, effect) {
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

                    // eslint-disable-next-line no-setter-return
                    return newValue;
                },
                configurable: true
            });
        };

        if (!Reflect.has(window, chunkName)) {
            predefine(window, chunkName, instance => {
                instance.push([[Symbol()], {}, require => {
                    require.d = (target, exports) => {
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
                }]);
            });
        }
    };

    webFrame.top.executeJavaScript("(" + patcher + ")()");
}
