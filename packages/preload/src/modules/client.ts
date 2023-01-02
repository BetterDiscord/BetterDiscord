import {webFrame} from "electron/renderer";
import path from "path";
import fs from "fs";

export default class Client {
    public static load(): void {
        const clientPath = path.resolve(...<string[]>[
            __dirname, "..",
            process.env.DEVELOPMENT && "..",
            "client", "dist", "index.js"
        ].filter(Boolean));
        
        webFrame.top?.executeJavaScript(fs.readFileSync(clientPath, "utf8"));
    }
}
