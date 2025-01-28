import Config from "@data/config";
import {OptionTypes} from "@modules/commandmanager";
import DiscordModules from "@modules/discordmodules";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";


function getDiscordInfo() {
    const releaseChannel = DiscordModules.RemoteModule.releaseChannel;
    const hostVersion = DiscordModules.RemoteModule.version.join(".");
    const hostBuildNumber = DiscordModules.RemoteModule.buildNumber;
    const osArch = DiscordModules.RemoteModule.architecture;
    const osVersion = window?.DiscordNative?.os?.release;
    let osName = DiscordModules.UserAgent.os.toString();

    // eslint-disable-next-line no-unused-vars
    const [macVer, _, winVer] = DiscordModules.RemoteModule.parsedOSRelease;

    if (osName.includes("Windows 10") && winVer >= 22e3) osName = osName.replace("Windows 10", "Windows 11");
    if (osName.includes("OS X 10.15.7") && macVer >= 20) osName = "macOS ".concat(macVer - 9);

    const lines = [
        releaseChannel,
        `Host ${hostVersion} ${osArch} (${hostBuildNumber})`,
        `${osName} (${osVersion})`
    ];

    return lines.join("\n");
}

/**
 * 
 * @param {string} type plugin or theme
 * @returns {{total: number, enabled: number}}
 */
function getAddonCount(type) {
    if (type === "theme") return {total: ThemeManager.addonList.length, enabled: ThemeManager.addonList.filter(p => ThemeManager.isEnabled(p.id)).length};
    if (type === "plugin") return {total: PluginManager.addonList.length, enabled: PluginManager.addonList.filter(p => PluginManager.isEnabled(p.id)).length};
    return {total: 0, enabled: 0};
}

function getDebugInfo() {
    const pluginCount = getAddonCount("plugin");
    const themeCount = getAddonCount("theme");
    const lines = [`## Discord Info\n${getDiscordInfo()}\n`];
    lines.push(`## BetterDiscord`);
    lines.push(`stable ${Config.version}\n`);
    lines.push(`### ${pluginCount.total} Plugins (${pluginCount.enabled} Enabled):\n${PluginManager.addonList.map(a => `- ${a.name}${PluginManager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n")}\n`);
    lines.push(`### ${themeCount.total} Themes (${themeCount.enabled} Enabled):\n${ThemeManager.addonList.map(a => `- ${a.name}${ThemeManager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n")}`);
    return lines.join("\n");
}

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