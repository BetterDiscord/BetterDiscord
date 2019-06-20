import {React} from "modules";
import Manager from "./manager";

export default class ServerCard extends React.Component {
    constructor(props) {
        super(props);
        if (!this.props.server.iconUrl) this.props.server.iconUrl = Manager.getDefaultAvatar();
        this.state = {
            imageError: false,
            joined: Manager.hasJoined(this.props.server.identifier)
        };
    }

    render() {
        const {server} = this.props;
        return React.createElement(
            "div", // cardPrimary-1Hv-to
            {className: `card-3Qj_Yx cardPrimary-1Hv-to marginBottom8-AtZOdT bd-server-card${server.pinned ? " bd-server-card-pinned" : ""}`},
                React.createElement("img", {ref: "img", className: "bd-server-image", src: server.iconUrl, onError: this.handleError.bind(this)}),
                React.createElement(
                    "div",
                    {className: "flexChild-faoVW3 bd-server-content"},
                    React.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-header"},
                        React.createElement(
                            "h5",
                            {className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-name"},
                            server.name
                        ),
                        React.createElement(
                            "h5",
                            {className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-member-count"},
                            server.members,
                            " Members"
                        )
                    ),
                    React.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6"},
                        React.createElement(
                            "div",
                            {className: "scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y bd-server-description-container"},
                            React.createElement(
                                "div",
                                {className: "scroller-2FKFPG scroller bd-server-description"},
                                    server.description
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        {className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-footer"},
                        React.createElement(
                            "div",
                            {className: "flexChild-faoVW3 bd-server-tags", style: {flex: "1 1 auto"}},
                            server.categories.join(", ")
                        ),
                        this.state.joined && React.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN colorGreen-29iAKY", style: {minHeight: "12px", marginTop: "4px", backgroundColor: "#3ac15c"}},
                            React.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                typeof(this.state.joined) == "string" ? "Joining..." : "Joined"
                            )
                        ),
                        server.error && React.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN disabled-9aF2ug", style: {minHeight: "12px", marginTop: "4px", backgroundColor: "#c13a3a"}},
                            React.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Error"
                            )
                        ),
                        !server.error && !this.state.joined && React.createElement(
                            "button",
                            {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN", style: {minHeight: "12px", marginTop: "4px"}, onClick: () => {this.join();}},
                            React.createElement(
                                "div",
                                {className: "ui-button-contents"},
                                "Join"
                            )
                        )
                    )
                )
            // )
        );
    }

    handleError() {
        this.props.server.iconUrl = Manager.getDefaultAvatar();
        this.setState({imageError: true});
    }

    async join() {
        this.setState({joined: "joining"});
        const didJoin = await Manager.join(this.props.server.identifier, this.props.server.nativejoin);
        this.setState({joined: didJoin});
    }
}