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
                }]);
            });
        }
    };

    webFrame.top?.executeJavaScript("(" + patcher + ")()");
}
