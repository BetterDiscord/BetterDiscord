import Builtin from "@structs/builtin";

import AddonStore from "@modules/addonstore";
import React from "@modules/react";
import ReactUtils from "@api/reactutils";
import Settings from "@stores/settings";

import AddonEmbed from "@ui/misc/storeembed";
import ErrorBoundary from "@ui/errorboundary";

import Web from "@data/web";

import RemoteAPI from "@polyfill/remote";
import {Filters, getByKeys, getLazy} from "@webpack";
import {findInTree} from "@common/utils";

const SimpleMarkdownWrapper = getByKeys(["parse", "defaultRules"]);
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
        for (const [ start, end ] of codeblocks) {
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

    initialize() {
        RemoteAPI.setProtocolListener((url) => {
            if (!Settings.get(this.collection, this.category, this.id)) return;

            const match = url.match(APP_PROTOCOL_REGEX);
            if (!match) return;

            AddonStore.requestAddon(decodeURIComponent(match[1])).then((addon) => addon.download());
        });

        return super.initialize(...arguments);
    }

    get name() {return "AddonStore";}
    get category() {return "store";}
    get id() {return "bdAddonStore";}

    enabled() {
        this.patchEmbeds();
        this.patchMarkdown();
    }

    /** The patches are slightly late sometimes, so this will upate chat */
    forceUpdateChat() {
        for (const message of document.querySelectorAll("[id^=chat-messages-]")) {
            const instance = ReactUtils.getInternalInstance(message);

            const child = findInTree(instance, ($child) => typeof $child?.memoizedProps?.onMouseLeave === "function", {
                walkable: [ "child" ]
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

    // TODO: Patch slate to add markdown support for the betterdiscord:// protocol
    patchMarkdown() {
        SimpleMarkdownWrapper.defaultRules[this.id] = {
            order: 5,
            /**
             * @param {text} text
             * @param {Record<string, any>} state
             */
            match: (text, state) => {
                if (!state.allowLinks) return;
                return PROTOCOL_REGEX.exec(text);
            },
            /**
             * @param {RegExpExecArray} exec
             * @param {Function} parse
             * @param {Record<string, any>} state
             */
            parse: (exec) => ({
                type: this.id,
                content: [{
                    type: "text",
                    content: exec[0].slice(1, -1)
                }],
                exec
            }),
            /**
             * @param {{ content: any, exec: RegExpExecArray }} node
             * @param {Function} parse
             * @param {Record<string, any>} state
             */
            react: (node, parse, state) => {
                const href = node.exec[0].slice(1, -1);

                return React.createElement("a", {
                    key: state.key,
                    className: "bd-link",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    href,
                    title: href,
                    onClick(event) {
                        event.preventDefault();

                        AddonStore.requestAddon(node.exec[1]).then(addon => addon.download(false));
                    }
                }, parse(node.content, state));
            }
        };

        SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);
    }

    async patchEmbeds() {
        MessageAccessories ??= await getLazy(Filters.byPrototypeKeys([ "renderEmbeds" ]), {searchExports: true});

        this.after(MessageAccessories.prototype, "renderEmbeds", (_, [ message ], res) => {
            if (!Settings.get(this.collection, this.category, "addonEmbeds")) {
                return res;
            }

            res ??= [];

            let type = Web.getReleaseChannelType(message.channel_id);
            // Allow for forwarded messages
            if (!type && message.messageReference?.type === 1 && !message.messageSnapshots.length) type = Web.getReleaseChannelType(message.messageReference.channel_id);

            if (type) {
                const id = message.embeds[0].rawDescription?.split?.("\n")?.at?.(-1)?.match?.(/\?id=(\d+)/);

                if (id) return React.createElement(ErrorBoundary, null, React.createElement(AddonEmbed,{id: id[1], original: res}));

                return res;
            }

            const matches = extractAddonLinks(message.content, MAX_EMBEDS);

            // Go through and either replace a prexisting embed or add a new one
            if (matches.length) {
                const embeds = [ ...res ];

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

    disabled() {
        delete SimpleMarkdownWrapper.defaultRules[this.id];
        SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);

        this.unpatchAll();
        this.forceUpdateChat();
    }
};