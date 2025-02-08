/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import type {ComponentType, FunctionComponent} from "react";
import Utilities from "./utilities";
import type {RemoteModule, GetClientInfo, UserAgentInfo} from "discord/modules";
import {Filters, getByKeys, getByStrings, getModule} from "@webpack";


const DiscordModules = Utilities.memoizeObject({
    get React() {return getByKeys(["createElement", "cloneElement"]);},
    get ReactDOM() {return getByKeys(["render", "findDOMNode"]);},
    get ChannelActions() {return getByKeys(["selectChannel"]);},
    get LocaleStore() {return getByKeys(["locale", "initialize"]);},
    get UserStore() {return getByKeys(["getCurrentUser", "getUser"]);},
    get InviteActions() {return getByKeys(["createInvite"]);},
    get SimpleMarkdown() {return getByKeys(["parseBlock", "parseInline", "defaultOutput"]);},
    get Strings() {return getByKeys<{Messages: object}>(["Messages"])?.Messages;},
    get Dispatcher() {return getByKeys(["dispatch", "subscribe", "register"]);},
    get Tooltip() {
        // Make fallback component just pass children, so it can at least render that.
        const fallback: ComponentType<{children: FunctionComponent;}> = props => props.children?.({}) ?? null;

        return getModule(Filters.byPrototypeKeys(["renderTooltip"]), {searchExports: true}) ?? fallback;
    },
    get promptToUpload() {return getByStrings([ "getUploadCount", "instantBatchUpload" ], {searchExports: true});},
    get RemoteModule(): RemoteModule | undefined {return getByKeys(["setBadge"]);},
    get UserAgentInfo(): UserAgentInfo | undefined {return getByKeys(["os", "layout"]);},
    get GetClientInfo(): GetClientInfo | undefined {return getByStrings(["versionHash"]);},
    get MessageUtils() {return getByKeys(["sendMessage"]);},
});

export default DiscordModules;