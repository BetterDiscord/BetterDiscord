import config from "@stores/config";
import type AddonManager from "@modules/addonmanager";
import DiscordModules from "@modules/discordmodules";
import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";


export function getDiscordClientInfo() {
    const clientInfo = DiscordModules.GetClientInfo?.();
    if (clientInfo) {
        return `${clientInfo.releaseChannel[0].toUpperCase()}${clientInfo.releaseChannel.substring(1)} ${clientInfo.buildNumber} (${clientInfo.versionHash.substring(0, 7)})`;
    }

    return DiscordModules.RemoteModule?.releaseChannel ?? "Unknown";
}

export function getDiscordHostInfo() {
    const remote = DiscordModules.RemoteModule;
    if (!remote) return "Host Unknown";

    return `Host ${remote.version.join(".")} ${remote.architecture} (${remote.buildNumber})`;
}

export function getOSInfo() {
    const remote = DiscordModules.RemoteModule;
    if (!remote) return "OS Unknown";

    const osVersion = window.DiscordNative?.os?.release;
    let osName = DiscordModules.UserAgentInfo?.os.toString();
    if (!osVersion || !osName) return "OS Unknown";


    const [macVer, _, winVer] = remote.parsedOSRelease;

    if (osName.includes("Windows 10") && winVer >= 22e3) osName = osName.replace("Windows 10", "Windows 11");
    if (osName.includes("OS X 10.15.7") && macVer >= 20) osName = "macOS ".concat((macVer - 9).toString());
    return `${osName} (${osVersion})`;
}

export function getDiscordInfo(string = true) {
    const info = [
        getDiscordClientInfo(),
        getDiscordHostInfo(),
        getOSInfo()
    ];

    if (string) return info.join("\n");
    return info;
}

export function getAddonCounts(manager: AddonManager) {
    return {
        total: manager.addonList.length,
        enabled: manager.addonList.filter(a => manager.isEnabled(a.id)).length
    };
}

export function getAddonList(manager: AddonManager) {
    return manager.addonList.map(a => `- ${a.name}${manager.isEnabled(a.id) ? " (Enabled)" : ""}`).join("\n");
}

export function getCoreInfo() {
    const channel = config.isCanary ? "Canary" : "Stable";
    return `${channel} ${config.get("version")} (${config.get("commit")?.substring(0, 7)})\n`;
}

export function getAddonInfo() {
    const pluginCount = getAddonCounts(PluginManager);
    const themeCount = getAddonCounts(ThemeManager);
    return [
        `### ${pluginCount.total} Plugins (${pluginCount.enabled} Enabled):\n${getAddonList(PluginManager)}\n`,
        `### ${themeCount.total} Themes (${themeCount.enabled} Enabled):\n${getAddonList(ThemeManager)}\n`
    ].join("\n");
}

export default function getDebugInfo() {
    return [
        `## Discord Info\n${getDiscordInfo()}\n`,
        `## BetterDiscord`,
        getCoreInfo(),
        getAddonInfo(),
    ].join("\n");
}