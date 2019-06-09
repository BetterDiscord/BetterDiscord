import {Config} from "data";
import {React} from "modules";

import ContentList from "./contentlist";
import SettingsGroup from "../settings/group";
import SettingsTitle from "./title";

export default class V2_SettingsPanel {

    static buildSettingsPanel(title, config, state, onChange, button = null) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.getSettingsPanel(title, config, onChange, button);
    }

    static getSettingsPanel(title, groups, onChange, button = null) {
        return [React.createElement(SettingsTitle, {text: title, button: button}), groups.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {onChange}));
        })];
    }

    static getContentPanel(title, contentList, contentState, options = {}) {
        return React.createElement(ContentList, Object.assign({}, {
            title: title,
            contentList: contentList,
            contentState: contentState
        }, options));
    }

    static get attribution() {
        return React.createElement(
            "div",
            {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
            `BBD v${Config.bbdVersion} by `,
            React.createElement(
                "a",
                {href: "https://github.com/rauenzi/", target: "_blank"},
                "Zerebos"
            )
        );
    }
}