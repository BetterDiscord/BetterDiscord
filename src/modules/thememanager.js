import {Config} from "data";
import ContentManager from "./contentmanager";
import Utilities from "./utilities";
import {Modals} from "ui";

const path = require("path");

export default new class ThemeManager extends ContentManager {
    get name() {return "ThemeManager";}
    get moduleExtension() {return ".css";}
    get extension() {return ".theme.css";}
    get contentFolder() {return path.resolve(Config.dataPath, "themes");}
    get prefix() {return "theme";}

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

    reloadTheme(filename) {
        const error = this.reloadContent(filename);
        if (error) Modals.showContentErrors({themes: [error]});
    }

    /* Overrides */
    getContentModification(module, content, meta) {
        meta.css = content.split("\n").slice(1).join("\n");
        return `module.exports = ${JSON.stringify(meta)};`;
    }    

    startContent(id) {return this.addTheme(id);}
    stopContent(id) {return this.removeTheme(id);}

    addTheme(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        const style = document.createElement("style");
        style.id = Utilities.escapeID(content.id);
        style.textContent = unescape(content.css);
        document.head.append(style);
        content.element = style;
    }

    removeTheme(idOrContent) {
        const content = typeof(idOrContent) == "string" ? this.contentList.find(p => p.id == idOrContent) : idOrContent;
        if (!content) return;
        const element = content.element || document.getElementById(Utilities.escapeID(content.id));
        if (element) element.remove();
    }
};