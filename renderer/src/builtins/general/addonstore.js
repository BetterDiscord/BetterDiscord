import Builtin from "@structs/builtin";

import Settings from "@modules/settingsmanager";
import Strings from "@modules/strings";
import WebpackModules, {Filters} from "@modules/webpackmodules";
import AddonStore from "@modules/addonstore";
import React from "@modules/react";
import LazyAddonCard from "@ui/addon-store/lazy-card";
import AddonStorePage from "@ui/addon-store/page";

let MessageComponent;

const MAX_EMBEDS = 4;

export default new class AddonStoreBuiltin extends Builtin {
    get name() {return "AddonStore";}
    get category() {return "general";}
    get id() {return "bdAddonStore";}
 
    async enabled() {
        MessageComponent ??= await WebpackModules.getLazy(Filters.byPrototypeKeys([ "renderEmbeds" ]), {searchExports: true});

        Settings.registerPanel("theme-store", Strings.Panels.themes, {
            order: 5,
            element: () => React.createElement(AddonStorePage, {type: "theme"})
        });
        Settings.registerPanel("plugin-store", Strings.Panels.plugins, {
            order: 6,
            element: () => React.createElement(AddonStorePage, {type: "plugin"})
        });

        this.after(MessageComponent.prototype, "renderEmbeds", (_, [ message ], res) => {
            res ??= [];
            
            const matches = AddonStore.extractAddonLinks(message.content, MAX_EMBEDS);

            if (matches.length) {
                const embeds = [ ...res ];                

                for (let key = 0; key < matches.length; key++) {
                    const {match, id} = matches[key];

                    for (let embedIndex = 0; embedIndex < res.length; embedIndex++) {
                        const embed = embeds[embedIndex]?.props?.children?.props?.embed;

                        if (embed?.url === match) {
                            delete embeds[embedIndex];
                        }
                    }

                    embeds.push(React.createElement(LazyAddonCard, {id: id, key: key}));
                }

                embeds.length = MAX_EMBEDS;

                return embeds;
            }

            return res;
        });
    }

    disabled() {
        Settings.removePanel("theme-store");
        Settings.removePanel("plugin-store");

        this.unpatchAll();
    }
};