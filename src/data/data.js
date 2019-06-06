import State from "./state";
import SettingsInfo from "./settings";
import SettingsCookie from "./cookies/settingscookie";
import Config from "./config";
import PluginCookie from "./cookies/plugincookie";
import ThemeCookie from "./cookies/themecookie";
import Themes from "./themes";
import Plugins from "./plugins";
import Emotes from "./emotes/emotes";
import EmoteBlacklist from "./emotes/blacklist";
import EmoteInfo from "./emotes/info";
import EmoteModifiers from "./emotes/modifiers";
import EmoteOverrides from "./emotes/overrides";

import SettingsCollection from "./settings/config";
import EmoteCollection from "./emotes/config";

export const Collections = [SettingsCollection, EmoteCollection];

export {State, SettingsInfo, SettingsCookie, Config, PluginCookie, ThemeCookie, Themes, Plugins, Emotes, EmoteBlacklist, EmoteInfo, EmoteModifiers, EmoteOverrides};