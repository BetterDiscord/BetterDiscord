import Logger from "@common/logger";

import DOMManager from "./dommanager";
import {getAllModules, webpackRequire} from "@webpack";
import Patcher from "./patcher";

import type Monaco from "monaco-editor";

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

interface BrowserClipboardServiceType {
    prototype: {
        readText: (t?: string) => string | Promise<string>;
    };
}
interface TextAreaInputControllerType {
    prototype: {
        _actual: HTMLElement;
        setSelectionRange(this: TextAreaInputControllerType["prototype"]): void;
    };
}

export default new class Editor {
    initPromise: Promise<void> | null = null;
    failedToLoad = false;

    async initialize() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = this.loadMonaco();
        return this.initPromise;
    }

    async loadMonaco() {
        Logger.log("Editor", "Loading Monaco Editor");
        const baseUrl = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${process.env.__MONACO_VERSION__}/min`;

        Object.defineProperty(window, "MonacoEnvironment", {
            value: {
                getWorker: (workerId, label) => new Worker(`data:text/javascript;charset=utf-8,${encodeURIComponent(`
                    self.MonacoEnvironment = {
                        baseUrl: '${baseUrl}'
                    };
                    importScripts('${baseUrl}/vs/base/worker/${workerId}');`
                )}`, {type: "classic", name: label})
            } as typeof window.MonacoEnvironment
        });

        const commonjsLoader = window.require;
        // @ts-expect-error Ts thinks this is bad
        delete window.module; // Make monaco think this isn't a local node script or else it freaks out

        DOMManager.linkStyle("monaco-style", `${baseUrl}/vs/editor/editor.main.min.css`, {documentHead: true});

        try {
            // For some reason only version 0.20.0 of this works here
            await DOMManager.injectScript("monaco-script", "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/loader.min.js");

            const amdLoader = window.require as unknown as ((modulesIds: string[], callback: (...modules: any[]) => void) => void) & {
                config: (config: any) => void;
            }; // Grab Monaco's amd loader
            window.require = commonjsLoader; // Revert to commonjs

            // Configure Monaco's AMD loader
            amdLoader.config({paths: {vs: `${baseUrl}/vs`}});
            const monaco = await new Promise<typeof Monaco>((res) => {
                amdLoader(["vs/editor/editor.main"], res);
            });
            const seenIds: Record<PropertyKey, boolean> = {};
            let size = 0;

            const getSuggestions = () => {
                const modules = getAllModules<Array<Record<string, string>>>((exports, module) => {
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

                const classes = new Set(modules.flatMap((classNames) => Object.values(classNames).flatMap(m => String(m).split(" "))));

                for (let index = 0; index < knownGlobalClasses.length; index++) {
                    classes.add(knownGlobalClasses[index]);
                }

                return classes;
            };

            let suggestions: Set<string>;
            monaco.languages.registerCompletionItemProvider("css", {
                provideCompletionItems: (model, position) => {
                    // Get text before cursor
                    const textBeforeCursor = model.getValueInRange(new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column));

                    // Ensure we are inside a selector context (not inside properties)
                    if (!textBeforeCursor.match(/^\s*\.[\w-]*$/)) {
                        return {suggestions: []}; // Don't show suggestions inside properties or elsewhere
                    }

                    const newSize = Object.keys(webpackRequire).length;
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

                    return {
                        suggestions: Array.from(classes, (className) => ({
                            label: `.${className}`,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: className,
                            range: suggestionsRange
                        }))
                    };
                }
            });

            amdLoader(["vs/platform/clipboard/browser/clipboardService"], ({BrowserClipboardService}: {BrowserClipboardService: BrowserClipboardServiceType;}) => {
                Patcher.instead("monaco-editor", BrowserClipboardService.prototype, "readText", (that: any, [type]: [type?: string], original: (t?: string) => void) => {
                    if (type) {
                        return original.call(that, type);
                    }

                    return Promise.resolve(DiscordNative.clipboard.read());
                });
            });
            amdLoader(["vs/editor/browser/controller/textAreaInput"], ({TextAreaWrapper}: {TextAreaWrapper: TextAreaInputControllerType;}) => {
                Patcher.instead("monaco-editor", TextAreaWrapper.prototype, "setSelectionRange", (that: any, args, original) => {
                    const domNode = (that as TextAreaInputControllerType["prototype"])._actual;

                    const undo = Patcher.instead("monaco-editor", HTMLElement.prototype, "focus", (node, _args, focus) => {
                        if (node === domNode) {
                            return focus.apply(node);
                        }
                    });

                    const ret = original.apply(that, args);

                    undo!();

                    return ret;
                });
            });

            // JS
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: false
            });
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ESNext,
                allowNonTsExtensions: true
            });

            // const libSource = `
            //     interface Webpack {}

            //     declare class BdApi {
            //         constructor(name: string) {}

            //         Webpack!: Webpack;
            //         static Webpack!: Webpack;
            //     }
            // `;

            // const libUri = "ts:filename/bdapi.d.ts";
            // monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
            // // When resolving definitions and references, the editor will try to use created models.
            // // Creating a model for the library allows "peek definition/references" commands to work with the library.
            // monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));
        }
        catch (e) {
            Logger.error("Editor", "Failed to load monaco editor", e);
            this.failedToLoad = true;
        }
        finally {
            // Revert the global require to CommonJS
            window.require = commonjsLoader;
        }
    }
};