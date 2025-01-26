import CustomCSS from "@builtins/customcss";
import {OptionTypes} from "@modules/commandmanager";
import Settings from "@modules/settingsmanager";
import WebpackModules from "@modules/webpackmodules";


const MessageUtils = WebpackModules.getByProps("sendMessage");

export default {
    id: "customcss",
    name: "customcss",
    description: `Toggle or view your CustomCSS`,
    options: [
        {
            type: OptionTypes.STRING,
            name: "action",
            description: "Action to take",
            required: true,
            choices: [
                {name: "Toggle", value: "toggle"},
                {name: "Enable", value: "enable"},
                {name: "Disable", value: "disable"},
                {name: "Open Editor", value: "open"},
                {name: "Share In Chat", value: "share"}
            ]
        }
    ],
    execute: async (data, {channel}) => {
        const action = data.find(o => o.name === "action").value;
        const isEnabled = Settings.get("settings", "customcss", "customcss");

        if (action === "toggle") {
            Settings.set("settings", "customcss", "customcss", !isEnabled);
            return {content: `CustomCSS has been toggled!`};
        }

        if (action === "enable") {
            if (isEnabled) return {content: `CustomCSS is already enabled!`};

            Settings.set("settings", "customcss", "customcss", true);
            return {content: `CustomCSS has been enabled!`};
        }

        if (action === "disable") {
            if (!isEnabled) return {content: `CustomCSS is already disabled!`};

            Settings.set("settings", "customcss", "customcss", false);
            return {content: `CustomCSS has been disabled!`};
        }

        if (action === "open") {
            if (!isEnabled) return {content: `You cannot open CustomCSS if it's disabled!`};
            CustomCSS.open();
        }

        if (action === "share") {
            const css = CustomCSS.savedCss;
            const codeblocked = `\`\`\`css\n${css}\n\`\`\``;
            if (codeblocked.length > 2000) {
                window?.DiscordNative?.clipboard?.copy(css);
                return {content: "Your CustomCSS was too big to send automatically! Instead, the css has been copied to your clipboard. Paste (ctrl+v) the css in the textbox below and Discord will automatically attach it as a text file."};
            }
            MessageUtils.sendMessage(channel.id, {content: `\`\`\`css\n${css}\n\`\`\``});
        }
    }
};