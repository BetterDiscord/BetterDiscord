import {webFrame} from "electron/renderer";
import path from "path";
import fs from "fs";

export default class Client {
    public static load(): void {
        const clientPath = path.resolve(__dirname, "client.js");
        
        webFrame.top?.executeJavaScript(fs.readFileSync(clientPath, "utf8") + String.fromCharCode(10, 10) + "//# sourceURL=betterdiscord://client/dist/index.js");
    }
}
