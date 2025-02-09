/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import {memoize} from "@common/utils";
import type {RemoteModule, GetClientInfo, UserAgentInfo, Dispatcher, InviteActions} from "discord/modules";
import {Filters, getByKeys, getByStrings, getModule, getStore} from "@webpack";
import type React from "react";
import type ReactDOM from "react-dom";


const DiscordModules = memoize({
    get React(): typeof React {return getByKeys(["createElement", "cloneElement"]) as typeof React;},
    get ReactDOM(): typeof ReactDOM {return getByKeys(["render", "findDOMNode"]) as typeof ReactDOM;},
    get ChannelActions() {return getByKeys(["selectChannel"]);},
    get LocaleStore() {return getStore("LocaleStore");},
    get UserStore() {return getStore("UserStore");},
    get InviteActions(): InviteActions | undefined {return getByKeys(["createInvite"]);},
    get SimpleMarkdown() {return getByKeys(["parseBlock", "parseInline", "defaultOutput"]);},
    get Strings() {return getByKeys<{Messages: object}>(["Messages"])?.Messages;},
    get Dispatcher(): Dispatcher | undefined {return getByKeys(["dispatch", "subscribe", "register"]);},
    get Tooltip(): React.ComponentType<{color?: string; position?: string; text?: string; children: React.FunctionComponent;}> {
        // Make fallback component just pass children, so it can at least render that.
        const fallback: React.ComponentType<{children: React.FunctionComponent;}> = props => props.children?.({}) ?? null;

        return getModule(Filters.byPrototypeKeys(["renderTooltip"]), {searchExports: true}) ?? fallback;
    },
    get promptToUpload() {return getByStrings([ "getUploadCount", "instantBatchUpload" ], {searchExports: true});},
    get RemoteModule(): RemoteModule | undefined {return getByKeys(["setBadge"]);},
    get UserAgentInfo(): UserAgentInfo | undefined {return getByKeys(["os", "layout"]);},
    get GetClientInfo(): GetClientInfo | undefined {return getByStrings(["versionHash"]);},
    get MessageUtils() {return getByKeys(["sendMessage"]);},
});

export default DiscordModules;