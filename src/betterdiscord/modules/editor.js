import Logger from "@common/logger";

import DOMManager from "./dommanager";

export default new class Editor {

    async initialize() {
        // const baseUrl = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min";

        // Object.defineProperty(window, "MonacoEnvironment", {
        //     value: {
        //         getWorkerUrl: function () {
        //             return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        //                 self.MonacoEnvironment = {
        //                     baseUrl: '${baseUrl}'
        //                 };
        //                 importScripts('${baseUrl}/vs/base/worker/workerMain.min.js');`
        //             )}`;
        //         },
        //         baseUrl: baseUrl
        //     }
        // });

        const MONACO_VERSION = "0.52.2";
        window.MonacoEnvironment = {
            getWorker(workerId, label) {
                return new Worker(`data:text/javascript;charset=utf-8,${encodeURIComponent(
                    `
            self.MonacoEnvironment = {
                baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${MONACO_VERSION}/min/"
            };
            importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${MONACO_VERSION}/min/vs/base/worker/${workerId}");`
                )}`, {type: "classic", name: label});
            }
        };

        // const commonjsLoader = window.require;
        // delete window.module; // Make monaco think this isn't a local node script or else it freaks out

        DOMManager.linkStyle("monaco-style", `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${MONACO_VERSION}/min//vs/editor/editor.main.min.css`, {documentHead: true});

        try {
            // await DOMManager.injectScript("monaco-script", `${baseUrl}/vs/loader.min.js`);

            // const amdLoader = window.require; // Grab Monaco's amd loader
            // window.require = commonjsLoader; // Revert to commonjs

            // // Configure Monaco's AMD loader
            // amdLoader.config({paths: {vs: `${baseUrl}/vs`}, baseUrl: baseUrl});
            // amdLoader(["vs/editor/editor.main"], () => {}); // exposes the monaco global
            // console.log(amdLoader);
        }
        catch (e) {
            Logger.error("Editor", "Failed to load monaco editor", e);
        }
        finally {
            // Revert the global require to CommonJS
            // window.require = commonjsLoader;
        }
    }
};