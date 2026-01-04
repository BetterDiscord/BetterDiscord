import Builtin from "@structs/builtin";

import AddonStore from "@modules/addonstore";
import React from "@modules/react";
import ReactUtils from "@api/reactutils";
import Settings from "@stores/settings";

import AddonEmbed from "@ui/misc/storeembed";
import ErrorBoundary from "@ui/errorboundary";

import Web from "@data/web";

import RemoteAPI from "@polyfill/remote";
import {Filters, getLazy, getLazyBySource, getModule, getWithKey} from "@webpack";
import {findInTree} from "@common/utils";


let MessageAccessories;

const MAX_EMBEDS = 10;

const PROTOCOL_REGEX = /^<betterdiscord:\/\/(?:(?:theme|plugin|addon)s?|store)\/([^/\s]+)\/?>/i;
const APP_PROTOCOL_REGEX = /^betterdiscord:\/\/(?:(?:theme|plugin|addon)s?|store)\/([^/]+)\/?$/i;

const ADDON_REGEX = new RegExp([
    PROTOCOL_REGEX.source.slice(1),
    /https?:\/\/betterdiscord\.app\/(?:theme|plugin)(?:\/([^/\s]+)\/?|\?id=(\d+))/.source
].join("|"), "gi");

const CODEBLOCK_REGEX = /(`+)([\s\S]*?[^`])\1(?!`)/g;

/**
 * Extract all bd addon links
 * @param {string} text
 * @param {number} max
 * @return {{ id: string, match: string, index: number }[]}
 */
function extractAddonLinks(text, max = Infinity) {
    ADDON_REGEX.lastIndex = 0;

    const matches = [];

    if (max <= 0) return matches;

    /**
     * @type {[ start: number, stop: number ]}
     */
    const codeblocks = Array.from(text.matchAll(CODEBLOCK_REGEX), (match) => [
        match.index, match.index + match[0].length
    ]);

    /** @type {RegExpExecArray} */
    let exec;
    while ((exec = ADDON_REGEX.exec(text))) {
        // if https://betterdiscord.app/type/id not <https://betterdiscord.app/type/id>
        // if <betterdiscord://addon/id> not betterdiscord://addon/id
        if (exec[0][0] === "h" && text[exec.index - 1] === "<") continue;

        const endIndex = exec.index + exec.length;

        let isInCodeblock = false;
        for (const [start, end] of codeblocks) {
            if (start < exec.index && endIndex < end) {
                isInCodeblock = true;
                break;
            }
        }

        if (isInCodeblock) continue;

        matches.push({
            id: exec[1] || exec[2] || exec[3],
            match: exec[0],
            index: exec.index
        });

        if (matches.length >= max) {
            break;
        }
    }

    return matches;
}

export default new class AddonStoreBuiltin extends Builtin {
    constructor() {
        super();

        Settings.on(this.collection, this.category, "addonEmbeds", () => this.forceUpdateChat());
    }

    async initialize() {
        RemoteAPI.addProtocolListener((url) => {
            if (!Settings.get(this.collection, this.category, this.id)) return;

            const match = url.match(APP_PROTOCOL_REGEX);
            if (!match) return;

            AddonStore.requestAddon(decodeURIComponent(match[1])).then((addon) => addon.download());
        });

        return super.initialize();
    }

    get name() {return "AddonStore";}
    get category() {return "store";}
    get id() {return "bdAddonStore";}

    async enabled() {
        this.patchEmbeds();
        this.patchLinkOpener();

        this.extractDiscordProtocolList().push("betterdiscord:");
    }

    /** The patches are slightly late sometimes, so this will upate chat */
    forceUpdateChat() {
        for (const message of document.querySelectorAll("[id^=chat-messages-]")) {
            const instance = ReactUtils.getInternalInstance(message);

            const child = findInTree(instance, ($child) => typeof $child?.memoizedProps?.onMouseLeave === "function", {
                walkable: ["child"]
            });

            if (typeof child !== "undefined") {
                child.memoizedProps.onMouseLeave();
                child.memoizedProps.onMouseMove();
            }

            // Update forward messages
            for (const forward of message.querySelectorAll("[id^=\"message-accessories-\"] [id^=\"message-accessories-\"]")) {
                ReactUtils.getOwnerInstance(forward).forceUpdate();
            }
        }
    }

    private linkOpener?: Generator;
    async patchLinkOpener() {
        const [module, key] = this.linkOpener ??= getWithKey((m) => String(m).includes(".trackAnnouncementMessageLinkClicked("), {
            target: await getLazyBySource([".trackAnnouncementMessageLinkClicked("])
        });

        this.before(module, key, (_, args) => {
            if (args[0].href) {
                const url = new URL(args[0].href, location.href);

                const id = Number(url.searchParams.get("id"));
                if (url.host === Web.hostname && url.pathname.toLowerCase() === "/download" && !isNaN(id)) {
                    (args[1] || window.event)?.preventDefault?.();

                    args[0].href = `betterdiscord://store/${id}`;
                    args[0].shouldConfirm = true;
                }
            }
        });
    }

    private protocolList: string[] | undefined;
    private extractDiscordProtocolList() {
        if (this.protocolList) return this.protocolList;

        let protocols: string[] = [];

        const link = getModule<any>(m => m.html && m.requiredFirstCharacters?.[0] === "[")!;

        const includes = Array.prototype.includes;
        Array.prototype.includes = function (...args) {
            if (includes.call(this, "discord:")) {
                Array.prototype.includes = includes;
                protocols = this as string[];

                return false;
            }

            return includes.apply(this, args);
        };

        link.parse(["", "link", "betterdiscord://foo/bar"]);

        return this.protocolList = protocols;
    }

    async patchEmbeds() {
        MessageAccessories ??= await getLazy(Filters.byPrototypeKeys(["renderEmbeds"]), {searchExports: true});

        this.after(MessageAccessories.prototype, "renderEmbeds", (_, [message], res) => {
            if (!Settings.get(this.collection, this.category, "addonEmbeds")) {
                return res;
            }

            res ??= [];

            let type = Web.getReleaseChannelType(message.channel_id);
            // Allow for forwarded messages
            if (!type && message.messageReference?.type === 1 && !message.messageSnapshots.length) type = Web.getReleaseChannelType(message.messageReference.channel_id);

            if (type) {
                const id = message.embeds[0].rawDescription?.split?.("\n")?.at?.(-1)?.match?.(/\?id=(\d+)/);

                if (id) return React.createElement(ErrorBoundary, null, React.createElement(AddonEmbed, {id: id[1], original: res}));

                return res;
            }

            const matches = extractAddonLinks(message.content, MAX_EMBEDS);

            // Go through and either replace a prexisting embed or add a new one
            if (matches.length) {
                const embeds = [...res];

                for (let key = 0; key < matches.length; key++) {
                    const {match, id} = matches[key];
                    let shouldAdd = embeds.length < MAX_EMBEDS;

                    for (let embedIndex = 0; embedIndex < res.length; embedIndex++) {
                        const embed = embeds[embedIndex]?.props?.children?.props?.embed;

                        if (embed?.url === match) {
                            shouldAdd = false;
                            embeds[embedIndex] = React.createElement(ErrorBoundary, {key}, React.createElement(AddonEmbed, {id, original: embeds[embedIndex]}));
                            break;
                        }
                    }

                    if (shouldAdd) embeds.push(React.createElement(ErrorBoundary, {key}, React.createElement(AddonEmbed, {id})));
                }

                return embeds;
            }

            return res;
        });

        this.forceUpdateChat();
    }

    async disabled() {
        const list = this.extractDiscordProtocolList();
        const index = list.indexOf("betterdiscord:");
        if (index !== -1) {
            list.splice(index, 1);
        }

        this.unpatchAll();
        this.forceUpdateChat();
    }
};