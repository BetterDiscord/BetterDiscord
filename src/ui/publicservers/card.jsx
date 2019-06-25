import {React, Strings} from "modules";

export default class ServerCard extends React.Component {
    constructor(props) {
        super(props);
        if (!this.props.server.iconUrl) this.props.server.iconUrl = this.props.defaultAvatar();
        this.state = {
            imageError: false,
            joined: this.props.joined
        };
        this.join = this.join.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    render() {
        const {server} = this.props;
        const buttonText = typeof(this.state.joined) == "string" ? `${Strings.PublicServers.joining}...` : this.state.joined ? Strings.PublicServers.joined : Strings.PublicServers.join;
        const buttonClass = `bd-button${this.state.joined == true ? " bd-button-success" : ""}`;
        return <div className={`bd-server-card${server.pinned ? " bd-server-card-pinned" : ""}`}>
                <img className="bd-server-image" src={server.iconUrl} onError={this.handleError} />,
                <div className="bd-server-content">
                    <div className="bd-server-header">
                        <h5 className="bd-server-name">{server.name}</h5>
                        <h5 className="bd-server-member-count">{server.members} Members</h5>
                        </div>
                    <div className="bd-scroller-wrap bd-server-description-container">
                        <div className="bd-scroller bd-server-description">{server.description}</div>
                    </div>
                    <div className="bd-server-footer">
                        <div className="bd-server-tags">{server.categories.join(", ")}</div>
                        <button type="button" className={buttonClass} onClick={this.join}>{buttonText}</button>
                        </div>
                </div>
        </div>;
    }

    handleError() {
        this.props.server.iconUrl = this.props.defaultAvatar();
        this.setState({imageError: true});
    }

    async join() {
        if (this.state.joined) return;
        this.setState({joined: "joining"});
        const didJoin = await this.props.join(this.props.server.identifier, this.props.server.nativejoin);
        this.setState({joined: didJoin});
    }
}