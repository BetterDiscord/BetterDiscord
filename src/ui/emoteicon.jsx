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
        openContextMenu(e, () => <ContextMenu navId="EmoteContextMenu" onClose={closeContextMenu}>
            <MenuGroup>
                <MenuItem label={EmoteModule.isFavorite(this.props.emote) ? "Remove Favorite" : "Add Favorite"} id="favorite" action={this.handlefavorite.bind(this)} onClose={closeContextMenu}/>
            </MenuGroup>
        </ContextMenu>);
    }
    handlefavorite() {
        closeContextMenu();
        EmoteModule.isFavorite(this.props.emote) ? EmoteModule.removeFavorite(this.props.emote) : EmoteModule.addFavorite(this.props.emote, this.props.url);
    }
    inserText(emote) {
        ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {content: emote})
    }
}