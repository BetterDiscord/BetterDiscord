import {OptionTypes} from "@modules/commandmanager";
import Settings from "@stores/settings";


export default {
    id: "settings",
    name: "settings",
    description: `Enable or disable your settings`,
    options: [
        {
            type: OptionTypes.STRING,
            name: "action",
            description: "Action to take",
            required: true,
            choices: [
                {name: "Enable", value: "enable"},
                {name: "Disable", value: "disable"}
            ]
        },
        {
            type: OptionTypes.STRING,
            name: "setting",
            description: `Which setting to modify?`,
            required: true,
            get choices() {
                return Settings.collections[0].settings.map(c => {
                    const switches = c.settings.filter(s => s.type === "switch");
                    return switches.map(s => ({name: s.name, value: `${c.id}-${s.id}-${s.name}`}));
                }).flat();
            }
        }
    ],
    execute: async (data) => {
        const action = data.find(o => o.name === "action").value;
        const settingData = data.find(o => o.name === "setting").value.split("-");
        const catId = settingData[0];
        const id = settingData[1];
        const name = settingData[2];
        const isEnabled = Settings.get(catId, id);

        if (action === "enable") {
            if (isEnabled) return {content: `${name} is already enabled!`};

            Settings.set(catId, id, true);
            return {content: `${name} has been enabled!`};
        }

        if (action === "disable") {
            if (!isEnabled) return {content: `${name} is already disabled!`};

            Settings.set(catId, id, false);
            return {content: `${name} has been disabled!`};
        }
    }
};