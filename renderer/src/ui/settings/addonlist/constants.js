import {Strings} from "modules";
import FormattableString from "structs/string";

export const CONTROLS = {
    installed: {
        sortOptions: [
            {label: Strings.Addons.name, value: "name"},
            {label: Strings.Addons.author, value: "author"},
            {label: Strings.Addons.version, value: "version"},
            {label: Strings.Addons.added, value: "added"},
            {label: Strings.Addons.modified, value: "modified"}
        ],
        directions: [
            {label: Strings.Sorting.ascending, value: true},
            {label: Strings.Sorting.descending, value: false}
        ],
        viewOptions: [ // TODO: Add strings
            {label: "List", value: "list"},
            {label: "Grid", value: "grid"}
        ]
    },
    store: {
        sortOptions: [ // TODO: Add strings
            {label: Strings.Addons.name, value: "name"},
            {label: "Likes", value: "likes"},
            {label: "Downloads", value: "downloads"},
            {label: Strings.Addons.added, value: "release_date"}
        ],
        directions: [
            {label: Strings.Sorting.ascending, value: true},
            {label: Strings.Sorting.descending, value: false}
        ],
        viewOptions: [ // TODO: Add strings
            {label: "List", value: "list"},
            {label: "Grid", value: "grid"}
        ]
    }
};

export const API_VERSION = "v1";
export const WEB_HOSTNAME = "betterdiscord.app";
export const API_URL = new FormattableString(`https://api.${WEB_HOSTNAME}/${API_VERSION}/store/{{type}}s`);
export const DOWNLOAD_URL = new FormattableString(`https://${WEB_HOSTNAME}/download?id={{id}}`);
export const TAGS = {
    themes: ["all", "flat", "transparent", "layout", "customizable", "fiction", "nature", "space", "dark", "light", "game", "anime", "red", "orange", "green", "purple", "black", "other", "yellow", "blue", "abstract"],
    plugins: ["all", "fun", "roles", "activity", "status", "game", "edit", "library", "notifications", "emotes", "channels", "shortcut", "enhancement", "servers", "chat", "security", "organization", "friends", "members", "utility", "developers", "search", "text", "voice"]
};