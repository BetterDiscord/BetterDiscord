import Builtin from "@structs/builtin";

import Settings from "@modules/settingsmanager";
import Strings from "@modules/strings";
import WebpackModules, {Filters} from "@modules/webpackmodules";
import AddonStore from "@modules/addonstore";
import React from "@modules/react";
import AddonEmbed from "@ui/addon-store/embed";
import AddonStorePage from "@ui/addon-store/page";
import ReactUtils from "@modules/api/reactutils";

const SimpleMarkdownWrapper = WebpackModules.getByProps("parse", "defaultRules");

let MessageComponent;

const MAX_EMBEDS = 4;

export default new class AddonStoreBuiltin extends Builtin {
    get name() {return "AddonStore";}
    get category() {return "general";}
    get id() {return "bdAddonStore";}

    async enabled() {
        Settings.registerPanel("theme-store", Strings.Panels.themes, {
            order: 5,
            element: () => React.createElement(AddonStorePage, {type: "theme"})
        });
        Settings.registerPanel("plugin-store", Strings.Panels.plugins, {
            order: 6,
            element: () => React.createElement(AddonStorePage, {type: "plugin"})
        });

        this.patchEmbeds();
        this.patchMarkdown();
    }

    forceUpdateChat() {
        for (const element of document.querySelectorAll("[id^=chat-messages-]")) {
            const instance = ReactUtils.getInternalInstance(element);
            if (typeof instance?.child?.memoizedProps?.onMouseMove === "function") {
                instance.child.memoizedProps.onMouseMove();
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
                return AddonStore.isAddonLink(text);
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

                        if (addon) {
                            AddonStore.openAddonPage(addon);
                        }
                    }
                }, parse(node.content, state));
            }
        };

        SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);
    }
 
    async patchEmbeds() {
        MessageComponent ??= await WebpackModules.getLazy(Filters.byPrototypeKeys([ "renderEmbeds" ]), {searchExports: true});

        this.after(MessageComponent.prototype, "renderEmbeds", (_, [ message ], res) => {
            res ??= [];
            
            const matches = AddonStore.extractAddonLinks(message.content, MAX_EMBEDS);
            
            // Go throught and either replace a prexisting embed
            // or add a new one

            if (matches.length) {
                const embeds = [ ...res ];                

                for (let key = 0; key < matches.length; key++) {
                    const {match, id} = matches[key];
                    // How to use labeled statements?
                    // So i can just continue the matches one
                    let shouldAdd = true;

                    for (let embedIndex = 0; embedIndex < res.length; embedIndex++) {
                        const embed = embeds[embedIndex]?.props?.children?.props?.embed;

                        if (embed?.url === match) {
                            shouldAdd = false;
                            embeds[embedIndex] = React.createElement(AddonEmbed, {id: id, key: key});
                            break;
                        }
                    }

                    if (shouldAdd) {
                        embeds.push(React.createElement(AddonEmbed, {id: id, key: key}));
                    }
                }

                embeds.length = MAX_EMBEDS;

                return embeds;
            }

            return res;
        });

        this.forceUpdateChat();
    }

    disabled() {
        Settings.removePanel("theme-store");
        Settings.removePanel("plugin-store");

        delete SimpleMarkdownWrapper.defaultRules[this.id];
        SimpleMarkdownWrapper.parse = SimpleMarkdownWrapper.reactParserFor(SimpleMarkdownWrapper.defaultRules);

        this.unpatchAll();
        this.forceUpdateChat();
    }
};