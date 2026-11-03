import JsonStore from "@stores/json";
import {ThemeValues} from "./values";
import {probeValues, releaseProbes} from "./probe";
import {writeSettingsTag} from "./tags";


/** How long a change waits for the next one before BD writes it to the page and to disk, in milliseconds. */
const applyDelay = 100;

/** The values users picked for theme settings, saved in `theme-settings.json` next to `themes.json`. */
const themeValues = new ThemeValues({
    load: () => JsonStore.get("theme-settings"),
    save: values => JsonStore.set("theme-settings", values),
    probe: (theme, entries) => probeValues(theme.id, theme.properties ?? [], entries),
    write: (theme, values) => writeSettingsTag(theme.slug, values),
    release: theme => releaseProbes(theme.id),
    schedule: (callback, delay) => {
        const timer = setTimeout(callback, delay);
        return () => clearTimeout(timer);
    },
    delay: applyDelay
});

// A reload or quit during the wait would otherwise lose the last change
window.addEventListener("beforeunload", () => themeValues.flush());

export default themeValues;
