import fs from "fs";
import path from "path";
import electron from "electron";

import Builtin from "@structs/builtin";

import Settings from "@stores/settings";
import Config from "@stores/config";
import React from "@modules/react";
import Events from "@modules/emitter";
import DOMManager from "@modules/dommanager";
import {t} from "@common/i18n";
import DiscordModules from "@modules/discordmodules";

import CSSEditor from "@ui/customcss/csseditor";
import FloatingWindows from "@ui/floatingwindows";
import SettingsTitle from "@ui/settings/title";
import {getByKeys} from "@webpack";
import {debounce, findInTree} from "@common/utils";


const UserSettings = getByKeys(["updateAccount"]);

export default new class CustomCSS extends Builtin {
    get name() {return "Custom CSS";}
    get category() {return "customcss";}
    get id() {return "customcss";}
    get startDetached() {return Settings.get(this.collection, this.category, "openAction") == "detached";}
    get nativeOpen() {return Settings.get(this.collection, this.category, "openAction") == "system";}
    get file() {return path.resolve(Config.get("channelPath"), "custom.css");}

    constructor() {
        super();
        this.savedCss = "";
        this.insertedCss = "";
        this.isDetached = false;
    }

    async enabled() {
        Settings.registerPanel(this.id, t("Panels.customcss"), {
            order: 2,
            element: () => [<SettingsTitle text={t("CustomCSS.editorTitle")} />, React.createElement(CSSEditor, {
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
                else if (this.startDetached) return this.openDetached(this.savedCss);
                const settingsView = findInTree(thisObject._reactInternals, m => m && m.onSetSection, {walkable: ["child", "memoizedProps", "props", "children"]});
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
        if (this.watcher) return this.error("Already watching content.");
        const timeCache = {};
        this.log("Starting to watch content.");
        this.watcher = fs.watch(this.file, {persistent: false}, async (eventType, filename) => {
            if (!eventType || !filename) return;
            await new Promise(r => setTimeout(r, 50));
            try {fs.statSync(this.file);}
            catch (err) {
                if (err.code !== "ENOENT") return;
                delete timeCache[filename];
                this.saveCSS("");
            }
            const stats = fs.statSync(this.file);
            if (!stats || !stats.mtimeMs) return;
            if (typeof (stats.mtimeMs) !== "number") return;
            if (timeCache[filename] == stats.mtimeMs) return;
            timeCache[filename] = stats.mtimeMs;
            if (eventType == "change") {
                const newCSS = this.loadCSS();
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
        try {
            this.savedCss = fs.readFileSync(this.file).toString();
        }
        catch {
            this.savedCss = "";
        }
    }

    insertCSS(newCss) {
        if (typeof (newCss) === "undefined") newCss = this.insertedCss;
        else this.insertedCss = newCss;
        DOMManager.updateCustomCSS(newCss);
    }

    saveCSS(newCss) {
        if (typeof (newCss) !== "undefined") this.savedCss = newCss;
        fs.writeFileSync(this.file, this.savedCss);
    }

    open() {
        if (this.isDetached) return;
        if (this.nativeOpen) return this.openNative();
        else if (this.startDetached) return this.openDetached(this.savedCss);
        return UserSettings?.open?.(this.id);
    }

    openNative() {
        electron.shell.openExternal(`file://${this.file}`);
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
            onChange: debounce(this.onChange.bind(this), 500)
        });

        FloatingWindows.open({
            onClose: () => {
                this.isDetached = false;
            },
            onResize: () => {
                if (!editorRef || !editorRef.current || !editorRef.current.resize) return;
                editorRef.current.resize();
            },
            title: t("CustomCSS.editorTitle"),
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
            confirmationText: t("CustomCSS.confirmationText")
        });
        this.isDetached = true;
        UserSettings.close();
        DiscordModules.Dispatcher?.dispatch({type: "LAYER_POP"});
    }
};