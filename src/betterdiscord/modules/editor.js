import Logger from "@common/logger";

import DOMManager from "./dommanager";
import {getAllModules, webpackRequire} from "@webpack";

// List of all global classNames (from the app helmet stuff)
const knownGlobalClasses = [
    "theme-dark",
    "theme-light",
    "theme-darker",
    "theme-midnight",
    "full-motion",
    "show-redesigned-icons",
    "visual-refresh",
    "visual-refresh-chat-input",
    "images-dark",
    "images-light",
    // There is a chance that there are more of these. But discords code only indicates theres 1
    "density-compact",
    "font-size-12",
    "font-size-14",
    "font-size-16",
    "font-size-15",
    "font-size-16",
    "font-size-18",
    "font-size-20",
    "font-size-24",
    "platform-win",
    "platform-osx",
    "platform-linux",
    "platform-web",
    "platform-overlay",
    "mouse-mode",
    "keyboard-mode",
    "app-focused",
    "bd-transparency",
    "bd-frame",
    "enable-motion",
    "underline-links",
    "confetti-mode",
    "reduce-motion",
    "is-mobile",
    "desaturate-user-colors",
    "disable-forced-colors",
    "enable-forced-colors",
    "overlay",
    "has-webkit-scrollbar",
    "no-webkit-scrollbar",
    "decorate-links",
    "low-saturation"
];

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
                /** @type {Record<PropertyKey, boolean>} true if its good */
                const seenIds = {};
                let size = 0;

                const getSuggestions = () => {
                    const modules = getAllModules((exports, module) => {
                        let isGood = seenIds[module.id];

                        if (typeof isGood === "undefined") {
                            const key = Object.keys(exports)[0];
                            isGood = typeof exports[key] === "string" && exports[key].startsWith(`${key}_`);

                            seenIds[module.id] = isGood;
                        }

                        return isGood;
                    }, {
                        searchDefault: false
                    });

                    const classes = new Set(modules.flatMap((classNames) => Object.values(classNames).flatMap(m => m.split(" "))));

                    for (let index = 0; index < knownGlobalClasses.length; index++) {
                        classes.add(knownGlobalClasses[index]);
                    }

                    return classes;
                };

                let suggestions;
                monaco.languages.registerCompletionItemProvider("css", {
                    provideCompletionItems: (model, position) => {
                        // Get text before cursor
                        const textBeforeCursor = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));

                        // Ensure we are inside a selector context (not inside properties)
                        if (!textBeforeCursor.match(/^\s*\.[\w-]*$/)) {
                            return {suggestions: []}; // Don't show suggestions inside properties or elsewhere
                        }

                        const newSize = Object.keys(webpackRequire.c).length;

                        if (newSize !== size) {
                            suggestions = getSuggestions();
                            size = newSize;
                        }

                        const classes = new Set(suggestions);
                        for (const element of (document.all ?? document.querySelectorAll("*"))) {
                            if (element instanceof Element) {
                                const classList = element.classList.value.split(" ");

                                for (let index = 0; index < classList.length; index++) {
                                    classes.add(classList[index]);
                                }
                            }
                        }

                        classes.delete("");

                        const suggestionsRange = monaco.Range.fromPositions(position);

                        const classSuggestions = Array.from(classes, (className) => ({
                            label: `.${className}`,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: className,
                            range: suggestionsRange,
                            preselect: true
                        }));

                        return {
                            suggestions: [].concat(classSuggestions)
                        };
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