import {Config} from "data";
import ContentManager from "./contentmanager";
import Settings from "./settingsmanager";
import DOMManager from "./dommanager";

import Toasts from "../ui/toasts";
import Modals from "../ui/modals";
import SettingsRenderer from "../ui/settings";

const path = require("path");

export default new class ThemeManager extends ContentManager {
    get name() {return "ThemeManager";}
    get moduleExtension() {return ".css";}
    get extension() {return ".theme.css";}
    get contentFolder() {return path.resolve(Config.dataPath, "themes");}
    get prefix() {return "theme";}

    initialize() {
        const errors = super.initialize();
        Settings.registerPanel("themes", "Themes", {element: () => SettingsRenderer.getContentPanel("Themes", this.contentList, this.state, {
            folder: this.contentFolder,
            onChange: this.toggleTheme.bind(this),
            reload: this.reloadTheme.bind(this),
            refreshList: this.updateThemeList.bind(this)
        })});
        return errors;
    }

    /* Aliases */
    updateThemeList() {return this.updateList();}
    loadAllThemes() {return this.loadAllContent();}

    enableTheme(idOrContent) {return this.enableContent(idOrContent);}
    disableTheme(idOrContent) {return this.disableContent(idOrContent);}
    toggleTheme(id) {return this.toggleContent(id);}

    unloadTheme(idOrFileOrContent) {return this.unloadContent(idOrFileOrContent);}

    loadTheme(filename) {
        const error = this.loadContent(filename);
        if (error) Modals.showContentErrors({themes: [error]});
    }

    reloadTheme(idOrFileOrContent) {
        const error = this.reloadContent(idOrFileOrContent);
        if (error) Modals.showContentErrors({themes: [error]});
    }

    /* Overrides */
    getContentModification(module, content, meta) {
        meta.css = content;
        return `module.exports = ${JSON.stringify(meta)};`;
    }

    startContent(id) {return this.addTheme(id);}
    stopContent(id) {return this.removeTheme(id);}

    addTheme(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        DOMManager.injectTheme(content.id, content.css);
        Toasts.show(`${content.name} v${content.version} has been applied.`);
    }

    removeTheme(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        DOMManager.removeTheme(content.id);
        Toasts.show(`${content.name} v${content.version} has been removed.`);
    }
};