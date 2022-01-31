import {React, Strings, Utilities, WebpackModules} from "modules";
import {WEB_HOSTNAME} from "./constants";
import path from "path";
import url, {urlToHttpOptions} from "url";
import {Heart, Download} from "icons";
import Modals from "../../modals";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const Button = WebpackModules.getByProps("DropdownSizes");

export default class StoreCard extends React.Component {
    get thumbnail() {return `https://${WEB_HOSTNAME}${this.props.thumbnail_url ?? "/resources/store/missing.svg"}`;}

    install = (event) => {
        event.preventDefault();
        event.stopPropagation();

        Modals.showInstallationModal({...this.props});
    }

    preview = (event) => {
        event.preventDefault();
        event.stopPropagation();

        Modals.showImageModal(this.thumbnail, {
            width: Utilities.getNestedProp(event, "target.naturalWidth"), 
            height: Utilities.getNestedProp(event, "target.naturalHeight")
        });
    }

    get isInstalled() {
        return this.props.isInstalled(path.basename(url.parse(this.props.latest_source_url).path));
    }

    abbreviateStat(n) {
        if (n < 1e3) return n;
        if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
        if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    }

    handleClick = () => {
        this.props.onDetailsView();
    }

    render() {
        const {name, description, author, selectedTag, tags, likes, downloads} = this.props;

        const isInstalled = this.isInstalled;

        return <div className="bd-store-card" data-addon-name={name} onClick={this.handleClick}>
            <div className="bd-store-card-header">
                <div className="bd-store-card-splash">
                    <img onClick={this.preview} alt={name} src={this.thumbnail} />
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
                <h5>{name}</h5>
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
                    <Button color={Button.Colors.GREEN} size={Button.Sizes.SMALL} onClick={this.install} disabled={isInstalled}>
                        {isInstalled ? Strings.Addons.installed : Strings.Addons.install}
                    </Button>
                </div>
            </div>
        </div>;
    }
}