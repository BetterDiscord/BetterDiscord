import {React, Strings, Utilities, DiscordClasses, WebAPI} from "modules";
import {Web} from "data";

import Spinner from "../../spinner";
import Next from "../../icons/next";
import Previous from "../../icons/previous";
import NoResults from "../../blankslates/noresults";
import StoreCard from "./storecard";
import Modals from "../../modals";
import Toasts from "../../toasts";

export default class StorePage extends React.Component {
    constructor(props) {
        super(props);

        this.matchAddon = this.matchAddon.bind(this);
        this.filterTags = this.filterTags.bind(this);
        this.state = {
            isLoaded: false,
            addons: null,
            selectedPage: 0
        };
    }

    componentDidMount() {
        this.connect();
    }

    async connect() {
        try {
            const data = await WebAPI.getAddons(`${this.props.type}s`);
            this.setState({
                isLoaded: true,
                addons: data
            });
        }
        catch (error) {
            Modals.showConfirmationModal(Strings.Store.connectionError, Strings.Store.connectionErrorMessage, {
                cancelText: Strings.Modals.close,
                confirmText: Strings.Modals.retry,
                onConfirm: () => this.connect()
            });
        }
    }

    async install(id, filename) {
        try {
            const contents = await WebAPI.getAddonContents(id);
            this.props.installAddon(contents, filename);
        }
        catch (error) {
            Toasts.error(Strings.Store.downloadError.format({type: this.props.type}));
        }
    }

    matchAddon(addon, query) {
        let matches = ~addon.name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        matches = matches || ~addon.author.display_name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        matches = matches || ~addon.description.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        return matches;
    }

    filterTags(addon) {
        const matches = this.matchAddon(addon, this.props.query);
        const tagMatches = this.props.state.selectedTag === "all" || addon.tags.some(tag => tag === this.props.state.selectedTag);
        return tagMatches && matches;
    }

    get addons() {
        if (!this.state.isLoaded) return null;
        const {sort} = this.props;

        const final = this.state.addons
            .flat(10)
            .filter(this.filterTags)
            .sort((a, b) => {
                const first = a[sort];
                const second = b[sort];
                if (typeof(first) == "string") return first.toLocaleLowerCase().localeCompare(second.toLocaleLowerCase());
                if (first > second) return 1;
                if (second > first) return -1;
                return 0;
            });
        if (!this.props.ascending) final.reverse();
        
        return Utilities.splitArray(final, 16);
    }

    render() {
        const containerState = this.props.state;
        if (this.props.query !== this.latestSearchQuery || containerState.selectedTag !== this.latestSelectedTag) this.setState({selectedPage: 0});
        this.latestSearchQuery = this.props.query;
        this.latestSelectedTag = containerState.selectedTag;
        const addons = this.addons;
        const canGoForward = addons && (addons.length > 1 && this.state.selectedPage < addons.length - 1);
        const canGoBackward = this.state.selectedPage > 0;
        
        const handleSelect = getState => () => {
            this.setState({selectedPage: getState(this.state.selectedPage)});

            const element = document.getElementsByClassName("bd-addon-list-title")[0]?.parentElement?.parentElement;
            element?.scrollTo(0, 0);
        };
        
        return <div className="bd-addon-store">
            {!this.state.isLoaded && <Spinner className="bd-store-spinner" type={Spinner.Type.SPINNING_CIRCLE}/>}
            {(this.state.isLoaded && addons?.length && addons[this.state.selectedPage]) 
                ? <div className={Utilities.className("bd-store-addons", this.props.view + "-view")}>
                    {addons[this.state.selectedPage].map(addon => {
                        const thumbnail = Web.ENDPOINTS.thumbnail(addon.thumbnail_url);

                        return <StoreCard
                            {...addon}
                            key={addon.id}
                            filename={addon.file_name}
                            releaseDate={new Date(addon.release_date)}
                            thumbnail={thumbnail}
                            selectedTag={containerState.selectedTag}
                            isInstalled={this.props.isLoaded(addon.file_name)}
                            onInstall={() => Modals.showInstallationModal({
                                ...addon,
                                thumbnail,
                                filename: addon.file_name,
                                releaseDate: new Date(addon.release_date),
                                onInstall: () => this.install(addon.id, addon.file_name)
                            })}
                            onForceInstall={() => this.install(addon.id, addon.file_name)}
                            onDelete={() => this.props.confirmAddonDelete(addon.file_name)}
                            onForceDelete={() => this.props.deleteAddon(addon.file_name)}
                        />;
                    })}
                </div>
                : this.state.isLoaded && <NoResults />
            }
            {this.state.isLoaded && addons.length > 1 && <nav className="bd-page-control">
                <button className="bd-page-button" onClick={handleSelect(s => s - 1)} disabled={!canGoBackward}>
                    <Previous />
                    {Strings.Store.back}
                </button>
                <div className={`bd-page-buttons ${DiscordClasses.Scrollers.thin}`}>
                    {addons.length
                        ? addons.map((_, index) => <div
                            role="button"
                            aria-label={`Page ${index + 1}`}
                            aria-current={index === this.state.selectedPage ? "page" : undefined}
                            tabIndex="0"
                            className={Utilities.className("bd-page-item bd-page-button", {selected: index === this.state.selectedPage})}
                            onClick={handleSelect(() => index)}
                        >
                            <span>{index + 1}</span>
                        </div>)
                        : null
                    }
                </div>
                <button className="bd-page-button" onClick={handleSelect(s => s + 1)} disabled={!canGoForward}>
                    {Strings.Store.next}
                    <Next />
                </button>
            </nav>}
        </div>;
    }
}