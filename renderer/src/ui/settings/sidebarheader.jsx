import {Changelog} from "data";
import {React, WebpackModules} from "modules";
import HistoryIcon from "../icons/history";
import Modals from "../modals";

const Tooltip = WebpackModules.getByPrototypes("renderTooltip");

export default class SettingsTitle extends React.Component {
    renderHeader() {
        return <h2 className="bd-sidebar-header-label">BetterDiscord</h2>;
    }

    render() {
        return <div className="bd-sidebar-header">
                    {this.renderHeader()}
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
