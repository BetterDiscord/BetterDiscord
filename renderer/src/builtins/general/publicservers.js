import Builtin from "../../structs/builtin";
import {DiscordModules, WebpackModules, Strings, DOMManager, React} from "modules";
import PublicServersMenu from "../../ui/publicservers/menu";
import Globe from "../../ui/icons/globe";

const LayerManager = {
    pushLayer(component) {
      DiscordModules.Dispatcher.dispatch({
        type: "LAYER_PUSH",
        component
      });
    },
    popLayer() {
      DiscordModules.Dispatcher.dispatch({
        type: "LAYER_POP"
      });
    },
    popAllLayers() {
      DiscordModules.Dispatcher.dispatch({
        type: "LAYER_POP_ALL"
      });
    }
  };

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {hasError: false};
    }

    componentDidCatch() {
      this.setState({hasError: true});
    }

    render() {
      if (this.state.hasError) return null;  
      return this.props.children; 
    }
}

export default new class PublicServers extends Builtin {
    get name() {return "PublicServers";}
    get category() {return "general";}
    get id() {return "publicServers";}

    enabled() {
        const PrivateChannelList = WebpackModules.getModule(m => m?.toString().includes("privateChannelIds"), {defaultExport: false});
        if (!PrivateChannelList || !PrivateChannelList.Z) return this.warn("Could not find PrivateChannelList", PrivateChannelList);
        const PrivateChannelButton = WebpackModules.getModule(m => m?.prototype?.render?.toString().includes("linkButton"), {searchExports: true});
        if (!PrivateChannelButton) return this.warn("Could not find PrivateChannelButton", PrivateChannelButton);
        this.after(PrivateChannelList, "Z", (_, __, returnValue) => {
            const destination = returnValue?.props?.children?.props?.children;
            if (!destination || !Array.isArray(destination)) return;
            if (destination.find(b => b?.props?.children?.props?.id === "public-server-button")) return;
            
            destination.push(
                React.createElement(ErrorBoundary, null,
                    React.createElement(PrivateChannelButton,
                        {
                            id: "public-server-button",
                            onClick: () => this.openPublicServers(),
                            text: "Public Servers",
                            icon: () => React.createElement(Globe, {color: "currentColor"})
                        }
                    )
                )
            );
        });
    }

    disabled() {
        this.unpatchAll();
        // DOM.query("#bd-pub-li").remove();
    }

    async _appendButton() {
        await new Promise(r => setTimeout(r, 1000));
        
        const existing = document.querySelector("#bd-pub-li");
        if (existing) return;

        const guilds = document.querySelector(`.${DiscordModules.GuildClasses.guilds} .${DiscordModules.GuildClasses.listItem}`);
        if (!guilds) return;

        guilds.parentNode.insertBefore(this.button, guilds.nextSibling);
    }

    openPublicServers() {
        LayerManager.pushLayer(() => DiscordModules.React.createElement(PublicServersMenu, {close: LayerManager.popLayer}));
    }

    get button() {
        const btn = DOMManager.parseHTML(`<div id="bd-pub-li" class="${DiscordModules.GuildClasses.listItem}">`);
        const label = DOMManager.parseHTML(`<div id="bd-pub-button" class="${DiscordModules.GuildClasses.wrapper + " " + DiscordModules.GuildClasses.circleIconButton}">${Strings.PublicServers.button}</div>`);
        label.addEventListener("click", () => {this.openPublicServers();});
        btn.append(label);
        return btn;
    }
};