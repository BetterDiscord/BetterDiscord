import {DiscordClasses, React, Strings, Utilities, WebpackModules} from "modules";
import {Web} from "data";

import Support from "./icons/support";
import Version from "./icons/version";
import Github from "./icons/github";
import Author from "./icons/author";
import Description from "./icons/description";
import Clock from "./icons/clock";

const Anchor = WebpackModules.getByDisplayName("Anchor");
const Button = WebpackModules.getByProps("BorderColors");
const Spinner = WebpackModules.getByDisplayName("Spinner");
const {TooltipContainer: Tooltip} = WebpackModules.getByProps("TooltipContainer");
const {ModalRoot, ModalHeader, ModalContent, ModalCloseButton, ModalFooter} = WebpackModules.getByProps("ModalRoot");

export default class InstallationModal extends React.Component {
    constructor() {
        super(...arguments);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.state = {
            isInstalling: false
        };
    }

    async install(id, filename) {
        this.setState({isInstalling: true});
        await this.props.onInstall?.(id, filename, this.props.type);
        this.setState({isInstalling: false});
        this.props.onClose();
    }
 
    onKeyDown(event) {
        const {key} = event;

        if (key === "Escape" || key === "Enter" || key === " ") event.stopPropagation();
        if (key === "Escape") this.props.onClose();
        if (key === "Enter" || key === " ") {
            this.install(this.props.id, this.props.filename);
        }
    }

    render() {
        const {name, id, description, author, releaseDate, type, version, filename} = this.props;

        return <ModalRoot {...this.props} onKeyDown={this.onKeyDown} size="small" className="bd-installation-modal">
            <ModalHeader className="bd-installation-header">
                <img className="bd-installation-thumbnail" src={this.props.thumbnail} alt={`${name} thumbnail`}/>
                <Tooltip className="bd-installation-icon" color="primary" position="top" text={author.display_name}>
                    <img alt={author.display_name} src={`https://github.com/${author.github_name}.png?size=44`} />
                </Tooltip>
                <ModalCloseButton onClick={this.props.onClose} className="bd-installation-close"/>
            </ModalHeader>
            <ModalContent className="bd-installation-content">
                <h5 className={Utilities.joinClassNames("bd-installation-name", DiscordClasses.Text.size16, DiscordClasses.Text.colorHeaderPrimary)}>{name}</h5>
                <div className={Utilities.joinClassNames(DiscordClasses.Text.size14, DiscordClasses.Text.colorHeaderSecondary)}>
                    {Strings.Store.installConfirmation.format({type})}
                </div>
                <ul className="bd-installation-info">
                    <InfoItem icon={<Description aria-label={Strings.Addons.description} />} id="bd-info-description" label={Strings.Addons.description}>
                        {description}
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Version aria-label={Strings.Addons.version} />} id="bd-info-version" label={Strings.Addons.version}>
                        {version}
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Clock aria-label={Strings.Store.uploadDate.format({date: releaseDate.toLocaleString()})} />} id="bd-info-upload-date" label={Strings.Store.uploadDate.format({date: releaseDate.toLocaleString()})}>
                        {Strings.Store.uploadDate.format({date: releaseDate.toLocaleString()})}
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Github aria-label={Strings.Addons.source} />} id="bd-info-source" label={Strings.Addons.source}>
                        <Anchor href={Web.ENDPOINTS.githubRedirect(id)} target="_blank" rel="noreferrer noopener">{filename}</Anchor>
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Author aria-label={Strings.Addons.author} />} id="bd-info-author" label={Strings.Addons.uploaded}>
                        <Anchor href={`${Web.PAGES.developer}/${author.display_name}`} target="_blank" rel="noreferrer noopener">{author.display_name}</Anchor>
                    </InfoItem>
                </ul>
            </ModalContent>
            <ModalFooter>
                <Button onClick={() => this.install(id, filename)} color={Button.Colors.GREEN} disabled={this.state.isInstalling}>
                    {this.state.isInstalling ? <Spinner type={Spinner.Type.PULSING_ELLIPSIS} /> : (Strings.Modals.install ?? "Install")}
                </Button>
            </ModalFooter>
        </ModalRoot>;
    }
}

class InfoItem extends React.Component {
    render() {
        return <li id={this.props.id}>
            <Tooltip className="bd-info-icon" color="primary" position="top" text={this.props.label}>
                {
                    this.props.icon ? this.props.icon : <Support />
                }
            </Tooltip>
            <span>
                {this.props.children}
            </span>
        </li>;
    }
}