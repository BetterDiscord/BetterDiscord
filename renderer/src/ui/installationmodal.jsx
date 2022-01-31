import {DiscordClasses, React, Strings, Utilities, WebpackModules} from "modules";
import {WEB_HOSTNAME} from "./settings/addonlist/constants";
import {Support, Version, Github, Author, Description} from "icons";
import Toasts from "./toasts";
import https from "https";
import fs from "fs";
import path from "path";
import url from "url";

const ModalComponents = WebpackModules.getByProps("ModalRoot");
const Anchor = WebpackModules.getByDisplayName("Anchor");
const Button = WebpackModules.getByProps("BorderColors");
const Spinner = WebpackModules.getByDisplayName("Spinner");
const {TooltipContainer: Tooltip} = WebpackModules.getByProps("TooltipContainer");

export default class InstallationModal extends React.Component {
    constructor() {
        super(...arguments);

        this.state = {
            isInstalling: false
        };
    }

    get thumbnail() {return `https://${WEB_HOSTNAME}${this.props.thumbnail_url ?? "/resources/store/missing.svg"}`;}

    install(id, sourceUrl) {
        try {
            const downloadUrl = `https://${WEB_HOSTNAME}/download?id=${id}`;
            https.get(downloadUrl, response => {
                let chunks = [], filename = path.basename(url.parse(sourceUrl).path);
                response.on("data", chunk => chunks.push(chunk));
                response.on("end", () => {
                    const data = chunks.join("");
                    fs.writeFileSync(path.resolve(this.props.folder, filename), data, error => {
                        if (error) Toasts.show(Strings.Addons.writeError.format({ type: this.props.type, error }), {type: "error"});
                    });
                    this.props.closeModal();
                    this.setState({isInstalling: false});
                });
            });
        }
        catch (error) {
            Toasts.show(Strings.Addons.downloadError.format({ type: this.props.type, error }), {type: "error"});
        }
        this.setState({isInstalling: true});
    }

    render() {
        const {name, id, description, author, type, version, latest_source_url} = this.props;

        return <>
            <ModalComponents.ModalHeader className="bd-installation-header">
                <img className="bd-installation-thumbnail" src={this.thumbnail} alt={`${name} thumbnail`}/>
                <Tooltip className="bd-installation-icon" color="primary" position="top" text={author.display_name}>
                    <img alt={author.display_name} src={`https://github.com/${author.github_name}.png?size=44`} />
                </Tooltip>
                <ModalComponents.ModalCloseButton onClick={this.props.closeModal} className="bd-installation-close"/>
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
                    <InfoItem icon={<Github aria-label={Strings.Addons.source} />} id="bd-info-source" label={Strings.Addons.source}>
                        <Anchor href={latest_source_url} target="_blank" rel="noreferrer noopener">{path.basename(url.parse(latest_source_url).path)}</Anchor>
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Author aria-label={Strings.Addons.author} />} id="bd-info-author" label={Strings.Addons.author}>
                        <Anchor href={`http://${WEB_HOSTNAME}/developers/${author.display_name}`} target="_blank" rel="noreferrer noopener">{author.display_name}</Anchor>
                    </InfoItem>
                </ul>
            </ModalComponents.ModalContent>
            <ModalComponents.ModalFooter>
                <Button onClick={() => {this.install(id, latest_source_url)}} color={Button.Colors.GREEN} disabled={this.state.isInstalling}>
                    {this.state.isInstalling ? <Spinner type={Spinner.Type.PULSING_ELLIPSIS} /> : (Strings.Modals.install ?? "Install")}
                </Button>
            </ModalComponents.ModalFooter>
        </>;
    }
}

class InfoItem extends React.Component {
    render() {
        return <li id={this.props.id}>
            <Tooltip className="bd-info-icon" color="primary" position="top" text={this.props.label}>
                {
                    this.props.icon  ? this.props.icon : <Support />
                }
            </Tooltip>
            <span>
                {this.props.children}
            </span>
        </li>;
    }
}