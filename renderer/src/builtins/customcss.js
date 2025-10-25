import fs from "fs";
import electron from "electron";

import Builtin from "@structs/builtin";

import Settings from "@modules/settingsmanager";
import DataStore from "@modules/datastore";
import React from "@modules/react";
import WebpackModules from "@modules/webpackmodules";
import Events from "@modules/emitter";
import DOMManager from "@modules/dommanager";
import Strings from "@modules/strings";
import DiscordModules from "@modules/discordmodules";
import Utilities from "@modules/utilities";

import CSSEditor from "@ui/customcss/csseditor";
import FloatingWindows from "@ui/floatingwindows";
import SettingsTitle from "@ui/settings/title";
import {SettingsTitleContext} from "@ui/settings";
import EditIcon from "@ui/icons/edit";

const UserSettings = WebpackModules.getByProps("updateAccount");

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
        const CustomCSSPage = () => {
            const set = React.useContext(SettingsTitleContext);

            if (set) {
                set({title: Strings.CustomCSS.editorTitle});
            }
        
            return [
                !set && <SettingsTitle text={Strings.CustomCSS.editorTitle} />,
                React.createElement(CSSEditor, {
                    css: this.savedCss,
                    save: this.saveCSS.bind(this),
                    update: this.insertCSS.bind(this),
                    openNative: this.openNative.bind(this),
                    openDetached: this.openDetached.bind(this),
                    onChange: this.onChange.bind(this)
                })
            ]
        }

        Settings.registerPanel(this.id, Strings.Panels.customcss, {
            order: 2,
            icon: EditIcon,
            element: () => <CustomCSSPage />,
            onClick: (thisObject) => {
                if (this.isDetached) return;
                if (this.nativeOpen) return this.openNative();
                else if (this.startDetached) return this.openDetached(this.savedCss);
                const settingsView = Utilities.findInTree(thisObject._reactInternals, m => m && m.onSetSection, {walkable: ["child", "memoizedProps", "props", "children"]});
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
        this.insertCSS("");
    }

    watchContent() {
        if (this.watcher) return this.error("Already watching custom css.");
        const timeCache = {};
        this.log("Starting to watch custom css.");
        this.watcher = fs.watch(DataStore.customCSS, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename) return;
            await new Promise(r => setTimeout(r, 100));
            try {fs.statSync(DataStore.customCSS);}
            catch (err) {
                if (err.code !== "ENOENT") return;
                delete timeCache[filename];
                this.saveCSS("");
            }
            const stats = fs.statSync(DataStore.customCSS);
            if (!stats || !stats.mtimeMs) return;
            if (typeof(stats.mtimeMs) !== "number") return;
            if (timeCache[filename] == stats.mtimeMs) return;
            timeCache[filename] = stats.mtimeMs;
            if (eventType == "change") {
                const oldCSS = this.savedCss;
                this.loadCSS();
                if (oldCSS === this.savedCss) return;
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

    open() {
        if (this.isDetached) return;
        if (this.nativeOpen) return this.openNative();
        else if (this.startDetached) return this.openDetached(this.savedCss);
        return UserSettings?.open?.(this.id);
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
            onChange: Utilities.debounce(this.onChange.bind(this), 500)
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
        DiscordModules.Dispatcher?.dispatch({type: "LAYER_POP"});
    }
};