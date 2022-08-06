import {React, Strings, Utilities, WebpackModules} from "modules";

import Modals from "../../modals";
import Heart from "../../icons/heart";
import Download from "../../icons/download";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const Button = WebpackModules.getByProps("DropdownSizes");

export default class StoreCard extends React.PureComponent {
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

    preview(event) {
        event.preventDefault();
        event.stopPropagation();

        Modals.showImageModal(this.props.thumbnail, {
            width: Utilities.getNestedProp(event, "target.naturalWidth"), 
            height: Utilities.getNestedProp(event, "target.naturalHeight")
        });
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

    render() {
        const {name, description, author, tags, selectedTag, likes, downloads, releaseDate, thumbnail, className} = this.props;

        return <div className={"bd-store-card" + (className ? ` ${className}` : "")} data-addon-name={name}>
            <div className="bd-store-card-header">
                <div className="bd-store-card-splash">
                    <img
                        key={thumbnail}
                        onClick={this.preview.bind(this)}
                        alt={name}
                        src={thumbnail}
                    />
                </div>
                <div className="bd-store-card-icon">
                    <Tooltip color="primary" position="top" text={author.display_name}>
                        {props =>
                            <img {...props} alt={author.display_name} src={`https://github.com/${author.github_name}.png?size=44`} />
                        }
                    </Tooltip>
                </div>
            </div>
            <div className="bd-store-card-body">
                <div className="bd-store-card-title">
                    <h5>{name}</h5>
                    {this.monthsAgo(releaseDate) <= 3
                        ? <Tooltip color="primary" position="top" text={Strings.Store.uploadDate.format({date: new Date(releaseDate).toLocaleString()})}>
                            {props => <span {...props} className="bd-store-card-new-badge">{Strings.Store.new}</span>}
                        </Tooltip>
                        : null
                    }
                </div>
                <p>{description}</p>
                <div className="bd-card-tags">
                    {
                        tags.map(tag => <span className={Utilities.joinClassNames({selected: tag === selectedTag})}>{tag}</span>)
                    }
                </div>
                <div className="bd-store-card-footer">
                    <div className="bd-store-card-stats">
                        <Tooltip color="primary" position="top" text={Strings.Store.likesAmount.format({amount: likes})}>
                            {props =>
                                <div {...props} className="bd-store-card-stat">
                                    <Heart />
                                    <span>{this.abbreviateStat(likes)}</span>
                                </div>
                            }
                        </Tooltip>
                        <Tooltip color="primary" position="top" text={Strings.Store.downloadsAmount.format({amount: downloads})}>
                            {props =>
                                <div {...props} className="bd-store-card-stat">
                                    <Download />
                                    <span>{this.abbreviateStat(downloads)}</span>
                                </div>
                            }
                        </Tooltip>
                    </div>
                    <Button
                        color={this.props.isInstalled ? Button.Colors.RED : Button.Colors.GREEN}
                        size={Button.Sizes.SMALL}
                        onClick={this.onButtonClick.bind(this)}
                    >
                        {this.props.isInstalled ? Strings.Addons.deleteAddon : Strings.Addons.install}
                    </Button>
                </div>
            </div>
        </div>;
    }
}