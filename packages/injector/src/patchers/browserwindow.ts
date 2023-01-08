import electron from "electron/main";
import path from "path";

const preloadPath = path.resolve(__dirname, "preload.js");

class BrowserWindow extends electron.BrowserWindow {
    __originalPreload: string = "";

    constructor(options: Electron.BrowserWindowConstructorOptions) {
        // @ts-expect-error
        if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title) super(options);
        else {
            const originalPreload = <string>options.webPreferences.preload;
    
            options.webPreferences.preload = preloadPath;

            super(options);
    
            this.__originalPreload = originalPreload;
        }
    }
}

export default class BrowserWindowPatcher {
    public static apply(): void {
        const electronPath = require.resolve("electron");

        delete require.cache[electronPath]?.exports;
        (<any>require.cache[electronPath]).exports = {...electron, BrowserWindow};
    }
}
