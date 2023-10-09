import Builtin from "@structs/builtin";

import IPC from "@modules/ipc";
import DataStore from "@modules/datastore";

const DISCORD_MIN_HEIGHT = 500;
const DISCORD_MIN_WIDTH = 940;

export default new class RemoveMinimumSize extends Builtin {
    get name() {return "RemoveMinimumSize";}
    get category() {return "window";}
    get id() {return "removeMinimumSize";}

    enabled() {
        IPC.setMinimumSize(1, 1);
        window.addEventListener("resize", this.onResize);

        const winprefs = DataStore.getData("windowprefs");
        if (!winprefs.height || !winprefs.width) return DataStore.setData("windowprefs", {}); // If the values don't exist exit and initialize
        if ((winprefs.height >= DISCORD_MIN_HEIGHT) && (winprefs.width >= DISCORD_MIN_WIDTH)) return; // If both values are normally valid don't touch
        IPC.setWindowSize(winprefs.width, winprefs.height);
    }

    disabled() {
        IPC.setMinimumSize(DISCORD_MIN_WIDTH, DISCORD_MIN_HEIGHT);
        window.removeEventListener("resize", this.onResize);
    }

    onResize() {
        const winprefs = DataStore.getData("windowprefs");
        winprefs.width = window.outerWidth;
        winprefs.height = window.outerHeight;
        DataStore.setData("windowprefs", winprefs);
    }
};