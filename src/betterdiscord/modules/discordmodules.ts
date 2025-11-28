/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import {memoize} from "@common/utils";
import type {RemoteModule, GetClientInfo, UserAgentInfo, Dispatcher, InviteActions, SimpleMarkdown, ReactSpring} from "discord/modules";
import {Filters, getByKeys, getByStrings, getModule, getStore} from "@webpack";
import type React from "react";
import type ReactDOMBaseType from "react-dom";
import type ReactDOMClientType from "react-dom/client";

type ReactDOM = typeof ReactDOMBaseType & typeof ReactDOMClientType;


const DiscordModules = memoize({
    get React(): typeof React {return getByKeys(["createElement", "cloneElement"], {cacheId: "core-React"}) as typeof React;},
    get ReactDOM(): ReactDOM {return Object.assign({}, getByKeys(["createPortal"], {cacheId: "core-ReactDOM-1"}), getByKeys(["createRoot"], {cacheId: "core-ReactDOM-2"})) as ReactDOM;},
    get ReactSpring(): ReactSpring {return getByKeys(["useTransition", "animated"], {cacheId: "core-ReactSpring"}) as ReactSpring;},
    get ChannelActions(): {selectVoiceChannel(a: any, b: any): void;} | undefined {return getByKeys(["selectChannel"], {cacheId: "core-ChannelActions"});},
    get LocaleStore() {return getStore("LocaleStore");},
    get UserStore() {return getStore("UserStore");},
    get InviteActions(): InviteActions | undefined {return getByKeys(["createInvite"], {cacheId: "core-InviteActions"});},
    get SimpleMarkdown(): SimpleMarkdown | undefined {return getByKeys(["parseBlock", "parseInline", "defaultOutput"], {cacheId: "core-SimpleMarkdown"});},
    get SimpleMarkdownWrapper(): SimpleMarkdown {return getByKeys(["defaultRules", "parse"], {cacheId: "core-SimpleMarkdownWrapper"}) as SimpleMarkdown;},
    get Strings() {return getByKeys<{Messages: object;}>(["Messages"], {cacheId: "core-Strings"})?.Messages;},
    get Dispatcher(): Dispatcher {return getByKeys(["dispatch", "subscribe", "register"], {cacheId: "core-Dispatcher"}) as Dispatcher;},
    get Tooltip(): React.ComponentType<{color?: string; position?: string; text?: string; children: React.FunctionComponent;}> {
        // Make fallback component just pass children, so it can at least render that.
        const fallback: React.ComponentType<{children: React.FunctionComponent;}> = props => props.children?.({}) ?? null;

        return getModule(Filters.byPrototypeKeys(["renderTooltip"]), {searchExports: true, cacheId: "core-Tooltip"}) ?? fallback;
    },
    get promptToUpload() {return getByStrings(["getUploadCount", ".UPLOAD_FILE_LIMIT_ERROR"], {searchExports: true, cacheId: "core-promptToUpload"});},
    get RemoteModule(): RemoteModule | undefined {return getByKeys(["setBadge"], {cacheId: "core-RemoteModule"});},
    get UserAgentInfo(): UserAgentInfo | undefined {return getByKeys(["os", "layout"], {cacheId: "core-UserAgentInfo"});},
    get GetClientInfo(): GetClientInfo | undefined {return getByStrings(["versionHash"], {cacheId: "core-GetClientInfo"});},
    get MessageUtils() {return getByKeys(["sendMessage"], {cacheId: "core-MessageUtils"});},
});

export default DiscordModules;