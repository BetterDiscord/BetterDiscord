import {React, Strings, Utilities, WebpackModules} from "modules";

import Modals from "../../modals";
import Heart from "../../icons/heart";
import Download from "../../icons/download";

const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const Button = WebpackModules.getByProps("DropdownSizes");

export default class StoreCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isInstalled: props.isInstalled(this.props.file_name)
        };
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

        Modals.showImageModal(this.props.thumbnail, {
            width: Utilities.getNestedProp(event, "target.naturalWidth"), 
            height: Utilities.getNestedProp(event, "target.naturalHeight")
        });
    }

    onClick = event => {
        const {onDetailsView} = this.props;
        if (typeof(onDetailsView) === "function") onDetailsView();
    }

    onButtonClick = async (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (event.shiftKey) {
            if (this.state.isInstalled) {
                this.props.deleteAddon(this.props.file_name);
                this.setState({isInstalled: false});
            } else {
                await this.props.installAddon(this.props.id, this.props.file_name, this.props.type);
                this.setState({isInstalled: true});
            }
        } else {
            if (this.state.isInstalled) {
                this.props.confirmAddonDelete(this.props.file_name, {
                    onDelete: () => this.setState({isInstalled: false})
                });
            } else {
                Modals.showInstallationModal({...this.props, onInstall: () => {
                    this.setState({isInstalled: true});
                }});
            }
        }   
    }

    render() {
        const {name, description, author, selectedTag, tags, likes, downloads, release_date, className} = this.props;

        return <div className={"bd-store-card" + (className ? ` ${className}` : "")} data-addon-name={name} onClick={this.onClick}>
            <div className="bd-store-card-header">
                <div className="bd-store-card-splash">
                    <img key={this.props.thumbnail} onClick={this.preview} alt={name} src={this.props.thumbnail} />
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
                        ? <Tooltip color="primary" position="top" text={Strings.Addons.uploadDate.format({date: new Date(release_date).toLocaleString()})}>
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
                        <Tooltip color="primary" position="top" text={Strings.Addons.likesAmount.format({amount: likes})}>
                            {props =>
                                <div {...props} className="bd-store-card-stat">
                                    <Heart />
                                    <span>{this.abbreviateStat(likes)}</span>
                                </div>
                            }
                        </Tooltip>
                        <Tooltip color="primary" position="top" text={Strings.Addons.downloadsAmount.format({amount: downloads})}>
                            {props =>
                                <div {...props} className="bd-store-card-stat">
                                    <Download />
                                    <span>{this.abbreviateStat(downloads)}</span>
                                </div>
                            }
                        </Tooltip>
                    </div>
                    <Button
                        color={this.state.isInstalled ? Button.Colors.RED : Button.Colors.GREEN}
                        size={Button.Sizes.SMALL}
                        onClick={this.onButtonClick}
                    >
                        {this.state.isInstalled ? Strings.Addons.deleteAddon : Strings.Addons.install}
                    </Button>
                </div>
            </div>
        </div>;
    }
}