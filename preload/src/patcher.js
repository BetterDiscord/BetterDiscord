import {webFrame} from "electron";

export default function () {
    const patcher = function () {
        const chunkName = "webpackChunkdiscord_app";
        const predefine = function (target, prop, effect) {
            const value = target[prop];
            Object.defineProperty(target, prop, {
                get() {return value;},
                set(value) {
                    Object.defineProperty(target, prop, {
                        value,
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });

                    try {
                        effect(value);
                    } catch (error) {
                        console.error(error);
                    }

                    return value;
                },
                configurable: true
            });
        };
        
        if (!Reflect.has(window, chunkName)) {
            predefine(window, chunkName, instance => {
                predefine(instance, "push", () => {
                    instance.push([[Symbol()], {}, require => {
                        require.d = (target, exports) => {
                            for (const key in exports) {
                                if (!Reflect.has(exports, key) || target[key]) continue;
        
                                Object.defineProperty(target, key, {
                                    get: exports[key],
                                    enumerable: true,
                                    configurable: true
                                });
                            }
                        }
                    }]);
        
                    instance.pop();
                });
            });
        }
    };
    
    webFrame.top.executeJavaScript("(" + patcher + ")()");
}
