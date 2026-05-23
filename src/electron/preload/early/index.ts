import Logger from "@common/logger";
import type {RawModule} from "../../../betterdiscord/types/discord/webpack";
import parseDeclarations from "@common/parseDeclarations";

const getPrefix = /^(.*?)\(/;
// Functions like ones from objects ({ a() {} }) will throw so we replace 'a' with 'function'
function toStringFunction(stringed: string): string {
    const match = stringed.match(getPrefix);

    if (!match || !match[1]) return stringed;

    if (match[1].includes("=>") && !/^[['"]/.test(match[1])) return stringed;

    return stringed.replace(match[1], "function");
}

(window.webpackChunkdiscord_app ??= [])
    .push([[Symbol()], {}, (require: any) => {
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

        const USES_STEMMER = /\((\d+)\)\.newStemmer\("[^"]+"\);/;

        function setter(original: RawModule, id: string | symbol): RawModule {
            if ((original.__BD__?.originalModule || original).__early_patched__) return original;

            const trueOriginal = original.__BD__?.originalModule || original;

            const originalStr = String(original);
            const isClassModule = IS_CLASSNAME_MODULE.test(originalStr);
            const useStemmerMatch = originalStr.match(USES_STEMMER);

            let rawModule: RawModule | null = null;
            function getRawModule() {
                if (rawModule) return rawModule;

                try {
                    const rawString = Function.prototype.toString.call(trueOriginal);

                    // Get the path of the module
                    const nameEnd = rawString.indexOf("(");
                    const moduleName = rawString.slice(0, nameEnd);
                    const nameNumber = Number(moduleName);
                    const path = isNaN(nameNumber) ? `misc/${moduleName}.js` : `${Math.floor(nameNumber / 1000)}/${nameNumber}.js`;

                    const moduleString = toStringFunction(rawString);
                    const vars = parseDeclarations(moduleString);
                    const functionBody = moduleString.indexOf(")") + 2;

                    // Add getters and setters for declarations
                    const varGettersAndSetters = vars.map((name) => `get ${name}(){return ${name}},set ${name}(_${name}){${name}=_${name}}`);
                    const declarationString = `Object.seal({__proto__:null,${varGettersAndSetters.join(",")}})`;

                    const stringedModule = `(function(){
    /*
        Module Id: ${typeof id === "symbol" ? `Symbol(${id.description})` : id}
        Exposed ${vars.length} variables
        Is Probably Class Module: ${isClassModule}
    */
    (${moduleString.slice(0, functionBody)}arguments[0].declarations=${declarationString};${moduleString.slice(functionBody)}).apply(this, arguments)
});
//# sourceURL=betterdiscord://BD/webpack-modules/patched/${path}`;

                    // eslint-disable-next-line no-eval
                    rawModule = (0, eval)(stringedModule);
                }
                catch (err) {
                    rawModule = trueOriginal;

                    Logger.error("WebpackModules", `Failed to parse module ${id.toString()} for patching, using original module instead.`, err instanceof Error ? err : new Error(String(err)));
                }

                return rawModule!;
            }
            // const usesStemmerMatch = originalStr.match(USES_STEMMER);

            function newModule(this: any, module: any, exports: any, webpackRequire: any) {
                try {
                    if (useStemmerMatch) {
                        const stemmerId = useStemmerMatch[1];

                        if (!webpackRequire.m[stemmerId]) {
                            Logger.debug("WebpackModules", `Injecting pseudo-stemmer module at id ${stemmerId} for module ${id.toString()}`);

                            webpackRequire.m[stemmerId] = (stemmerModule: any) => {
                                stemmerModule.exports.newStemmer = () => {
                                    return {
                                        stem(word: string) {
                                            if (typeof word !== "string") return word;

                                            // extremely basic "stemming"
                                            const w = word.toLowerCase();

                                            // common suffix stripping
                                            if (w.length > 4 && w.endsWith("ing")) return w.slice(0, -3);
                                            if (w.length > 3 && w.endsWith("ed")) return w.slice(0, -2);
                                            if (w.length > 3 && w.endsWith("ly")) return w.slice(0, -2);
                                            if (w.length > 2 && w.endsWith("s")) return w.slice(0, -1);

                                            return w;
                                        }
                                    };
                                };
                            };
                        }
                    }

                    getRawModule().call(this, module, exports, webpackRequire);

                    if (isClassModule) {
                        const definers: PropertyDescriptorMap = {
                            [Symbol.for("BetterDiscord.Polyfilled.class")]: {
                                value: true
                            }
                        };

                        for (const key in module.exports) {
                            if (!Object.hasOwn(module.exports, key)) continue;

                            const element = module.exports[key];

                            if (typeof element !== "string") return;

                            const match = element.match(EXTRACT_CLASS);

                            if (!match) continue;
                            if (match[1] in module.exports) continue;

                            definers[match[1]] = {value: element, enumerable: true};
                            definers[key] = {value: element, enumerable: false};
                        }

                        Object.defineProperties(module.exports, definers);
                    }
                }
                finally {
                    if (original.__BD__) {
                        original.__BD__.runListeners.call(this, module, exports, webpackRequire);
                    }

                    try {
                        if (
                            typeof module.exports === "object"
                            && module.exports !== null
                            && module.exports.createElement
                        ) {
                            requestIdleCallback(() => {
                                window.BetterDiscordRunRenderer();
                            });

                            // setTimeout(() => window.BetterDiscordRunRenderer(), 1000);
                        }
                    }
                    catch {/* empty */}
                }
            }

            newModule.toString = () => originalStr;
            newModule.__early_patched__ = true;
            newModule.__raw_module__ = getRawModule;

            return newModule;
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
                    value: setter(require.m[key], key),
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

                require.m[key] = setter(require.m[key], key);
            }
        }

        require.m = new Proxy(require.m, {
            set(target, p, newValue, receiver) {
                return Reflect.set(target, p, setter(newValue, p), receiver);
            },
        });
    }]);
