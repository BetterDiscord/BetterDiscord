import {Changelog} from "data";
import {DiscordModules, React} from "modules";
import HistoryIcon from "../icons/history";
import Modals from "../modals";


export default class SettingsTitle extends React.Component {
    renderHeader() {
        return <h2 className="bd-sidebar-header-label">BetterDiscord</h2>;
    }

    render() {
        return <div className="bd-sidebar-header">
                    {this.renderHeader()}
                    <DiscordModules.Tooltip color="primary" position="top" text="Changelog">
                        {props =>
                            <div {...props} className="bd-changelog-button" onClick={() => Modals.showChangelogModal(Changelog)}>
                                <HistoryIcon className="bd-icon" size="16px" />
                            </div>
                        }
                    </DiscordModules.Tooltip>
                </div>;
    }
}
