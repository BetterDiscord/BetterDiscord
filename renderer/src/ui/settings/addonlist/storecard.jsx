import {Settings, React, Strings, Utilities, WebpackModules} from "modules";
import {Heart, Download} from "icons";
import BdWebApi from "../../../modules/bdwebapi";
import Modals from "../../modals";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const Button = WebpackModules.getByProps("DropdownSizes");

export default class StoreCard extends React.Component {
    get thumbnail() {
        return `https://${BdWebApi.webHostname}${this.props.thumbnail_url ?? "/resources/store/missing.svg"}`;
    }

    get monthsAgo() {
        const current = new Date();
        const release = new Date(this.props.release_date);
        let months = (((current.getFullYear() - release.getFullYear()) * 12) - release.getMonth()) + current.getMonth();

        return Math.max(months, 0);
    }

    abbreviateStat(n) {
        if (n < 1e3) return n;
        if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
        if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    }

    preview = (event) => {
        event.preventDefault();
        event.stopPropagation();

        Modals.showImageModal(this.thumbnail, {
            width: Utilities.getNestedProp(event, "target.naturalWidth"), 
            height: Utilities.getNestedProp(event, "target.naturalHeight")
        });
    }

    onClick = (event) => {
        const {onDetailsView} = this.props;
        if (typeof onDetailsView !== "function") return;

        onDetailsView();
    }

    onButtonClick = (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (event.shiftKey) {
            this.props.isInstalled ? this.props.deleteAddon(this.props.file_name) : this.props.installAddon(this.props.id, this.props.file_name, this.props.type);
        } else {
            this.props.isInstalled ? this.props.confirmAddonDelete(this.props.file_name) : Modals.showInstallationModal({ ...this.props });;
        }
    }

    render() {
        const {isInstalled, name, description, author, selectedTag, tags, likes, downloads, release_date, className} = this.props;

        return <div className={"bd-store-card" + (className ? ` ${className}` : "")} data-addon-name={name} onClick={this.onClick}>
            <div className="bd-store-card-header">
                <div className="bd-store-card-splash">
                    <img key={this.thumbnail} onClick={this.preview} alt={name} src={this.thumbnail} />
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
                <div class="bd-store-card-title">
                    <h5>{name}</h5>
                    {this.monthsAgo <= 3
                        ? <Tooltip color="primary" position="top" text={Strings.Addons.uploadDate.format({ date: new Date(release_date).toLocaleString()})}>
                            {props => <span {...props} className="bd-store-card-new-badge">{Strings.Addons.new}</span>}
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
                        <Tooltip color="primary" position="top" text={Strings.Addons.likesAmount.format({ amount: likes })}>
                            {props =>
                                <div {...props} className="bd-store-card-stat">
                                    <Heart />
                                    <span>{this.abbreviateStat(likes)}</span>
                                </div>
                            }
                        </Tooltip>
                        <Tooltip color="primary" position="top" text={Strings.Addons.downloadsAmount.format({ amount: downloads })}>
                            {props =>
                                <div {...props} className="bd-store-card-stat">
                                    <Download />
                                    <span>{this.abbreviateStat(downloads)}</span>
                                </div>
                            }
                        </Tooltip>
                    </div>
                    <Button
                        color={isInstalled ? Button.Colors.RED : Button.Colors.GREEN}
                        size={Button.Sizes.SMALL}
                        onClick={this.onButtonClick}
                    >
                        {isInstalled ? Strings.Addons.deleteAddon : Strings.Addons.install}
                    </Button>
                </div>
            </div>
        </div>;
    }
}