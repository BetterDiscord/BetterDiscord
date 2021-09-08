import {Changelog} from "data";
import {React, WebpackModules} from "modules";
import {History} from "icons";
import Modals from "../modals";

const SidebarComponents = WebpackModules.getModule(m => m.Header && m.Separator && m.Item);
const Tooltip = WebpackModules.getByDisplayName("Tooltip");

export default class SettingsTitle extends React.Component {
    render() {
        return <div className="bd-sidebar-header">
                    <SidebarComponents.Header>BetterDiscord</SidebarComponents.Header>
                    <Tooltip color="primary" position="top" text="Changelog">
                        {props =>
                            <div {...props} className="bd-changelog-button" onClick={() => Modals.showChangelogModal(Changelog)}>
                                <History className="bd-icon" size="16px" />
                            </div>
                        }
                    </Tooltip>
                </div>;
    }
}