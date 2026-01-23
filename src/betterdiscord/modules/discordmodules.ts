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
    get React(): typeof React {return getByKeys(["createElement", "cloneElement"]) as typeof React;},
    get ReactDOM(): ReactDOM {return Object.assign({}, getByKeys(["createPortal"]), getByKeys(["createRoot"])) as ReactDOM;},
    get ReactSpring(): ReactSpring {return getByKeys(["useTransition", "animated"]) as ReactSpring;},
    get ChannelActions(): {selectVoiceChannel(a: any, b: any): void;} | undefined {return getByKeys(["selectChannel"]);},
    get LocaleStore() {return getStore("LocaleStore");},
    get UserStore() {return getStore("UserStore");},
    get InviteActions(): InviteActions | undefined {return getByKeys(["createInvite"]);},
    get SimpleMarkdown(): SimpleMarkdown | undefined {return getByKeys(["parseBlock", "parseInline", "defaultOutput"]);},
    get Strings() {return getByKeys<{Messages: object;}>(["Messages"])?.Messages;},
    get Dispatcher(): Dispatcher {return getByKeys(["dispatch", "subscribe", "register"], {searchExports: true}) as Dispatcher;},
    get Tooltip(): React.ComponentType<{color?: string; position?: string; text?: string; children: React.FunctionComponent;}> {
        // Make fallback component just pass children, so it can at least render that.
        const fallback: React.ComponentType<{children: React.FunctionComponent;}> = props => props.children?.({}) ?? null;

        return getModule(Filters.byPrototypeKeys(["renderTooltip"]), {searchExports: true}) ?? fallback;
    },
    get promptToUpload() {return getByStrings(["getUploadCount", ".UPLOAD_FILE_LIMIT_ERROR"], {searchExports: true});},
    get RemoteModule(): RemoteModule | undefined {return getByKeys(["setBadge"]);},
    get UserAgentInfo(): UserAgentInfo | undefined {return getByKeys(["os", "layout"]);},
    get GetClientInfo(): GetClientInfo | undefined {return getByStrings(["versionHash"]);},
    get MessageUtils() {return getByKeys(["sendMessage"]);},
});

export default DiscordModules;