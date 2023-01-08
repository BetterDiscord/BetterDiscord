import Core from "./modules/core";
import DOMManager from "./modules/dommanager";
import LoadingIcon from "./ui/loading";

if (process.env.DEVELOPMENT) {
    console.log("Hello from @betterdiscord/client");
}

DOMManager.initialize();

LoadingIcon.show();
Core.initialize().then(() => {
    setTimeout(() => {
        LoadingIcon.hide();
    }, 10000);
});
