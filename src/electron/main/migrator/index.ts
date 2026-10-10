import * as osx from "./osx";
import * as normal from "./normal";

switch (process.platform) {
    case "darwin":
        osx.init();
        break;
    case "win32":
    case "linux":
        normal.init();
        break;
}