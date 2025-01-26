import CustomCSS from "@builtins/customcss";
import {OptionTypes} from "@modules/commandmanager";
import Settings from "@modules/settingsmanager";
import WebpackModules from "@modules/webpackmodules";


const MessageUtils = WebpackModules.getByProps("sendMessage");

const enterEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true, // Make sure the event bubbles
    cancelable: false,
});

export default {
    id: "customcss",
    name: "customcss",
    description: `Toggle, open, or share your CustomCSS`,
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
        const isEnabled = Settings.get("customcss", "customcss");

        if (action === "toggle") {
            Settings.set("customcss", "customcss", !isEnabled);
            return {content: `CustomCSS has been toggled!`};
        }

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
            const codeblocked = `\`\`\`css\n${css}\n\`\`\``;
            if (codeblocked.length > 2000) {
                window?.DiscordNative?.clipboard?.copy?.(css);
                window?.DiscordNative?.clipboard?.paste?.();
                const textArea = document.querySelector(`[class*="slateTextArea_"]`);
                if (textArea) return setTimeout(() => textArea.dispatchEvent(enterEvent), 75);
                return {content: "The CustomCSS was too big to send automatically! It has been attached as a text file instead."};
            }
            MessageUtils.sendMessage(channel.id, {content: `\`\`\`css\n${css}\n\`\`\``});
        }
    }
};