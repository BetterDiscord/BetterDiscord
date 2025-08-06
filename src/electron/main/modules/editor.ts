import {BrowserWindow, dialog, shell, type BrowserWindowConstructorOptions, type WebContents} from "electron";
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

    // For eventually allow bd to have intellisense in the external window
    public static _options: BrowserWindowConstructorOptions | null;

    public static open(type: "theme" | "plugin", filename: string): WebContents;
    public static open(type: "custom-css"): WebContents;
    public static open(type: "custom-css" | "theme" | "plugin", filename?: string): WebContents {
        const openedViaWindow = !!this._options;

        let window = type === "custom-css" ? this.windows["custom-css"] : this.windows[type][filename!];
        if (openedViaWindow && window) {
            if (!window.webContents.isLoading()) {
                window.show();
            }

            // @ts-expect-error Not typed
            return this._options.webContents;
        }

        if (typeof window === "undefined" || window.isDestroyed()) {
            window = new BrowserWindow({
                ...this._options,
                frame: true,
                center: true,
                show: false,
                webPreferences: {
                    ...this._options?.webPreferences,
                    preload: path.join(__dirname, "editor/preload.js"),
                    sandbox: false,
                    allowRunningInsecureContent: true,
                    webSecurity: false
                }
            });

            this._options = null;

            window.setMenu(null);

            const url = pathToFileURL(path.join(__dirname, "editor/index.html"));
            url.searchParams.set("type", type);
            url.searchParams.set("filename", filename || "custom.css");

            if (openedViaWindow) {
                window.webContents.once("will-navigate", (e) => {
                    e.preventDefault();
                    window!.loadURL(url.href);

                    window!.once("ready-to-show", () => {
                        window!.show();
                    });
                });
            }
            else {
                window.once("ready-to-show", () => {
                    window!.show();
                });
                window.loadURL(url.href);
            }

            let shouldWarn = false;
            window.webContents.ipc.handle(IPCEvents.EDITOR_SHOULD_SHOW_WARNING, (_, $shouldWarn) => {
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

            window.webContents.ipc.handle(IPCEvents.EDITOR_SETTINGS_UPDATE, (_, liveUpdate) => {
                if (this._window) {
                    this._window.webContents.send(IPCEvents.EDITOR_SETTINGS_UPDATE, liveUpdate);
                }
            });

            window.webContents.setWindowOpenHandler((details) => {
                shell.openExternal(details.url);

                return {action: "deny"};
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

        return window.webContents;
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