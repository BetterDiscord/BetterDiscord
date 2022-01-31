import {React, Strings, Utilities, WebpackModules} from "modules";
import {API_CACHE, fetchData, fetchReadme, splitArray} from "./api";
import {WEB_HOSTNAME} from "./constants";
import {Heart, Download} from "icons";
import NoResults from "../../blankslates/noresults";
import {Next, Previous} from "icons";
import StoreCard from "./storecard";

const Button = WebpackModules.getByProps("DropdownSizes");
const Spinner = WebpackModules.getByDisplayName("Spinner");
const Tooltip = WebpackModules.getByDisplayName("Tooltip");

export default class StorePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: !!API_CACHE[props.type]?.length,
            selectedPage: 0,
            selectedAddon: null
        };
    }

    componentDidMount() {
        if (API_CACHE[this.props.type]?.length > 10) return;
        fetchData(this.props.type).then(data => {
            API_CACHE[this.props.type] = data;
            this.setState({isLoaded: true});
        });
    }

    matchAddon =(addon, query) => {
        let matches = ~addon.name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        matches = matches || ~addon.author.display_name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        matches = matches || ~addon.description.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        return matches;
    }

    filterTags = (addon) => {
        const matches = this.matchAddon(addon, this.props.query);
        const tagMatches = this.props.state.selectedTag === "all" || addon.tags.some(tag => tag === this.props.state.selectedTag);
        return tagMatches && matches;
    }

    get addons() {
        if (!this.state.isLoaded) return null;
        const {sort} = this.props;

        const final = API_CACHE[this.props.type]
            .flat(10)
            .filter(this.filterTags)
            .sort((a, b) => {
                try {
                    const first = a[sort];
                    const second = b[sort];
                    if (typeof(first) == "string") return first.toLocaleLowerCase().localeCompare(second.toLocaleLowerCase());
                    if (first > second) return 1;
                    if (second > first) return -1;
                }
                catch {}
                return 0;
            });
        if (!this.props.ascending) final.reverse();
        
        return splitArray(final, 16);
    }

    isInstalled = (name) => {return this.props.isLoaded(name);}

    renderDetailedView() {
        const addon = this.state.selectedAddon;

        if (!addon) return null;
        
        return <div className="bd-addon-detailed">
            <div className="bd-addon-banner">
                <img src={`https://${WEB_HOSTNAME}${addon.thumbnail_url ?? "/resources/store/missing.svg"}`} />
            </div>
            <div className="bd-addon-head">
                <div className="bd-addon-subheader">
                    <div className="bd-addon-info">
                        <Tooltip tooltipClassName="bd-store-tooltip" position="top" text={addon.author.display_name}>
                            {props =>
                                <img {...props} alt={addon.author.display_name} src={`https://github.com/${addon.author.github_name}.png?size=110`} />
                            }
                        </Tooltip>
                        <div className="bd-addon-stats">
                            <Tooltip tooltipClassName="bd-store-tooltip" color="primary" position="top" text={`${addon.likes.toLocaleString()} likes`}>
                                {props =>
                                    <Heart className="bd-addon-stat" {...props} />
                                }
                            </Tooltip>
                            <Tooltip tooltipClassName="bd-store-tooltip" color="primary" position="top" text={`${addon.downloads.toLocaleString()} downloads`}>
                                {props =>
                                    <Download className="bd-addon-stat" {...props} />
                                }
                            </Tooltip>
                        </div>
                    </div>
                    <Button
                        color={Button.Colors.GREEN}
                        size={Button.Sizes.SMALL}
                        onClick={() => {}}
                    >Install</Button>
                </div>
                <h1 className="bd-addon-name">{addon.name}</h1>
                <div className="bd-addon-description">{addon.description}</div>
            </div>
            <div className="bd-addon-column">
                <Readme type={this.props.type} addon={addon.name} />
                {/* <div className="bd-addon-controls">
                    <div className="bd-addon-control-card">
                        <div className="bd-addon-control">
                            <h5>Actions</h5>
                            <Button
                                color={Button.Colors.GREY}
                                size={Button.Sizes.LARGE}
                                onClick={() => {}}
                            >Source</Button>
                        </div>
                        <div className="bd-addon-control">
                            <h5>Details</h5>
                            <span className="bd-addon-detail" key="author">
                                <span>By </span>
                                <span>{addon.author.display_name}</span>
                            </span>
                            <span className="bd-addon-detail" key="version">
                                <span>Version: </span>
                                <span>{addon.version}</span>
                            </span>
                            <span className="bd-addon-detail" key="release">
                                <span>Updated: </span>
                                <span>{new Date(addon.release_date).toLocaleString()}</span>
                            </span>
                            <span className="bd-addon-detail" key="downloads">
                                <span>Downloads: </span>
                                <span>{addon.downloads.toLocaleString()}</span>
                            </span>
                        </div>
                        <div className="bd-addon-control bd-card-tags">
                            <h5>Tags</h5>
                            {addon.tags.map(tag => <span key={tag}>{tag}</span>)}
                        </div>
                    </div>
                    <div className="bd-addon-control-card">
                        <div className="bd-addon-control">
                            <h5>Author</h5>
                            <div className="bd-addon-author bd-card-wrap">
                                <span>{addon.author.display_name}</span>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>;
    }

    renderList() {
        if (this.props.query !== this.latestSearchQuery || this.props.state.selectedTag !== this.latestSelectedTag) this.setState({selectedPage: 0});
        this.latestSearchQuery = this.props.query;
        this.latestSelectedTag = this.props.state.selectedTag;
        const addons = this.addons;
        const canGoForward = addons && (addons.length > 1 && this.state.selectedPage < addons.length - 1);
        const canGoBackward = this.state.selectedPage > 0;
        
        const handleSelect = getState => () => {
            this.setState({selectedPage: getState(this.state.selectedPage)});

            const element = document.getElementsByClassName("bd-addon-list-title")[0]?.parentElement?.parentElement;
            if (element) {
                element.scrollTo(0, 0);
            }
        };
        
        return <div className="bd-addon-store">
            {!this.state.isLoaded && <Spinner className="bd-store-spinner" type={Spinner.Type.SPINNING_CIRCLE}/>}
            {(this.state.isLoaded && addons?.length && addons[this.state.selectedPage]) 
                ? <div className={Utilities.joinClassNames("bd-store-addons", this.props.view + "-view")}>
                    {addons[this.state.selectedPage].map(addon => {
                        return <StoreCard
                            {...addon}
                            isInstalled={this.isInstalled}
                            selectedTag={this.props.state.selectedTag}
                            folder={this.props.folder}
                            onDetailsView={() => {
                                this.setState({selectedAddon: addon});
                                this.props.setControlsVisible(false);
                            }}
                        />;
                    })}
                </div>
                : this.state.isLoaded && <NoResults/>
            }
            {this.state.isLoaded && addons.length > 1 && <nav className="bd-page-control">
                <Button look={Button.Looks.BLANK} className="bd-page-button" onClick={handleSelect(s => s - 1)} disabled={!canGoBackward}>
                    <Previous />
                    {Strings.Addons.back}
                </Button>
                {addons.length
                    ? addons.map((_, index) => <div className={Utilities.joinClassNames("bd-page-item bd-page-button", {selected: index === this.state.selectedPage})} onClick={handleSelect(() => index)}>
                        <span>{index + 1}</span>
                    </div>)
                    : null
                }
                <Button look={Button.Looks.BLANK} className="bd-page-button" onClick={handleSelect(s => s + 1)} disabled={!canGoForward}>
                    {Strings.Addons.next}
                    <Next />
                </Button>
            </nav>}
        </div>;
    }

    render() {
        if (this.state.selectedAddon) return this.renderDetailedView();

        return this.renderList();
    }
}

class Readme extends React.Component {
    state = {readme: null}

    async componentDidMount() {
        const readme = await fetchReadme(this.props.type, this.props.addon);

        this.setState({readme: readme});
    }

    render() {
        return <div className="bd-addon-readme">
            {this.state.readme
                ? <div dangerouslySetInnerHTML={{__html: this.state.readme}} style={{display: "contents"}} />
                : <Spinner className="bd-store-spinner" type={Spinner.Type.SPINNING_CIRCLE} />
            }
        </div>;
    }
}