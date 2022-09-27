import Builtin from "../../structs/builtin";
import {DiscordModules, WebpackModules, Strings, DOM, React} from "modules";
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
        // let target = null;
        // WebpackModules.getModule((_, m) => {
        //     if (m.exports?.toString().includes("privateChannelIds")) {
        //         target = m.exports;
        //     }
        // });
        // if (!target || !target.Z) return;
        // const PrivateChannelListComponents = WebpackModules.getByProps("LinkButton");
        // this.after(target, "Z", (_, __, returnValue) => {
        //     const destination = returnValue?.props?.children?.props?.children;
        //     if (!destination || !Array.isArray(destination)) return;
        //     if (destination.find(b => b?.props?.children?.props?.id === "public-server-button")) return;
            
            // destination.push(
            //     React.createElement(ErrorBoundary, null,
            //         React.createElement(PrivateChannelListComponents.LinkButton,
            //             {
            //                 id: "public-server-button",
            //                 onClick: () => this.openPublicServers(),
            //                 text: "Public Servers",
            //                 icon: () => React.createElement(Globe, {color: "currentColor"})
            //             }
            //         )
            //     )
            // );
        // });
    }

    disabled() {
        // this.unpatchAll();
        // DOM.query("#bd-pub-li").remove();
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
        LayerManager.pushLayer(() => DiscordModules.React.createElement(PublicServersMenu, {close: LayerManager.popLayer}));
    }

    get button() {
        const btn = DOM.createElement(`<div id="bd-pub-li" class="${DiscordModules.GuildClasses.listItem}">`);
        const label = DOM.createElement(`<div id="bd-pub-button" class="${DiscordModules.GuildClasses.wrapper + " " + DiscordModules.GuildClasses.circleIconButton}">${Strings.PublicServers.button}</div>`);
        label.addEventListener("click", () => {this.openPublicServers();});
        btn.append(label);
        return btn;
    }
};