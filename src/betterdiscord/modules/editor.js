import Logger from "@common/logger";

import DOMManager from "./dommanager";
import {getAllModules, webpackRequire} from "@webpack";

export default new class Editor {

    async initialize() {
        const baseUrl = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min";

        Object.defineProperty(window, "MonacoEnvironment", {
            value: {
                getWorker: (workerId) => new Worker(`data:text/javascript;charset=utf-8,${encodeURIComponent(`
                    self.MonacoEnvironment = {
                        baseUrl: '${baseUrl}'
                    };
                    importScripts('${baseUrl}/vs/base/worker/${workerId}');`
                )}`)
            }
        });

        const commonjsLoader = window.require;
        delete window.module; // Make monaco think this isn't a local node script or else it freaks out

        DOMManager.linkStyle("monaco-style", `${baseUrl}/vs/editor/editor.main.min.css`, {documentHead: true});

        try {
            // For some reason only version 0.20.0 of this works here
            await DOMManager.injectScript("monaco-script", "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/loader.min.js");

            const amdLoader = window.require; // Grab Monaco's amd loader
            window.require = commonjsLoader; // Revert to commonjs

            // Configure Monaco's AMD loader
            amdLoader.config({paths: {vs: `${baseUrl}/vs`}});
            amdLoader(["vs/editor/editor.main"], (monaco) => {
                /** @type {Map<PropertyKey, boolean>} true if its good */
                const seenIds = new Map();

                const getSuggestions = () => {
                    const modules = getAllModules((exports, module) => {
                        const value = seenIds.get(module.id);
                        if (typeof value === "boolean") {
                            return value;
                        }

                        const key = Object.keys(exports)[0];
                        const isGood = typeof exports[key] === "string" && exports[key].startsWith(`${key}_`);

                        seenIds.set(module.id, isGood);

                        return isGood;
                    }, {
                        searchDefault: false
                    });

                    const classes = new Set(modules.flatMap((classNames) => Object.values(classNames).flatMap(m => m.split(" "))));

                    classes.delete("");

                    return Array.from(classes, (className) => ({
                        label: `.${className}`,
                        kind: window.monaco.languages.CompletionItemKind.Class,
                        insertText: `.${className}`
                    }));
                };

                let suggestions = getSuggestions();
                monaco.languages.registerCompletionItemProvider("css", {
                    provideCompletionItems: () => {
                        const newSize = Object.keys(webpackRequire.c).length;

                        if (newSize === seenIds.size) {
                            suggestions = getSuggestions();
                        }

                        return {suggestions};
                    }
                });
            });
        }
        catch (e) {
            Logger.error("Editor", "Failed to load monaco editor", e);
        }
        finally {
            // Revert the global require to CommonJS
            window.require = commonjsLoader;
        }
    }
};