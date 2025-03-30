import {BrowserWindow, dialog} from "electron";
import path from "path";
import {pathToFileURL} from "url";
import * as IPCEvents from "@common/constants/ipcevents";

interface Windows {
    "custom-css"?: BrowserWindow,
    theme: Record<string, BrowserWindow>,
    plugin: Record<string, BrowserWindow>,
}

export default class Editor {
    private static windows: Windows = {theme: {}, plugin: {}};

    public static open(type: "theme" | "plugin", filename: string): void;
    public static open(type: "custom-css"): void;
    public static open(type: "custom-css" | "theme" | "plugin", filename?: string): void {
        let window = type === "custom-css" ? this.windows["custom-css"] : this.windows[type][filename!];
        if (typeof window === "undefined" || window.isDestroyed()) {
            window = new BrowserWindow({
                frame: true,
                center: true,
                show: false,
                webPreferences: {
                    preload: path.join(__dirname, "editor/preload.js"),
                    sandbox: false
                }
            });

            window.setMenuBarVisibility(false);

            window.once("ready-to-show", () => {
                window!.show();
            });

            const url = pathToFileURL(path.join(__dirname, "editor/index.html"));
            url.searchParams.set("type", type);
            url.searchParams.set("filename", filename || "custom.css");
            window.loadURL(url.href);

            let shouldWarn = false;
            window.webContents.ipc.handle(IPCEvents.EDITOR_SHOULD_SHOW_WARNING, (event, $shouldWarn) => {
                shouldWarn = $shouldWarn;
            });

            window.on("close", (event) => {
                if (!shouldWarn) return;

                event.preventDefault();

                const result = dialog.showMessageBoxSync(window!, {
                    type: "question",
                    title: "Close Editor?",
                    message: "Changes you made are not saved",
                    buttons: ["Close", "Cancel"],
                    cancelId: 1,
                    defaultId: 1,
                    normalizeAccessKeys: true
                });

                if (!result) {
                    shouldWarn = false;
                    window!.close();
                }
            });

            window.webContents.ipc.handle(IPCEvents.EDITOR_SETTINGS_UPDATE, (event, liveUpdate) => {
                if (this._window) {
                    this._window.webContents.send(IPCEvents.EDITOR_SETTINGS_UPDATE, liveUpdate);
                }
            });

            if (this._window) {
                const listener = () => {
                    shouldWarn = false;
                    window!.close();
                };

                this._window.once("closed", listener);
                window.once("close", () => {
                    this._window.off("closed", listener);

                    if (type === "custom-css") {
                        delete this.windows["custom-css"];
                    }
                    else {
                        delete this.windows[type][filename!];
                    }
                });
            }

            if (type === "custom-css") {
                this.windows["custom-css"] = window;
            }
            else {
                this.windows[type][filename!] = window;
            }
        }

        if (!window.webContents.isLoading()) {
            window.show();
        }
    }

    private static isValidWindow(item: any): item is BrowserWindow {
        return item instanceof BrowserWindow && !item.isDestroyed();
    }

    static #settings = {
        options: {theme: "vs-dark"},
        liveUpdate: false,
        discordTheme: "dark"
    };
    public static updateSettings(settings: any) {
        this.#settings = settings;

        if (this.isValidWindow(this.windows["custom-css"])) {
            this.windows["custom-css"].webContents.send(IPCEvents.EDITOR_SETTINGS_UPDATE, settings);
        }

        for (const type of ["theme", "plugin"] as const) {
            for (const key in this.windows[type]) {
                if (Object.prototype.hasOwnProperty.call(this.windows[type], key)) {
                    const window = this.windows[type][key];

                    if (this.isValidWindow(window)) {
                        window.webContents.send(IPCEvents.EDITOR_SETTINGS_UPDATE, settings);
                    }
                }
            }
        }
    }
    public static getSettings() {
        return this.#settings;
    }

    private static _window: BrowserWindow;
    public static initialize(window: BrowserWindow) {
        this._window = window;
    }
}