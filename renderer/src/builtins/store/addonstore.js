import Builtin from "@structs/builtin";

import WebpackModules, {Filters} from "@modules/webpackmodules";
import AddonStore from "@modules/addonstore";
import React from "@modules/react";
import AddonEmbed from "@ui/addon-store/embed";
import ReactUtils from "@modules/api/reactutils";
import ErrorBoundary from "@ui/errorboundary";
import Web from "@data/web";
import Utilities from "@modules/utilities";
import Settings from "@modules/settingsmanager";

const SimpleMarkdownWrapper = WebpackModules.getByProps("parse", "defaultRules");

let MessageAccessories;

const MAX_EMBEDS = 10;

// Make it so we can detect links that have <> around them
const ADDON_REGEX_SOURCE = "(?:https?:\\/\\/betterdiscord\\.app\\/(?:theme|plugin)|betterdiscord:\\/\\/(?:theme|plugin|addon)s?)(?:\\/|\\?id=)(\\S+)";
const ADDON_REGEX = new RegExp(`(?:<${ADDON_REGEX_SOURCE}>|${ADDON_REGEX_SOURCE})`, "gi");

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

    /** @type {RegExpExecArray} */
    let exec;
    while ((exec = ADDON_REGEX.exec(text))) {
        // if https://betterdiscord.app/type/id not <https://betterdiscord.app/type/id>
        // if <betterdiscord://addon/id> not betterdiscord://addon/id
        if (!(exec[0][0] === "h" || exec[0][1] === "b")) continue;

        matches.push({
            id: exec[1] || exec[2],
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

    get name() {return "AddonStore";}
    get category() {return "store";}
    get id() {return "bdAddonStore";}

    async enabled() {
        this.patchEmbeds();
        this.patchMarkdown();
    }

    /** The patches are slightly late sometimes, so this will upate chat */
    forceUpdateChat() {
        for (const message of document.querySelectorAll("[id^=chat-messages-]")) {
            const instance = ReactUtils.getInternalInstance(message);

            const child = Utilities.findInTree(instance, ($child) => typeof $child?.memoizedProps?.onMouseLeave === "function", {
                walkable: [ "child" ]
            });

            if (typeof child !== "undefined") {
                child.memoizedProps.onMouseLeave();
                child.memoizedProps.onMouseMove();
            }
            
            // Update forward messages
            for (const forward of message.querySelectorAll(`[id^="message-accessories-"] [id^="message-accessories-"]`)) {
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
                return /^<betterdiscord:\/\/(theme|plugin|addon)s?\/(\S+)>/.exec(text);
            },
            /**
             * @param {RegExpExecArray} exec 
             * @param {Function} parse 
             * @param {Record<string, any>} state 
             */
            parse: (exec) => {
                return {
                    type: this.id,
                    content: [{
                        type: "text",
                        content: exec[0].slice(1, -1)
                    }],
                    exec
                };
            },
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

                        AddonStore.requestAddon(node.exec[2]).then(addon => addon.download(false));
                    }
                }, parse(node.content, state));
            }
        };

        SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);
    }
 
    async patchEmbeds() {
        MessageAccessories ??= await WebpackModules.getLazy(Filters.byPrototypeKeys([ "renderEmbeds" ]), {searchExports: true});

        this.after(MessageAccessories.prototype, "renderEmbeds", (_, [ message ], res) => {
            if (!Settings.get("settings", "store", "addonEmbeds")) {
                return res;
            }

            res ??= [];

            if (Web.isReleaseChannel(message.channel_id) || (message.messageReference?.type === 1 && Web.isReleaseChannel(message.messageReference.channel_id) && !message.messageSnapshots.length)) {
                const id = message.embeds[0].rawDescription?.split?.("\n")?.at?.(-1)?.match?.(/\?id=(\d+)/);

                if (id) return React.createElement(ErrorBoundary, null, React.createElement(AddonEmbed,{id: id[1], original: res}));

                return res;
            }
            
            const matches = extractAddonLinks(message.content, MAX_EMBEDS);
            
            // Go throught and either replace a prexisting embed
            // or add a new one

            if (matches.length) {
                const embeds = [ ...res ];

                for (let key = 0; key < matches.length; key++) {
                    const {match, id} = matches[key];
                    // How to use labeled statements?
                    // So i can just continue the matches one
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