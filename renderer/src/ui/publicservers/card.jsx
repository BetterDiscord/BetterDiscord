import {React, Strings} from "modules";

const badge = <div className="flowerStarContainer-3zDVtj verified-1eC5dy background-2uufRq guildBadge-RlDbED"
style={{width: "16px", height: "16px"}}>
<svg aria-label="Verified &amp; Partnered" className="flowerStar-1GeTsn"
    aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2">
    <path fill="currentColor" fillRule="evenodd"
        d="m16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z">
    </path>
</svg>
<div className="childContainer-1wxZNh">
    <svg className="icon-1ihkOt" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2">
        <path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="currentColor"></path>
    </svg>
</div>
</div>;

export default class ServerCard extends React.Component {
    constructor(props) {
        super(props);
        if (!this.props.server.iconUrl) this.props.server.iconUrl = this.props.defaultAvatar();
        this.state = {
            joined: this.props.joined
        };
        this.join = this.join.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    render() {
        const {server} = this.props;
        const addedDate = new Date(server.insertDate * 1000); // Convert from unix timestamp
        const buttonText = typeof(this.state.joined) == "string" ? `${Strings.PublicServers.joining}...` : this.state.joined ? Strings.PublicServers.joined : Strings.PublicServers.join;

        return <div className="bd-server-card" role="button" tabIndex="0" onClick={this.join}>
                    <div className="bd-server-header">
                            <div className="bd-server-splash-container"><img src={server.iconUrl} onError={this.handleError} className="bd-server-splash" /></div>
                            <img src={server.iconUrl} onError={this.handleError} className="bd-server-icon" />
                    </div>
                    <div className="bd-server-info">
                        <div className="bd-server-title">
                            {server.pinned && badge}
                            <div className="bd-server-name">{server.name}</div>
                            {this.state.joined && <div className="bd-server-tag">{buttonText}</div>}
                        </div>
                        <div className="bd-server-description">{server.description}</div>
                        <div className="bd-server-footer">
                            <div className="bd-server-count">
                                <div className="bd-server-count-dot"></div>
                                <div className="bd-server-count-text">{server.members.toLocaleString()} Members</div>
                            </div>
                            <div className="bd-server-count">
                                <div className="bd-server-count-dot"></div>
                                <div className="bd-server-count-text">Added {addedDate.toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>;
    }

    handleError() {
        this.props.server.iconUrl = this.props.defaultAvatar();
    }

    async join() {
        if (this.state.joined) return this.props.navigateTo(this.props.server.identifier);
        this.setState({joined: "joining"});
        const didJoin = await this.props.join(this.props.server.identifier, this.props.server.nativejoin);
        this.setState({joined: didJoin});
    }
}