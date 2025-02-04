import DiscordModules from "./discordmodules";
/** @type {import("react")} */
const React = DiscordModules.React;
export default React;
export const ReactDOM = DiscordModules.ReactDOM;

const forwardRef = React.forwardRef;
const createElement = React.createElement;
export {forwardRef, createElement}; // Re-export these for lucide