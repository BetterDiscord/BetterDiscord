import proxyLocalStorage from "./localstorage";
import Core from "./modules/core";

// Perform some setup
proxyLocalStorage();
const loadingIcon = document.createElement("div");
loadingIcon.className = "bd-loaderv2";
loadingIcon.title = "BandagedBD is loading...";
document.body.appendChild(loadingIcon);

window.Core = Core;

export default Core;