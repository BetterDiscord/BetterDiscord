import {React, Strings, WebpackModules} from "modules";
import {Web} from "data";

import Spinner from "./spinner";
import Tooltip from "./tooltip";

import Support from "./icons/support";
import Version from "./icons/version";
import Github from "./icons/github";
import Author from "./icons/author";
import Description from "./icons/description";
import Clock from "./icons/clock";

const {Header, Content, CloseButton, Footer} = WebpackModules.getByProps("Header", "Footer");
const ModalRoot = WebpackModules.getModule(m => m?.toString?.()?.includes("ENTERING"), {searchExports: true});

export default class InstallationModal extends React.Component {
    constructor() {
        super(...arguments);

        this.authorRef = React.createRef();
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

    componentDidMount() {
        Tooltip.create(this.authorRef.current, this.props.author.display_name);
    }

    render() {
        const {name, id, description, author, releaseDate, type, version, filename} = this.props;

        return <ModalRoot {...this.props} onKeyDown={this.onKeyDown} size="small" className="bd-installation-modal">
            <Header className="bd-installation-header">
                <img className="bd-installation-thumbnail" src={this.props.thumbnail} alt={`${name} thumbnail`}/>
                <div ref={this.authorRef} className="bd-installation-icon">
                    <img alt={author.display_name} src={`https://github.com/${author.github_name}.png?size=44`} />
                </div>
                <CloseButton onClick={this.props.onClose} className="bd-installation-close"/>
            </Header>
            <Content className="bd-installation-content">
                <h5 className="bd-installation-name">{name}</h5>
                <div className="bd-installation-subtitle">
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
                        <a href={Web.ENDPOINTS.githubRedirect(id)} target="_blank" rel="noreferrer noopener">{filename}</a>
                    </InfoItem>
                    <div className="bd-info-divider" role="separator"></div>
                    <InfoItem icon={<Author aria-label={Strings.Addons.author} />} id="bd-info-author" label={Strings.Addons.uploaded}>
                        <a href={`${Web.PAGES.developer}/${author.display_name}`} target="_blank" rel="noreferrer noopener">{author.display_name}</a>
                    </InfoItem>
                </ul>
            </Content>
            <Footer className="bd-modal-footer">
                <button className="bd-button size-medium bd-button-success" onClick={() => this.install(id, filename)} disabled={this.state.isInstalling}>
                    {this.state.isInstalling ? <Spinner type={Spinner.Type.PULSING_ELLIPSIS} /> : (Strings.Modals.install ?? "Install")}
                </button>
            </Footer>
        </ModalRoot>;
    }
}

class InfoItem extends React.Component {
    constructor(props) {
        super(props);

        this.iconRef = React.createRef();
    }

    componentDidMount() {
        new Tooltip(this.iconRef.current, this.props.label);
    }

    render() {
        return <li id={this.props.id}>
            <div ref={this.iconRef} className="bd-info-icon">
                {this.props.icon ? this.props.icon : <Support />}
            </div>
            <span>
                {this.props.children}
            </span>
        </li>;
    }
}