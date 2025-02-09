/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import {Filters, getByKeys, getByPrototypes, getByStrings, getModule} from "@webpack";


const DiscordModules = new Proxy({
    // Modules used by core
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

    // Commonly used modules in plugins
    get ChannelClasses() {return getByKeys(["channel", "decorator"], {cacheId: "core-ChannelClasses"});},
    get LayerClasses() {return getByKeys(["layerContainer"], {cacheId: "core-LayerClasses"});},
    get WrapperClasses() {return getByKeys(["wrapperControlsHidden"], {cacheId: "core-WrapperClasses"});},
    get TextareaClasses() {return getByKeys(["channelTextArea", "buttonContainer", "button"], {cacheId: "core-TextareaClasses"});},
    get MessageClasses() {return getByKeys(["repliedTextPreview", "repliedTextContent"], {cacheId: "core-MessageClasses"});},
    get SidebarClasses() {return getByKeys(["sidebar", "activityPanel", "sidebarListRounded"], {cacheId: "core-SidebarClasses"});},
    get MarginClasses() {return getByKeys(["marginBottom4", "marginTop20"], {cacheId: "core-MarginClasses"});},
    get MessageViewClasses() {return getByKeys(["ephemeral", "quotedChatMessage", "channelTextArea"], {cacheId: "core-MessageViewClasses"});},
    get MessageActions() {return getByKeys(["jumpToMessage", "_sendMessage"], {cacheId: "core-MessageActions"});},
    get transitionTo() {return getByStrings(["transitionTo - Transitioning to"], {searchExports: true, cacheId: "core-transitionTo"});},
    get DiscordComponents() {return getByKeys(["ConfirmModal", "ToastPosition"], {cacheId: "core-DiscordComponents"});},
    get FormSwitch() {return getModule(Filters.byStrings("note", "tooltipNote"), {searchExports: true, cacheId: "core-FormSwitch"});},
    get Flux() {return getByKeys(["Store", "connectStores"], {cacheId: "core-Flux"});},
    get Flex() {return getModule(mod => mod.defaultProps?.direction, {searchExports: true, cacheId: "core-Flex"});},
    get UseStateFromStores() {return getByStrings(["useStateFromStores"], {searchExports: true, cacheId: "core-UseStateFromStores"});},
    get i18n() {return getByKeys(["getLocale"], {cacheId: "core-i18n"});}
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