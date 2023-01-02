/// <reference types="standalone-electron-types" />

import BrowserWindowPatcher from "./patchers/browserwindow";
import "./ipc";

if (!process.argv.includes("--vanilla")) {
    BrowserWindowPatcher.apply();
}
