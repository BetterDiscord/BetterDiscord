import Builtin from "../../structs/builtin";
import {DiscordModules, WebpackModules, Strings, DOM} from "modules";
import PublicServersMenu from "../../ui/publicservers/menu";

const LayerStack = WebpackModules.getByProps("pushLayer");

export default new class PublicServers extends Builtin {
    get name() {return "PublicServers";}
    get category() {return "general";}
    get id() {return "publicServers";}

    enabled() {
        const GuildList = WebpackModules.find(m => m.type && m.type.toString().includes("guildsnav"));
        if (!GuildList) this.warn("Can't find GuildList component");
        this.guildPatch = this.after(GuildList, "type", () => {this._appendButton();});
        this._appendButton();
    }

    disabled() {
        this.unpatchAll();
        DOM.query("#bd-pub-li").remove();
    }

    async _appendButton() {
        await new Promise(r => setTimeout(r, 1000));
        
        const existing = DOM.query("#bd-pub-li");
        if (existing) return;

        const guilds = DOM.query(`.${DiscordModules.GuildClasses.guilds} .${DiscordModules.GuildClasses.listItem}`);
        if (!guilds) return;

        DOM.after(guilds, this.button);
    }

    openPublicServers() {
        LayerStack.pushLayer(() => DiscordModules.React.createElement(PublicServersMenu, {close: LayerStack.popLayer}));
    }

    get button() {
        const btn = DOM.createElement(`<div id="bd-pub-li" class="${DiscordModules.GuildClasses.listItem}">`);
        const label = DOM.createElement(`<div id="bd-pub-button" class="${DiscordModules.GuildClasses.wrapper + " " + DiscordModules.GuildClasses.circleIconButton}">${Strings.PublicServers.button}</div>`);
        label.addEventListener("click", () => {this.openPublicServers();});
        btn.append(label);
        return btn;
    }
};