import path from "path";
import fs from "@polyfill/fs";
import Config from "@stores/config";
import JsonStore from "@stores/json";
import Logger from "@common/logger";
import {ThemeValues} from "./values";
import {ThemeImages, probeWithImages} from "./images";
import {probeValues, releaseProbes} from "./probe";
import {writeSettingsTag} from "./tags";


/** How long a change waits for the next one before BD writes it to the page and to disk, in milliseconds. */
const applyDelay = 100;

/** The images users picked for `<url>` settings, copied into `theme-images` next to `theme-settings.json`. */
export const themeImages = new ThemeImages({
    folder: path.resolve(Config.get("channelPath"), "theme-images"),
    readFile: file => fs.readFileSync(file, null) as Uint8Array,
    writeFile: (file, bytes) => fs.writeFileSync(file, bytes),
    deleteFile: file => fs.unlinkSync(file),
    fileSize: file => fs.statSync(file).size,
    listFiles: folder => (fs.existsSync(folder) ? fs.readdirSync(folder) as string[] : []),
    makeFolder: folder => fs.mkdirSync(folder, {recursive: true}),
    createObjectURL: blob => URL.createObjectURL(blob),
    revokeObjectURL: url => URL.revokeObjectURL(url),
    randomName: () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, "0")).join("")
});

/** The values users picked for theme settings, saved in `theme-settings.json` next to `themes.json`. */
const themeValues = new ThemeValues({
    load: () => JsonStore.get("theme-settings"),
    save: values => {
        JsonStore.set("theme-settings", values);
        themeImages.sweep(values);
    },
    probe: (theme, entries) => probeWithImages(
        themeImages,
        entries,
        rest => probeValues(theme.id, theme.properties ?? [], rest),
        setting => Logger.warn("ThemeManager", `${theme.name}: the image picked for ${setting.property} is missing from BetterDiscord's data folder, so the setting uses its default.`)
    ),
    write: (theme, values) => writeSettingsTag(theme.slug, themeImages.resolve(values)),
    release: theme => {
        releaseProbes(theme.id);

        // Every image on the page is also saved, so the saved values name every image to free
        themeImages.release(themeValues.getSaved(theme.id));
    },
    schedule: (callback, delay) => {
        const timer = setTimeout(callback, delay);
        return () => clearTimeout(timer);
    },
    delay: applyDelay
});

// A reload or quit during the wait would otherwise lose the last change
window.addEventListener("beforeunload", () => themeValues.flush());

export default themeValues;
