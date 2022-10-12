import {React, Strings, Utilities} from "modules";

import Heart from "../../icons/heart";
import Download from "../../icons/download";
import Tooltip from "../../tooltip";

export default class StoreCard extends React.PureComponent {
    constructor(props) {
        super(props);

        this.authorRef = React.createRef();
        this.newBadgeRef = React.createRef();
        this.likesRef = React.createRef();
        this.downloadsRef = React.createRef();
    }
    
    abbreviateStat(n) {
        if (n < 1e3) return n;
        if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
        if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    }

    monthsAgo(date) {
        const current = new Date();
        const release = new Date(date);
        const months = (((current.getFullYear() - release.getFullYear()) * 12) - release.getMonth()) + current.getMonth();

        return Math.max(months, 0);
    }

    async onButtonClick(event) {
        event.stopPropagation();
        event.preventDefault();

        if (this.props.isInstalled) {
            if (event.shiftKey) this.props.onForceDelete?.();
            else this.props.onDelete?.();
        }
        else {
            if (event.shiftKey) this.props.onForceInstall?.();
            else this.props.onInstall?.();
        }
    }

    componentDidMount() {
        if (this.newBadgeRef?.current) {
            Tooltip.create(this.newBadgeRef.current, Strings.Store.uploadDate.format({date: new Date(this.props.releaseDate).toLocaleString()}));
        }
        Tooltip.create(this.authorRef.current, this.props.author.display_name);
        Tooltip.create(this.likesRef.current, Strings.Store.likesAmount.format({amount: this.props.likes}));
        Tooltip.create(this.downloadsRef.current, Strings.Store.likesAmount.format({amount: this.props.downloads}));
    }

    render() {
        const {name, description, author, tags, selectedTag, likes, downloads, releaseDate, thumbnail, className} = this.props;

        return <div className={"bd-store-card" + (className ? ` ${className}` : "")} data-addon-name={name}>
            <div className="bd-store-card-header">
                <div className="bd-store-card-splash">
                    <img
                        key={thumbnail}
                        alt={name}
                        src={thumbnail}
                    />
                </div>
                <div className="bd-store-card-icon">
                    <img ref={this.authorRef} alt={author.display_name} src={`https://github.com/${author.github_name}.png?size=44`} />
                </div>
            </div>
            <div className="bd-store-card-body">
                <div className="bd-store-card-title">
                    <h5>{name}</h5>
                    {this.monthsAgo(releaseDate) <= 3 && <span ref={this.newBadgeRef} className="bd-store-card-new-badge">{Strings.Store.new}</span>}
                </div>
                <p>{description}</p>
                <div className="bd-card-tags">
                    {tags.map(tag => <span className={Utilities.className({selected: tag === selectedTag})}>{tag}</span>)}
                </div>
                <div className="bd-store-card-footer">
                    <div className="bd-store-card-stats">
                        <div ref={this.likesRef} className="bd-store-card-stat">
                            <Heart />
                            <span>{this.abbreviateStat(likes)}</span>
                        </div>
                        <div ref={this.downloadsRef} className="bd-store-card-stat">
                            <Download />
                            <span>{this.abbreviateStat(downloads)}</span>
                        </div>
                    </div>
                    <button
                        className={Utilities.className("bd-button", "size-small", (this.props.isInstalled ? "bd-button-danger" : "bd-button-success"))}
                        onClick={this.onButtonClick.bind(this)}
                    >
                        {this.props.isInstalled ? Strings.Addons.deleteAddon : Strings.Addons.install}
                    </button>
                </div>
            </div>
        </div>;
    }
}