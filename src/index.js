import proxyLocalStorage from "./localstorage";

// Perform some setup
proxyLocalStorage();
const loadingIcon = document.createElement("div");
loadingIcon.className = "bd-loaderv2";
loadingIcon.title = "BandagedBD is loading...";
document.body.appendChild(loadingIcon);