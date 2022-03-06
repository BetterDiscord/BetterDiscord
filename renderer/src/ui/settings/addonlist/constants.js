import {Strings} from "modules";
import FormattableString from "structs/string";

export const CONTROLS = {
    installed: {
        sortOptions: [
            {get label() {return Strings.Addons.name;}, value: "name"},
            {get label() {return Strings.Addons.author;}, value: "author"},
            {get label() {return Strings.Addons.version;}, value: "version"},
            {get label() {return Strings.Addons.added;}, value: "added"},
            {get label() {return Strings.Addons.modified;}, value: "modified"}
        ],
        directions: [
            {get label() {return Strings.Sorting.ascending;}, value: true},
            {get label() {return Strings.Sorting.descending;}, value: false}
        ],
        viewOptions: [
            {get label() {return Strings.Addons.list;}, value: "list"},
            {get label() {return Strings.Addons.grid;}, value: "grid"}
        ]
    },
    store: {
        sortOptions: [
            {get label() {return Strings.Addons.name;}, value: "name"},
            {get label() {return Strings.Addons.likes;}, value: "likes"},
            {get label() {return Strings.Addons.downloads;}, value: "downloads"},
            {get label() {return Strings.Addons.added;}, value: "release_date"}
        ],
        directions: [
            {get label() {return Strings.Sorting.ascending;}, value: true},
            {get label() {return Strings.Sorting.descending;}, value: false}
        ],
        viewOptions: [
            {get label() {return Strings.Addons.list;}, value: "list"},
            {get label() {return Strings.Addons.grid;}, value: "grid"}
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