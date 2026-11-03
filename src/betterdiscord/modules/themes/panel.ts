import {hasThemeSettings} from "./settings";
import type {Theme} from "@modules/thememanager";
import type {ThemeSetting} from "./types";


/** Settings that share a `group`, under that group's heading. */
export interface ThemeSettingGroup {
    name: string;
    settings: ThemeSetting[];
}

/**
 * Whether a theme's card gets a settings button. A theme that has started knows its settings, and it keeps them
 * after it stops. A theme that hasn't started yet only has its source, so the check falls back to the text.
 */
export function themeHasSettings(theme: Pick<Theme, "properties" | "css" | "fileContent">) {
    if (theme.properties) return theme.properties.length > 0;
    return hasThemeSettings(theme.fileContent ?? theme.css ?? "");
}

/** Splits settings into those without a group, which come first, and one group per name in order of first use. */
export function groupSettings(settings: readonly ThemeSetting[]) {
    const ungrouped: ThemeSetting[] = [];
    const groups: ThemeSettingGroup[] = [];

    for (const setting of settings) {
        if (!setting.group) {
            ungrouped.push(setting);
            continue;
        }

        let group = groups.find(g => g.name === setting.group);
        if (!group) {
            group = {name: setting.group, settings: []};
            groups.push(group);
        }
        group.settings.push(setting);
    }

    return {ungrouped, groups};
}
