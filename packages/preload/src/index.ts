import Client from "./modules/client";
import DiscordPreload from "./modules/preload";

console.log("Hello from @betterdiscord/preload.");

Client.load();
DiscordPreload.load();

window.require = require;
