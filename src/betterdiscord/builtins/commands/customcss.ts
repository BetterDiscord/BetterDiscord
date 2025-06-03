import CustomCSS from "@builtins/customcss";
import {OptionTypes} from "@modules/commandmanager";
import DiscordModules from "@modules/discordmodules";
import Settings from "@stores/settings";


// TODO: consider moving this into the CustomCSS builtin rather than importing it
export default {
    id: "customcss",
    name: "customcss",
    description: `Enable, disable, open, or share your CustomCSS`,
    options: [
        {
            type: OptionTypes.STRING,
            name: "action",
            description: "Action to take",
            required: true,
            choices: [
                {name: "Enable", value: "enable"},
                {name: "Disable", value: "disable"},
                {name: "Open Editor", value: "open"},
                {name: "Share In Chat", value: "share"}
            ]
        }
    ],
    execute: async (data, {channel}) => {
        const action = data.find(o => o.name === "action").value;
        const isEnabled = Settings.get("customcss", "customcss");

        if (action === "enable") {
            if (isEnabled) return {content: `CustomCSS is already enabled!`};

            Settings.set("customcss", "customcss", true);
            return {content: `CustomCSS has been enabled!`};
        }

        if (action === "disable") {
            if (!isEnabled) return {content: `CustomCSS is already disabled!`};

            Settings.set("customcss", "customcss", false);
            return {content: `CustomCSS has been disabled!`};
        }

        if (action === "open") {
            if (!isEnabled) return {content: `You cannot open CustomCSS if it's disabled!`};
            CustomCSS.open();
        }

        if (action === "share") {
            const css = CustomCSS.savedCss;
            const file = new File([css], "custom.css", {type: "text/css"});

            // Use a timeout because this doesn't work if you do it within the context of a slash command
            if (DiscordModules.promptToUpload) return setTimeout(() => DiscordModules.promptToUpload?.([file], channel, 0), 1);

           return {content: "Unable to attach your Custom CSS as a file. Please report this issue to BetterDiscord's [GitHub](https://github.com/BetterDiscord/BetterDiscord) if no one else has already done so!"};
        }
    }
};