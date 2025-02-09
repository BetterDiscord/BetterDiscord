/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import {Filters, getByKeys, getByPrototypes, getModule} from "@webpack";


const DiscordModules = new Proxy({
    get React() {return getByKeys(["createElement", "cloneElement"], {cacheId: "core-React"});},
    get ReactDOM() {return getByKeys(["render", "findDOMNode"], {cacheId: "core-ReactDOM"});},
    get ChannelActions() {return getByKeys(["selectChannel"], {cacheId: "core-ChannelActions"});},
    get LocaleStore() {return getByKeys(["locale", "initialize"], {cacheId: "core-LocaleStore"});},
    get UserStore() {return getByKeys(["getCurrentUser", "getUser"], {cacheId: "core-UserStore"});},
    get InviteActions() {return getByKeys(["createInvite"], {cacheId: "core-InviteActions"});},
    get SimpleMarkdown() {return getByKeys(["parseBlock", "parseInline", "defaultOutput"], {cacheId: "core-SimpleMarkdown"});},
    get SimpleMarkdownWrapper() {return getByKeys(["defaultRules", "parse"], {cacheId: "core-MarkdownParser"});},
    get Strings() {return getByKeys(["Messages"], {cacheId: "core-Strings"}).Messages;},
    get Dispatcher() {return getByKeys(["dispatch", "subscribe", "register"], {cacheId: "core-Dispatcher"});},
    get Tooltip() {
        // Make fallback component just pass children, so it can at least render that.
        const fallback = props => props.children?.({}) ?? null;

        return getByPrototypes(["renderTooltip"], {searchExports: true, cacheId: "core-Tooltip"}) ?? fallback;
    },
    get promptToUpload() {return getModule(Filters.byStrings("getUploadCount", "instantBatchUpload"), {searchExports: true, cacheId: "core-promptToUpload"});},
    get RemoteModule() {return getByKeys(["setBadge"], {cacheId: "core-RemoteModule"});},
    get UserAgent() {return getByKeys(["os", "layout"], {cacheId: "core-UserAgent"});},
    get MessageUtils() {return getByKeys(["sendMessage"], {cacheId: "core-MessageUtils"});},
    get UserSettingsWindow() {return getByKeys(["open", "updateAccount"], {cacheId: "core-UserSettingsWindow"});},
    get Spring() {return getByKeys(["useSpring", "animated"], {cacheId: "core-Spring"});},
    get Flux() {return getByKeys(["Store", "connectStores"], {cacheId: "core-Flux"});},
}, {
    get: function(obj, mod) {
        if (!obj.hasOwnProperty(mod)) return undefined;
        if (Object.getOwnPropertyDescriptor(obj, mod).get) {
            const value = obj[mod];
            delete obj[mod];
            obj[mod] = value;
        }
        
        return obj[mod];
    },
    set: function() {
        throw new Error("[WebpackModules~common] trying to set module");
    }
});

export default DiscordModules;