import {Settings, Events, DiscordClasses, React, Strings, Utilities, WebpackModules} from "modules";
import {Support, Version, Github, Author, Description, Clock} from "icons";
import BdWebApi from "../modules/bdwebapi";

const ModalComponents = WebpackModules.getByProps("ModalRoot");
const Anchor = WebpackModules.getByDisplayName("Anchor");
const Button = WebpackModules.getByProps("BorderColors");
const Spinner = WebpackModules.getByDisplayName("Spinner");
const {TooltipContainer: Tooltip} = WebpackModules.getByProps("TooltipContainer");

export default class InstallationModal extends React.Component {
    constructor() {
        super(...arguments);

        this.enable = this.enable.bind(this);
        this.state = {
            isInstalling: false
        };
    }

    get thumbnail() {return `https://${BdWebApi.webHostname}${this.props.thumbnail_url ?? "/resources/store/missing.svg"}`;}

    async install(id, filename) {
        this.setState({isInstalling: true});
        if (Settings.get("settings", "addons", "autoEnable")) {
            Events.on(`${this.props.type}-loaded`, this.enable);
        }
        await this.props.installAddon(id, filename, this.props.type);
        this.setState({isInstalling: false});
        this.props.onClose();
    }

    enable(addon) {
        if (this.props.enableAddon && addon.filename === this.props.file_name) this.props.enableAddon(addon);
        Events.off(`${this.props.type}-loaded`, this.enable);
    }

    onKeyDown = (event) => {
        const {key} = event;

        if (key === "Escape" || key === "Enter" || key === " ") event.stopPropagation();
        if (key === "Escape") this.props.onClose();
        if (key === "Enter" || key === " ") {
            this.install(this.props.id, this.props.file_name);
        }
    }

    render() {
        const {name, id, description, author, release_date, type, version, file_name} = this.props;

        return <ModalComponents.ModalRoot {...this.props} onKeyDown={this.onKeyDown} size="small" className="bd-installation-modal">
            <ModalComponents.ModalHeader className="bd-installation-header">
                <img className="bd-installation-thumbnail" src={this.thumbnail} alt={`${name} thumbnail`}/>
                <Tooltip className="bd-installation-icon" color="primary" position="top" text={author.display_name}>
                    <img alt={author.display_name} src={`https://github.com/${author.github_name}.png?size=44`} />
                </Tooltip>
                <ModalComponents.ModalCloseButton onClick={this.props.onClose} className="bd-installation-close"/>
            </ModalComponents.ModalHeader>
            <ModalComponents.ModalContent className="bd-installation-content">
                <h5 className={Utilities.joinClassNames("bd-installation-name", DiscordClasses.Text.size16, DiscordClasses.Text.colorHeaderPrimary)}>{name}</h5>
                <div className={Utilities.joinClassNames(DiscordClasses.Text.size14, DiscordClasses.Text.colorHeaderSecondary)}>
                    {Strings.Addons.installConfirmation.format({type})}
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
                    <InfoItem icon={<Clock aria-label={Strings.Addons.uploadDate.format({date: new Date(release_date).toLocaleString()})} />} id="bd-info-upload-date" label={Strings.Addons.uploadDate.format({date: new Date(release_date).toLocaleString()})}>
                        {Strings.Addons.uploadDate.format({date: new Date(release_date).toLocaleString()})}
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Github aria-label={Strings.Addons.source} />} id="bd-info-source" label={Strings.Addons.source}>
                        <Anchor href={`https://${BdWebApi.webHostname}/gh-redirect?id=${id}`} target="_blank" rel="noreferrer noopener">{file_name}</Anchor>
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Author aria-label={Strings.Addons.author} />} id="bd-info-author" label={Strings.Addons.uploaded}>
                        <Anchor href={`https://${BdWebApi.webHostname}/developer/${author.display_name}`} target="_blank" rel="noreferrer noopener">{author.display_name}</Anchor>
                    </InfoItem>
                </ul>
            </ModalComponents.ModalContent>
            <ModalComponents.ModalFooter>
                <Button onClick={() => this.install(id, file_name)} color={Button.Colors.GREEN} disabled={this.state.isInstalling}>
                    {this.state.isInstalling ? <Spinner type={Spinner.Type.PULSING_ELLIPSIS} /> : (Strings.Modals.install ?? "Install")}
                </Button>
            </ModalComponents.ModalFooter>
        </ModalComponents.ModalRoot>;
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