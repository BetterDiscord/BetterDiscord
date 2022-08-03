import {React, WebpackModules} from "modules";
import BdWebApi from "../../../modules/bdwebapi";

const Spinner = WebpackModules.getByDisplayName("Spinner");
const {ScrollerAuto: Scroller} = WebpackModules.getByProps("ScrollerAuto");
const {pushLayer} = WebpackModules.getByProps("pushLayer");

export default function openStoreDetail(addon) {
    pushLayer(() => <StoreDetail {...addon} />);
}

export class StoreDetail extends React.Component {
    constructor(props) {
        super(props);

        this.scrollerRef = React.createRef();
    }
    
    componentDidMount() {
        // dirty hack for customizing layers created by pushLayer
        this.scrollerRef.current.parentElement.classList.add("bd-store-details");
    }

    render() {
        return <>
            <header class="bd-store-details-title">
                
            </header>
            <Scroller ref={this.scrollerRef}>
                <header class="bd-store-details-title"></header>
                <div class="bd-store-details-content">
                    <Readme type={this.props.type} addonId={this.props.id} />
                    <aside class="bd-store-details-sidebar"></aside>
                </div>
            </Scroller>
        </>;
    }
}

class Readme extends React.Component {
    state = {readme: null};

    async componentDidMount() {
        const readme = await BdWebApi.getReadme(this.props.type, this.props.addonId);

        this.setState({readme});
    }

    render() {
        const {readme} = this.state;
        return readme ? <article class="bd-store-details-readme bd-markdown" dangerouslySetInnerHTML={{__html: readme}} /> : <Spinner type={Spinner.Type.SPINNING_CIRCLE} />;
    }
}