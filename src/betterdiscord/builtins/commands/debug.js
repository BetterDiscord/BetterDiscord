import {OptionTypes} from "@modules/commandmanager";
import DiscordModules from "@modules/discordmodules";
import getDebugInfo from "@utils/debug";


export default {
    id: "debug",
    name: "debug",
    description: "Gets debug information useful for support",
    options: [
        {
            type: OptionTypes.BOOLEAN,
            name: "send",
            description: "Should the info be sent in public chat?",
            required: true
        },
    ],
    execute: async (data, {channel}) => {
        const shouldSend = data.find(o => o.name === "send").value;
        const info = getDebugInfo();
        const codeblocked = `\`\`\`md\n${info}\n\`\`\``;
        if (!shouldSend) return {content: codeblocked};

        const file = new File([info], "debug.md", {type: "text/markdown"});

        // Use a timeout because this doesn't work if you do it within the context of a slash command
        if (DiscordModules.promptToUpload) return setTimeout(() => DiscordModules.promptToUpload?.([file], channel, 0), 1);

        return {content: "Unable to attach your debug info as a file. Please report this issue to BetterDiscord's [GitHub](https://github.com/BetterDiscord/BetterDiscord) if no one else has already done so!"};
    }
};