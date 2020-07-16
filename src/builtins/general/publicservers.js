import Builtin from "../../structs/builtin";
import {DiscordModules, WebpackModules, Strings, DOM} from "modules";
import PublicServersMenu from "../../ui/publicservers/menu";

const LayerStack = WebpackModules.getByProps("pushLayer");

export default new class PublicServers extends Builtin {
    get name() {return "PublicServers";}
    get category() {return "general";}
    get id() {return "publicServers";}

    enabled() {
        const GuildList = WebpackModules.find(m => m.default && m.default.displayName == "NavigableGuilds");
        const GuildListOld = WebpackModules.findByDisplayName("Guilds");
        if (!GuildList && !GuildListOld) this.warn("Can't find GuildList component");
        this.guildPatch = this.after(GuildList ? GuildList : GuildListOld.prototype, GuildList ? "default" : "render", this._appendButton);
        this._appendButton();
    }

    disabled() {
        this.unpatchAll();
        DOM.query("#bd-pub-li").remove();
    }

    _appendButton() {
        const wrapper = DiscordModules.GuildClasses.wrapper.split(" ")[0];
        const guilds = DOM.query(`.${wrapper} .scroller-2TZvBN >:first-child`);
        DOM.after(guilds, this.button);
    }

    openPublicServers() {
        LayerStack.pushLayer(() => DiscordModules.React.createElement(PublicServersMenu, {close: LayerStack.popLayer}));
    }

    get button() {
        const btn = DOM.createElement(`<div id="bd-pub-li" class="${DiscordModules.GuildClasses.listItem}">`);
        const label = DOM.createElement(`<div id="bd-pub-button" class="${"wrapper-25eVIn " + DiscordModules.GuildClasses.circleButtonMask}">${Strings.PublicServers.button}</div>`);
        label.addEventListener("click", () => {this.openPublicServers();});
        btn.append(label);
        return btn;
    }
};