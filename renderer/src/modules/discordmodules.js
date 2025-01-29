/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import Utilities from "./utilities";
import WebpackModules, {Filters} from "./webpackmodules";


const DiscordModules = Utilities.memoizeObject({
    get React() {return WebpackModules.getByProps("createElement", "cloneElement");},
    get ReactDOM() {return WebpackModules.getByProps("render", "findDOMNode");},
    get ChannelActions() {return WebpackModules.getByProps("selectChannel");},
    get LocaleStore() {return WebpackModules.getByProps("locale", "initialize");},
    get UserStore() {return WebpackModules.getByProps("getCurrentUser", "getUser");},
    get InviteActions() {return WebpackModules.getByProps("createInvite");},
    get SimpleMarkdown() {return WebpackModules.getByProps("parseBlock", "parseInline", "defaultOutput");},
    get Strings() {return WebpackModules.getByProps("Messages").Messages;},
    get Dispatcher() {return WebpackModules.getByProps("dispatch", "subscribe", "register");},
    get Tooltip() {
        // Make fallback component just pass children, so it can at least render that.
        const fallback = props => props.children?.({}) ?? null;

        return WebpackModules.getModule(Filters.byPrototypeKeys(["renderTooltip"]), {searchExports: true}) ?? fallback;
    },
    get promptToUpload() {return WebpackModules.getModule(Filters.byStrings("getUploadCount", "instantBatchUpload"), {searchExports: true});},
    get RemoteModule() {return WebpackModules.getByProps("setBadge");},
    get UserAgent() {return WebpackModules.getByProps("os", "layout");},
    get MessageUtils() {return WebpackModules.getByProps("sendMessage");},
});

export default DiscordModules;