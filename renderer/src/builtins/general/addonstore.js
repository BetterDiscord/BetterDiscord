import Builtin from "@structs/builtin";

import WebpackModules, {Filters} from "@modules/webpackmodules";
import AddonStore from "@modules/addonstore";
import React from "@modules/react";
import AddonEmbed from "@ui/addon-store/embed";
import ReactUtils from "@modules/api/reactutils";
import ErrorBoundary from "@ui/errorboundary";
import Web from "@data/web";
import Utilities from "@modules/utilities";

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
    get name() {return "AddonStore";}
    get category() {return "general";}
    get id() {return "bdAddonStore";}

    async enabled() {
        this.patchEmbeds();
        this.patchMarkdown();
    }

    /** The patches are slightly late sometimes, so this will upate chat */
    forceUpdateChat() {
        for (const element of document.querySelectorAll("[id^=chat-messages-]")) {
            const instance = ReactUtils.getInternalInstance(element);

            const child = Utilities.findInTree(instance, ($child) => typeof $child?.memoizedProps?.onMouseMove === "function", {
                walkable: [ "child" ]
            });

            if (typeof child?.memoizedProps?.onMouseMove === "function") {
                child.memoizedProps.onMouseMove();
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
            match(text, state) {
                if (!state.allowLinks) return;
                return /^<betterdiscord:\/\/(theme|plugin|addon)s?\/(\S+)>/.exec(text);
            },
            /**
             * @param {RegExpExecArray} exec 
             * @param {Function} parse 
             * @param {Record<string, any>} state 
             */
            parse(exec) {
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
             * 
             * @param {{ content: any, exec: RegExpExecArray }} node 
             * @param {Function} parse 
             * @param {Record<string, any>} state 
             */
            react(node, parse, state) {
                const addon = AddonStore.getAddon(node.exec[2]);
                const href = node.exec[0].slice(1, -1);

                return React.createElement("a", {
                    key: state.key,
                    className: "bd-link",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    href,
                    // User hopefully shouldn't see it without it loaded
                    title: `${addon?.name || decodeURIComponent(node.exec[2])}\n\n(${href})`,
                    onClick(event) {
                        event.preventDefault();

                        if (addon) addon.openAddonPage();
                    }
                }, parse(node.content, state));
            }
        };

        SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);
    }
 
    async patchEmbeds() {
        MessageAccessories ??= await WebpackModules.getLazy(Filters.byPrototypeKeys([ "renderEmbeds" ]), {searchExports: true});

        this.after(MessageAccessories.prototype, "renderEmbeds", (_, [ message ], res) => {
            res ??= [];

            if (Web.isReleaseChannel(message.channel_id)) {
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