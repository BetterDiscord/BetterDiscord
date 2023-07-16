import {DiscordModules} from "modules";

const React = DiscordModules.React;

export default ({className}) => <div className={`bd-divider ${className || ""}`}></div>;
