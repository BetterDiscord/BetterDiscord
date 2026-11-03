import JsonStore from "@stores/json";
import {ThemeValues} from "./values";
import {probeValues, releaseProbes} from "./probe";
import {writeSettingsTag} from "./tags";


/** The values users picked for theme settings, saved in `theme-settings.json` next to `themes.json`. */
const themeValues = new ThemeValues({
    load: () => JsonStore.get("theme-settings"),
    save: values => JsonStore.set("theme-settings", values),
    probe: (theme, entries) => probeValues(theme.id, theme.properties ?? [], entries),
    write: (theme, values) => writeSettingsTag(theme.slug, values),
    release: theme => releaseProbes(theme.id),
    requestFrame: callback => requestAnimationFrame(callback),
    saveDelay: 500
});

// A reload or quit inside the save delay would otherwise lose the last change
window.addEventListener("beforeunload", () => themeValues.flush());

export default themeValues;
