import Builtin from "@structs/builtin";

import RemoteAPI from "@polyfill/remote";
import ipc from "@modules/ipc";

export default new class WebpackSourceViewer extends Builtin {
    get name() {return "WebpackSourceViewer";}
    get category() {return "developer";}
    get id() {return "webpackSourceViewer";}

    async initialize() {
        RemoteAPI.addProtocolListener((uri) => {
            if (!this.get("devTools") || !this.get(this.id)) return;

            if (!uri.startsWith("betterdiscord://betterdiscord/webpack-modules/patched/")) return;

            const url = new URL(uri);

            const hash = url.hash.slice(1).split(":", 2);

            let lineRaw = "";
            let columnRaw = "";

            if (hash.length === 2) {
                [lineRaw, columnRaw] = hash;
            }
            else {
                lineRaw = url.searchParams.get("line") || "";
                columnRaw = url.searchParams.get("column") || "";
            }

            let line = parseInt(lineRaw, 10);
            if (isNaN(line) || line < 0) line = 0;

            let column = parseInt(columnRaw, 10);
            if (isNaN(column) || column < 0) column = 0;

            url.search = "";
            url.hash = "";

            ipc.openDevtoolsSource(url.href, line, column);
        });
    }
};