import {React, Strings, Utilities, WebpackModules, DiscordClasses} from "modules";
import {API_CACHE, fetchData, splitArray} from "./api";
import {Next, Previous} from "icons";
import NoResults from "../../blankslates/noresults";
import StoreCard from "./storecard";
import openStoreDetail from "./storedetail";

const Button = WebpackModules.getByProps("DropdownSizes");
const Spinner = WebpackModules.getByDisplayName("Spinner");

export default class StorePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: !!API_CACHE[props.type]?.length,
            selectedPage: 0,
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

    render() {
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
                        {this.isInstalled(addon.name)}
                        return <StoreCard
                            {...addon}
                            confirmAddonDelete={this.props.confirmAddonDelete}
                            isInstalled={this.isInstalled(addon.name)}
                            selectedTag={this.props.state.selectedTag}
                            folder={this.props.folder}
                            // onDetailsView={() => {
                            //     openStoreDetail(addon);
                            // }}
                        />;
                    })}
                </div>
                : this.state.isLoaded && <NoResults />
            }
            {this.state.isLoaded && addons.length > 1 && <nav className="bd-page-control">
                <Button look={Button.Looks.BLANK} className="bd-page-button" onClick={handleSelect(s => s - 1)} disabled={!canGoBackward}>
                    <Previous />
                    {Strings.Addons.back}
                </Button>
                <div class={`bd-page-buttons ${DiscordClasses.Scrollers.thin}`}>
                    {addons.length
                        ? addons.map((_, index) => <div role="button" aria-current="page" tabindex="0" className={Utilities.joinClassNames("bd-page-item bd-page-button", {selected: index === this.state.selectedPage})} onClick={handleSelect(() => index)}>
                            <span>{index + 1}</span>
                        </div>)
                        : null
                    }
                </div>
                <Button look={Button.Looks.BLANK} className="bd-page-button" onClick={handleSelect(s => s + 1)} disabled={!canGoForward}>
                    {Strings.Addons.next}
                    <Next />
                </Button>
            </nav>}
        </div>;
    }
}