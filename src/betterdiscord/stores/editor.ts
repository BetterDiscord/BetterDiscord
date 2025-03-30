import {Stores} from "@webpack";
import Store from "./base";
import SettingsManager from "./settings";
import RemoteAPI from "@polyfill/remote";

export default new class EditorStore extends Store {
    constructor() {
        super();

        this.listener = this.listener.bind(this);

        SettingsManager.addChangeListener(this.listener);

        Stores.ThemeStore?.addChangeListener(this.listener);
        Stores.AccessibilityStore?.addChangeListener(this.listener);

        this.listener();

        RemoteAPI.editor.onLiveUpdateChange((state) => {
            SettingsManager.set("settings", "customcss", "liveUpdate", state);
        });
    }

    listener() {
        RemoteAPI.editor.updateSettings({
            options: this.getEditorOptions(),
            liveUpdate: SettingsManager.get("settings", "customcss", "liveUpdate"),
            discordTheme: Stores.ThemeStore?.theme || "dark"
        });

        this.emit();
    }

    getEditorOptions() {
        let theme = SettingsManager.get<"vs" | "vs-dark" | "hc-black" | "hc-light" | "system">("settings", "editor", "theme");

        if (theme === "system") {
            if (Stores.AccessibilityStore?.useForcedColors) theme = "hc-black";
            else theme = Stores.ThemeStore?.theme === "light" ? "vs" : "vs-dark";
        }

        return {
            theme,
            fontSize: SettingsManager.get("settings", "editor", "fontSize"),
            lineNumbers: SettingsManager.get("settings", "editor", "lineNumbers"),
            minimap: {enabled: SettingsManager.get("settings", "editor", "minimap")},
            hover: {enabled: SettingsManager.get("settings", "editor", "hover")},
            insertSpaces: SettingsManager.get("settings", "editor", "insertSpaces"),
            tabSize: Number(SettingsManager.get("settings", "editor", "tabSize")),
            quickSuggestions: {
                other: SettingsManager.get("settings", "editor", "quickSuggestions"),
                comments: SettingsManager.get("settings", "editor", "quickSuggestions"),
                strings: SettingsManager.get("settings", "editor", "quickSuggestions")
            },
            renderWhitespace: SettingsManager.get("settings", "editor", "renderWhitespace")
        };
    }
};