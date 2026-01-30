/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import {memoize} from "@common/utils";
import type {RemoteModule, GetClientInfo, UserAgentInfo, Dispatcher, InviteActions, SimpleMarkdown, ReactSpring} from "discord/modules";
import {Filters, getBulkKeyed, getByKeys, getBySource, getByStrings, getModule} from "@webpack";
import type React from "react";

interface Modules {
    React: typeof React;
    ReactSpring: ReactSpring;
    SimpleMarkdownWrapper: SimpleMarkdown;
    Dispatcher: Dispatcher;
    Tooltip: React.ComponentType<{color?: string; position?: string; text?: string; children: React.FunctionComponent;}>;
    AccessibilityContext: React.Context<{reducedMotion: {enabled: false;};}>;
    ChannelActions: {selectPrivateChannel(id: string): void; selectVoiceChannel(a: any, b: any): void;};
}

const SyncModules = getBulkKeyed<Modules>({
    React: {
        filter: Filters.byKeys(["createElement", "cloneElement"]),
        firstId: 483362,
        cacheId: "core-React"
    },
    ReactSpring: {
        filter: Filters.byKeys(["useTransition", "animated"]),
        firstId: 429783,
        cacheId: "core-ReactSpring"
    },
    SimpleMarkdownWrapper: {
        filter: Filters.byKeys(["defaultRules", "parse"]),
        firstId: 454585,
        cacheId: "core-SimpleMarkdownWrapper"
    },
    Dispatcher: {
        filter: Filters.byKeys(["dispatch", "subscribe", "register"]),
        searchExports: true,
        firstId: 570140,
        cacheId: "core-Dispatcher"
    },
    Tooltip: {
        filter: Filters.byPrototypeKeys(["renderTooltip"]),
        searchExports: true,
        firstId: 481060,
        cacheId: "core-Tooltip"
    },
    AccessibilityContext: {
        filter: m => m?._currentValue?.reducedMotion,
        searchExports: true,
        firstId: 159691,
        cacheId: "core-AccessibilityContext"
    },
    ChannelActions: {
        filter: Filters.byKeys(["selectPrivateChannel"]),
        firstId: 287734,
        cacheId: "core-ChannelActions"
    }
});

SyncModules.Tooltip ??= props => props.children?.({}) ?? null;

const MemoModules = memoize({
    get InviteActions(): InviteActions | undefined {return getByKeys(["createInvite"], {firstId: 846293, cacheId: "core-InviteActions"});},
    get SimpleMarkdown(): SimpleMarkdown | undefined {return getByKeys(["parseBlock", "parseInline", "defaultOutput"], {firstId: 280230, cacheId: "core-SimpleMarkdown"});},
    get promptToUpload() {return getByStrings(["getUploadCount", ".UPLOAD_FILE_LIMIT_ERROR"], {searchExports: true, firstId: 518960, cacheId: "core-promptToUpload"});},
    get RemoteModule(): RemoteModule | undefined {return getByKeys(["setBadge"], {firstId: 837921, cacheId: "core-RemoteModule"});},
    get UserAgentInfo(): UserAgentInfo | undefined {return getByKeys(["os", "layout"], {firstId: 214958, cacheId: "core-UserAgentInfo"});},
    get GetClientInfo(): GetClientInfo | undefined {return getByStrings(["versionHash"], {firstId: 551602, cacheId: "core-GetClientInfo"});},
    get MessageUtils() {return getByKeys(["sendMessage"], {firstId: 843472, cacheId: "core-MessageUtils"});},
    get LinkParser(): any {return getModule(m => m.html && m.requiredFirstCharacters?.[0] === "[", {firstId: 694403, cacheId: "core-LinkParser"});},
    get DiscordMarkdown(): any {return getModule(m => m?.prototype?.render && m.rules, {firstId: 558179, cacheId: "core-DiscordMarkdown"});},
    get Layout(): Record<string, any> {return getBySource(["$Root", "buildLayout"], {searchDefault: false, firstId: 419954, cacheId: "core-Layout"})!;},
    get NoticesBaseClasses(): {base: string;} | undefined {return getByKeys(["container", "base", "sidebar"], {cacheId: "core-NoticesBaseClasses"});},
    get NoticesPageClasses(): {errorPage: string;} | undefined {return getByKeys(["errorPage"], {cacheId: "core-NoticesPageClasses"});},
    get ViewClasses(): {standardSidebarView: string;} | undefined {return getByKeys(["standardSidebarView"], {cacheId: "core-ViewClasses"});},
});

const DiscordModules = Object.assign(MemoModules, SyncModules);
export default DiscordModules;