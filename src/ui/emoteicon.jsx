import {React, WebpackModules, DiscordModules} from "modules";
import EmoteModule from "../builtins/emotes/emotes";
const {openContextMenu, closeContextMenu} = WebpackModules.getByProps("openContextMenu");
const {MenuItem, MenuGroup} = WebpackModules.find(m => m.MenuRadioItem && !m.default);
const ContextMenu = WebpackModules.getByProps("default", "MenuStyle").default;
const {ComponentDispatch} = WebpackModules.getByProps("ComponentDispatch");
export default class EmoteIcon extends React.Component {
    render() {
        return <div className="emote-container" onClick={this.handleOnClick.bind(this)} onContextMenu={this.handleOnContextMenu.bind(this)}>
            <img src={this.props.url} alt={this.props.emote} title={this.props.emote}/>
        </div>
    }
    handleOnClick() {
        this.inserText(this.props.emote);
    }
    handleOnContextMenu(e) {
        openContextMenu(e, () => <ContextMenu navId="EmoteContextMenu" onClose={() => closeContextMenu()}>
            <MenuGroup>
                <MenuItem id="remove-favorite" onClick={this.handleUnfavorite.bind(this)} onClose={() => closeContextMenu()}/>
            </MenuGroup>
        </ContextMenu>);
    }
    handleUnfavorite() {
        EmoteModule.removeFavorite(this.props.emote);
    }
    inserText(emote) {
        ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {content: emote})
    }
}