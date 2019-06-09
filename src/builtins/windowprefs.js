import Builtin from "../structs/builtin";

const fs = require("fs");
const path = require("path");

export default new class WindowPrefs extends Builtin {
    get name() {return "WindowPrefs";}
    get category() {return "window";}
    get id() {return "transparency";}

    get WindowConfigFile() {
        if (this._windowConfigFile) return this._windowConfigFile;
        const electron = require("electron").remote.app;
        const base = electron.getAppPath();
        const roamingBase = electron.getPath("userData");
        const roamingLocation = path.resolve(roamingBase, electron.getVersion(), "modules", "discord_desktop_core", "injector", "config.json");
        const location = path.resolve(base, "..", "app", "config.json");
        const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
        if (!realLocation) return this._windowConfigFile = null;
        return this._windowConfigFile = realLocation;
    }

    enabled() {
        this.setWindowPreference("transparency", true);
        this.setWindowPreference("backgroundColor", null);
    }

    disabled() {
        this.setWindowPreference("transparency", false);
        this.setWindowPreference("backgroundColor", "#2f3136");
    }

    getAllWindowPreferences() {
        if (!this.WindowConfigFile) return {};
        return __non_webpack_require__(this.WindowConfigFile);
    }

    getWindowPreference(key) {
        if (!this.WindowConfigFile) return undefined;
        return this.getAllWindowPreferences()[key];
    }

    setWindowPreference(key, value) {
        if (!this.WindowConfigFile) return;
        const prefs = this.getAllWindowPreferences();
        prefs[key] = value;
        delete require.cache[this.WindowConfigFile];
        fs.writeFileSync(this.WindowConfigFile, JSON.stringify(prefs, null, 4));
    }
};