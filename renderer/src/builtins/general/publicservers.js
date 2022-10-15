import Builtin from "../../structs/builtin";
import {DiscordModules, WebpackModules, Strings, DOMManager, React, ReactDOM} from "modules";
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
            if (destination.find(b => b?.props?.children?.props?.id === "public-servers-button")) return; // If it exists, don't try to add again
            
            destination.push(
                React.createElement(ErrorBoundary, null,
                    React.createElement(PrivateChannelButton,
                        {
                            id: "public-servers-button",
                            onClick: () => this.openPublicServers(),
                            text: Strings.PublicServers.button,
                            icon: () => React.createElement(Globe, {color: "currentColor"})
                        }
                    )
                )
            );
        });

        /**
         * On being first enabled, we have no way of forceUpdating the list,
         * so clone and modify an existing button and add it to the end
         * of the button list.
         */
        const header = document.querySelector(`[class*="privateChannelsHeaderContainer-"]`);
        if (!header) return; // No known element
        const oldButton = header.previousElementSibling;
        if (!oldButton.className.includes("channel-")) return; // Not what we expected to be there

        // Clone existing button and set click handler
        const newButton = oldButton.cloneNode(true);
        newButton.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
            this.openPublicServers();
        });

        // Remove existing route and id
        const aSlot = newButton.querySelector("a");
        aSlot.href = "";
        aSlot.dataset.listItemId = "public-servers";

        // Remove any badges
        const premiumBadge = newButton.querySelector(`[class*="premiumTrial"]`);
        premiumBadge?.remove?.();
        const numberBadge = newButton.querySelector(`[class*="numberBadge-"]`);
        numberBadge?.remove?.();

        // Render our icon in the avatar slot
        const avatarSlot = newButton.querySelector(`[class*="avatar-"]`);
        avatarSlot.replaceChildren();
        ReactDOM.render(React.createElement(Globe, {color: "currentColor"}), avatarSlot);
        DOMManager.onRemoved(avatarSlot, () => ReactDOM.unmountComponentAtNode(avatarSlot));

        // Replace the existing name
        const nameSlot = newButton.querySelector(`[class*="name-"]`);
        nameSlot.textContent = Strings.PublicServers.button;

        // Insert before the header, end of the list
        header.parentNode.insertBefore(newButton, header);

        this.button = newButton;
    }

    disabled() {
        this.unpatchAll();
        this.button?.remove?.();
        document.querySelector("#public-servers-button")?.parentElement?.parentElement?.remove?.();
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
};