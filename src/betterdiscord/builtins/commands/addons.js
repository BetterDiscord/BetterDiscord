import {OptionTypes} from "@modules/commandmanager";
import DiscordModules from "@modules/discordmodules";
import Plugins from "@modules/pluginmanager";
import Themes from "@modules/thememanager";


export default (type) => {
    const manager = type === "plugin" ? Plugins : Themes;

    return {
        id: `${type}s`,
        name: `${type}s`,
        description: `Enable, disable, or view your ${type}s`,
        options: [
            {
                type: OptionTypes.STRING,
                name: "action",
                description: "Action to take",
                required: true,
                choices: [
                    {name: "Enable", value: "enable"},
                    {name: "Disable", value: "disable"},
                    {name: "Show Info", value: "info"},
                    {name: "Share In Chat", value: "share"}
                ]
            },
            {
                type: OptionTypes.STRING,
                name: "name",
                description: `Name of the ${type}`,
                required: true,
                get choices() {
                    return manager.addonList.map(p => ({
                        name: p.name,
                        value: p.id
                    }));
                }
            }
        ],
        execute: async (data, {channel}) => {
            const action = data.find(o => o.name === "action").value;
            const addonId = data.find(o => o.name === "name").value;
            const addon = manager.getAddon(addonId);
            const isEnabled = manager.isEnabled(addon.id);

            if (action === "enable") {
                if (isEnabled) return {content: `${addon.name} is already enabled!`};

                manager.enableAddon(addon.id);
                return {content: `${addon.name} has been enabled!`};
            }

            if (action === "disable") {
                if (!isEnabled) return {content: `${addon.name} is already disabled!`};

                manager.disableAddon(addon.id);
                return {content: `${addon.name} has been disabled!`};
            }

            if (action === "info") {
                const fields = [
                    {name: "Author", value: addon.authorLink ? `[${addon.author}](${addon.authorLink})` : addon.author, inline: true},
                    {name: "Version", value: `v${addon.version}`, inline: true},
                    {name: "Enabled", value: isEnabled ? "✅" : "❌", inline: true},
                ];

                if (addon.source) fields.push({name: "Source", value: `[GitHub](${addon.source})`, inline: true});
                if (addon.invite) fields.push({name: "Support", value: `[Discord](https://discord.gg/${addon.invite})`, inline: true});
                if (addon.donate) fields.push({name: "Donate", value: `[Link](${addon.donate})`, inline: true});

                return {embeds: [{
                    color: 4096741,
                    title: addon.name,
                    description: addon.description,
                    fields: fields,
                    footer: {
                        text: "Last updated"
                    },
                    timestamp: (new Date(addon.modified)).toISOString()
                }]};
            }

            if (action === "share") {
                DiscordModules.MessageUtils.sendMessage(channel.id, {content: `<betterdiscord://store/${addon.name}>`});
            }
        }
    };
};