import Config from "@data/config";
import {OptionTypes} from "@modules/commandmanager";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import WebpackModules from "@modules/webpackmodules";


const MessageUtils = WebpackModules.getByProps("sendMessage");

let osModule;
let nativeModule;
function getDiscordInfo() {
    if (!osModule) osModule = WebpackModules.getByProps("os", "layout");
    if (!nativeModule) nativeModule = WebpackModules.getByProps("setBadge");

    const releaseChannel = nativeModule.releaseChannel;
    const hostVersion = nativeModule.version.join(".");
    const hostBuildNumber = nativeModule.buildNumber;
    const osArch = nativeModule.architecture;
    const osVersion = window?.DiscordNative?.os?.release;
    let osName = osModule.os.toString();

    // eslint-disable-next-line no-unused-vars
    const [macVer, _, winVer] = nativeModule.parsedOSRelease;

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
    const lines = ["```md", `## Discord Info\n${getDiscordInfo()}\n`];
    lines.push(`## BetterDiscord`);
    for (let l = 0; l < 500; l++) lines.push(`stable ${Config.version}\n`);
    lines.push(`### ${pluginCount.total} Plugins (${pluginCount.enabled} Enabled):\n${PluginManager.addonList.map(a => `- ${a.name}${PluginManager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n")}\n`);
    lines.push(`### ${themeCount.total} Themes (${themeCount.enabled} Enabled):\n${ThemeManager.addonList.map(a => `- ${a.name}${ThemeManager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n")}`);
    lines.push("```");
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
        if (!shouldSend) return {content: info};
        if (info.length > 2000) {
            nativeModule.copy(info);
            return {content: "The debug info was too long to send automatically! Instead, has been copied to your clipboard. Paste (ctrl+v) the info in the textbox below and Discord will automatically attach it as a text file."};
        }
        MessageUtils.sendMessage(channel.id, {content: info});
    }
};