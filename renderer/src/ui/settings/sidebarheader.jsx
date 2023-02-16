import {Changelog} from "data";
import {React, WebpackModules} from "modules";
import HistoryIcon from "../icons/history";
import Modals from "../modals";

const Tooltip = WebpackModules.getByPrototypes("renderTooltip");

const FallbackHeader = ({children}) => React.createElement("h2", {className: "bd-settings-fallback-header"}, children);
const Header = React.lazy(async () => {
    const SidebarComponents = await WebpackModules.getLazy(m => m.Header && m.Separator && m.Item);

    return {
        __esModule: true,
        default: SidebarComponents.Header ?? FallbackHeader
    };
});

export default class SettingsTitle extends React.Component {
    render() {
        return <div className="bd-sidebar-header">
                    <React.Suspense fallback={<FallbackHeader>BetterDiscord</FallbackHeader>}>
                        <Header>BetterDiscord</Header>
                    </React.Suspense>
                    <Tooltip color="primary" position="top" text="Changelog">
                        {props =>
                            <div {...props} className="bd-changelog-button" onClick={() => Modals.showChangelogModal(Changelog)}>
                                <HistoryIcon className="bd-icon" size="16px" />
                            </div>
                        }
                    </Tooltip>
                </div>;
    }
}
