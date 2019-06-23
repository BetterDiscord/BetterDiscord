import {Settings, React, WebpackModules} from "modules";
import EmoteMenu from "../builtins/emotemenu";

const TooltipWrapper = WebpackModules.getByDisplayName("TooltipDeprecated");

export default class BDEmote extends React.Component {
    constructor(props) {
        super(props);

        const isFav = EmoteMenu && EmoteMenu.favoriteEmotes && EmoteMenu.favoriteEmotes[this.label] ? true : false;
        this.state = {
            shouldAnimate: !this.animateOnHover,
            isFavorite: isFav
        };

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    get animateOnHover() {
        return Settings.get("emotes", "general", "animateOnHover");
    }

    get label() {
        return this.props.modifier ? `${this.props.name}:${this.props.modifier}` : this.props.name;
    }

    get modifierClass() {
        return this.props.modifier ? ` emote${this.props.modifier}` : "";
    }

    onMouseEnter() {
        if (!this.state.shouldAnimate && this.animateOnHover) this.setState({shouldAnimate: true});
        if (!this.state.isFavorite && EmoteMenu.favoriteEmotes[this.label]) this.setState({isFavorite: true});
        else if (this.state.isFavorite && !EmoteMenu.favoriteEmotes[this.label]) this.setState({isFavorite: false});
    }

    onMouseLeave() {
        if (this.state.shouldAnimate && this.animateOnHover) this.setState({shouldAnimate: false});
    }

    onClick(e) {
        if (this.props.onClick) this.props.onClick(e);
    }

    render() {
        return React.createElement(TooltipWrapper, {
                color: "black",
                position: "top",
                text: this.label,
                delay: 750
            },
                React.createElement("div", {
                    className: "emotewrapper" + (this.props.jumboable ? " jumboable" : ""),
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave,
                    onClick: this.onClick
                },
                    React.createElement("img", {
                        draggable: false,
                        className: "emote" + this.modifierClass + (this.props.jumboable ? " jumboable" : "") + (!this.state.shouldAnimate ? " stop-animation" : ""),
                        dataModifier: this.props.modifier,
                        alt: this.label,
                        src: this.props.url
                    }),
                    React.createElement("input", {
                        className: "fav" + (this.state.isFavorite ? " active" : ""),
                        title: "Favorite!",
                        type: "button",
                        onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.state.isFavorite) {
                                delete EmoteMenu.favoriteEmotes[this.label];
                                EmoteMenu.updateFavorites();
                            }
                            else {
                                EmoteMenu.favorite(this.label, this.props.url);
                            }
                            this.setState({isFavorite: !this.state.isFavorite});
                        }
                    })
                )
            );
    }
}