import Builtin from "../structs/builtin";
import {Settings, DataStore, React, WebpackModules, Events, DOMManager, Strings} from "modules";
import CSSEditor from "../ui/customcss/csseditor";
import FloatingWindows from "../ui/floatingwindows";
import SettingsTitle from "../ui/settings/title";
import Utilities from "../modules/utilities";

const fs = require("fs");
const electron = require("electron");
const UserSettings = WebpackModules.getByProps("updateAccount");
const Dispatcher = WebpackModules.getByProps("dirtyDispatch");
const ActionTypes = WebpackModules.getByProps("ActionTypes").ActionTypes;

export default new class CustomCSS extends Builtin {
    get name() {return "Custom CSS";}
    get category() {return "customcss";}
    get id() {return "customcss";}
    get startDetached() {return Settings.get(this.collection, this.category, "openAction") == "detached";}
    get nativeOpen() {return Settings.get(this.collection, this.category, "openAction") == "system";}

    constructor() {
        super();
        this.savedCss = "";
        this.insertedCss = "";
        this.isDetached = false;
    }

    async enabled() {
        // if (!window.ace) {
        //     DOMManager.injectScript("ace-script", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js").then(() => {
        //         if (window.require.original) window.require = window.require.original;
        //     });
        // }


        Object.defineProperty(window, "MonacoEnvironment", {
            value: {
                getWorkerUrl: function() {
                    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                        self.MonacoEnvironment = {
                            baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min'
                        };
                        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/base/worker/workerMain.min.js');`
                    )}`;
                }
            }
        });

        const commonjsLoader = window.require;
        delete window.module; // Make monaco think this isn't a local node script or else it freaks out
        DOMManager.linkStyle("monaco-style", "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/editor/editor.main.min.css", {documentHead: true});
        DOMManager.injectScript("monaco-script", "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/loader.min.js").then(() => {
            const amdLoader = window.require; // Grab Monaco's amd loader
            window.require = commonjsLoader; // Revert to commonjs
            amdLoader.config({paths: {vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs"}});
            amdLoader(["vs/editor/editor.main"], () => {}); // exposes the monaco global
        });


        Settings.registerPanel(this.id, Strings.Panels.customcss, {
            order: 2,
            element: () => [<SettingsTitle text={Strings.CustomCSS.editorTitle} />, React.createElement(CSSEditor, {
                css: this.savedCss,
                save: this.saveCSS.bind(this),
                update: this.insertCSS.bind(this),
                openNative: this.openNative.bind(this),
                openDetached: this.openDetached.bind(this),
                onChange: this.onChange.bind(this)
            })],
            onClick: (thisObject) => {
                if (this.isDetached) return;
                if (this.nativeOpen) return this.openNative();
                else if (this.startDetached) return this.openDetached();
                const settingsView = Utilities.findInRenderTree(thisObject._reactInternalFiber, m => m && m.onSetSection, {walkable: ["child", "memoizedProps", "props", "children"]});
                if (settingsView && settingsView.onSetSection) settingsView.onSetSection(this.id);
            }
        });
        this.loadCSS();
        this.insertCSS(this.savedCss);
        this.watchContent();
    }

    disabled() {
        Settings.removePanel(this.id);
        this.unwatchContent();
    }

    watchContent() {
        if (this.watcher) return this.error("Already watching content.");
        const timeCache = {};
        this.log("Starting to watch content.");
        this.watcher = fs.watch(DataStore.customCSS, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename) return;
            await new Promise(r => setTimeout(r, 50));
            try {fs.statSync(DataStore.customCSS);}
            catch (err) {
                if (err.code !== "ENOENT") return;
                delete timeCache[filename];
                this.saveCSS("");
            }
            const stats = fs.statSync(DataStore.customCSS);
            if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
            if (typeof(stats.mtime.getTime()) !== "number") return;
            if (timeCache[filename] == stats.mtime.getTime()) return;
            timeCache[filename] = stats.mtime.getTime();
            if (eventType == "change") {
                const newCSS = DataStore.loadCustomCSS();
                if (newCSS == this.savedCss) return;
                this.savedCss = newCSS;
                this.insertCSS(this.savedCss);
                Events.emit("customcss-updated", this.savedCss);
            }
        });
    }

    unwatchContent() {
        if (!this.watcher) return this.error("Was not watching content.");
        this.watcher.close();
        delete this.watcher;
        this.log("No longer watching content.");
    }

    onChange(value) {
        if (!Settings.get("settings", "customcss", "liveUpdate")) return;
        this.insertCSS(value);
        this.saveCSS(value);
    }

    loadCSS() {
        this.savedCss = DataStore.loadCustomCSS();
    }

    insertCSS(newCss) {
        if (typeof(newCss) === "undefined") newCss = this.insertedCss;
        else this.insertedCss = newCss;
        DOMManager.updateCustomCSS(newCss);
    }

    saveCSS(newCss) {
        if (typeof(newCss) !== "undefined") this.savedCss = newCss;
        DataStore.saveCustomCSS(this.savedCss);
    }

    openNative() {
        electron.shell.openExternal(`file://${DataStore.customCSS}`);
    }

    openDetached(currentCSS) {
        const editorRef = React.createRef();
        const editor = React.createElement(CSSEditor, {
            id: "bd-floating-editor",
            ref: editorRef,
            css: currentCSS,
            save: this.saveCSS.bind(this),
            update: this.insertCSS.bind(this),
            openNative: this.openNative.bind(this),
            onChange: this.onChange.bind(this)
        });

        FloatingWindows.open({
            onClose: () => {
                this.isDetached = false;
            },
            onResize: () => {
                if (!editorRef || !editorRef.current || !editorRef.current.resize) return;
                editorRef.current.resize();
            },
            title: Strings.CustomCSS.editorTitle,
            id: "floating-editor-window",
            height: 470,
            width: 410,
            center: true,
            resizable: true,
            children: editor,
            confirmClose: () => {
                if (!editorRef || !editorRef.current) return false;
                if (Settings.get("settings", "customcss", "liveUpdate")) return false;
                return editorRef.current.hasUnsavedChanges;
            },
            confirmationText: Strings.CustomCSS.confirmationText
        });
        this.isDetached = true;
        UserSettings.close();
        Dispatcher.dirtyDispatch({type: ActionTypes.LAYER_POP});
    }
};