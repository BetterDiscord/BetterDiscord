/**
 * Checks if the current environment is an Electron desktop application.
 *
 * @returns {boolean} True if the environment is Electron desktop app, false otherwise
 **/
export function isDesktopApp(): boolean {
    return true;
    // TODO: check which the following check is good for future web extension
    // Solution by nicola02nb:
    //  return window?.process?.type === 'renderer' && !!process?.versions?.electron && navigator?.userAgent?.indexOf('Electron') >= 0;
    // Solution by doggybootsy:
    //  return typeof BetterDiscordPreload === "function"
    // Solution by xenoncolt:
    //  return typeof DiscordNative !== "undefined";
}