import {Settings, React, WebpackModules, Events, Strings} from "modules";

const TooltipWrapper = WebpackModules.getByDisplayName("Tooltip");

export default class BDEmote extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldAnimate: !this.animateOnHover,
            isFavorite: this.props.isFavorite
        };

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
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
    }

    onMouseLeave() {
        if (this.state.shouldAnimate && this.animateOnHover) this.setState({shouldAnimate: false});
    }

    onClick(e) {
        if (this.props.onClick) this.props.onClick(e);
    }

    toggleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.isFavorite) Events.emit("emotes-favorite-removed", this.label);
        else Events.emit("emotes-favorite-added", this.label, this.props.url);
        this.setState({isFavorite: !this.state.isFavorite});
    }

    render() {
        return React.createElement(TooltipWrapper, {
                color: "primary",
                position: "top",
                text: this.label,
                delay: 750
            },
            (childProps) => {
                return React.createElement("div", Object.assign({
                    className: "emotewrapper" + (this.props.jumboable ? " jumboable" : ""),
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave,
                    onClick: this.onClick
                }, childProps),
                    React.createElement("img", {
                        draggable: false,
                        className: "emote" + this.modifierClass + (this.props.jumboable ? " jumboable" : "") + (!this.state.shouldAnimate ? " stop-animation" : ""),
                        dataModifier: this.props.modifier,
                        alt: this.label,
                        src: this.props.url
                    }),
                    React.createElement("input", {
                        className: "fav" + (this.state.isFavorite ? " active" : ""),
                        title: Strings.Emotes.favoriteAction,
                        type: "button",
                        onClick: this.toggleFavorite
                    })
                );
            });
    }
}