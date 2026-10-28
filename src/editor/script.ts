const amdLoader = window.require as unknown as ((files: ["vs/editor/editor.main"], cb: (monaco: typeof import("monaco-editor")) => void) => void) & {
    config: any;
};

let title = window.Editor.filename;
if (window.Editor.type === "custom-css") {
    title = "Custom CSS";
}
document.title = `${title} - BetterDiscord Editor`;

document.getElementById("language")!.textContent = window.Editor.type === "plugin" ? " JavaScript" : " CSS";

document.getElementById("open-editor")!.addEventListener("click", () => window.Editor.open());

const baseUrl = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${process.env.__MONACO_VERSION__}/min`;

Object.defineProperty(window, "MonacoEnvironment", {
    value: {
        getWorker: (workerId, label) => new Worker(`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
                baseUrl: '${baseUrl}'
            };
            importScripts('${baseUrl}/vs/base/worker/${workerId}');`
        )}`, {type: "classic", name: label})
    } as typeof window.MonacoEnvironment
});

amdLoader.config({paths: {vs: `${baseUrl}/vs`}});

const {options, liveUpdate: defaultLiveUpdate, discordTheme, alwaysOnTop} = window.Editor.settings.get();

const loader = document.getElementById("loader")!;

function setLoaderTheme(theme: string) {
    // var(--background-base-low)
    let background: string;
    // var(--background-base-lower)
    let backgroundAlt: string;
    // var(--text-default)
    let color: string;

    switch (theme) {
        case "light":
            background = "color-mix(in oklab,hsl(0 calc(1*0%) 98.431%/1) 100%,#000 0%)";
            backgroundAlt = "color-mix(in oklab,hsl(0 calc(1*0%) 98.431%/1) 100%,#000 0%)";
            color = "color-mix(in oklab,hsl(240 calc(1*6.122%) 19.216%/1) 100%,#000 0%)";
            break;
        case "darker":
            background = "color-mix(in oklab,hsl(240 calc(1*5.882%) 13.333%/1) 100%,#000 0%)";
            backgroundAlt = "color-mix(in oklab,hsl(240 calc(1*7.143%) 10.98%/1) 100%,#000 0%)";
            color = "color-mix(in oklab,hsl(240 calc(1*6.667%) 94.118%/1) 100%,#000 0%)";
            break;
        case "midnight":
            background = "color-mix(in oklab,hsl(240 calc(1*7.692%) 5.098%/1) 100%,#000 0%)";
            backgroundAlt = "color-mix(in oklab,hsl(240 calc(1*12.5%) 3.137%/1) 100%,#000 0%)";
            color = "color-mix(in oklab,hsl(240 calc(1*4.478%) 86.863%/1) 100%,#000 0%)";
            break;
        case "dark":
        default:
            background = "color-mix(in oklab,hsl(232.5 calc(1*6.897%) 22.745%/1) 100%,#000 0%)";
            backgroundAlt = "color-mix(in oklab,hsl(231.429 calc(1*6.542%) 20.98%/1) 100%,#000 0%)";
            color = "color-mix(in oklab,hsl(240 calc(1*4.348%) 95.49%/1) 100%,#000 0%)";
            break;
    }

    document.body.style.setProperty("--discord-background", background);
    document.body.style.setProperty("--discord-background-alt", backgroundAlt);
    document.body.style.setProperty("--discord-color", color);
}

if (alwaysOnTop) document.body.classList.add("pinned");

setLoaderTheme(discordTheme);
window.Editor.settings.subscribe(({discordTheme: theme}) => setLoaderTheme(theme));

amdLoader(["vs/editor/editor.main"], (monaco) => {
    loader.remove();

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true
    });

    const tabbar = document.getElementById("tabbar")!;
    const actionBar = document.getElementById("action-bar")!;
    const tabSize = document.getElementById("tab-size")!;

    const errorsSpan = document.getElementById("errors")!;
    const warningsSpan = document.getElementById("warnings")!;

    monaco.editor.onDidChangeMarkers(([uri]) => {
        const markers = monaco.editor.getModelMarkers({resource: uri});

        let errors = 0;
        let warnings = 0;

        for (const element of markers) {
            if (element.severity === 4) warnings++;
            else if (element.severity === 8) errors++;
        }

        errorsSpan.textContent = ` ${errors} `;
        warningsSpan.textContent = ` ${warnings}`;
    });

    let lastSavedValue = window.Editor.read();
    const editor = monaco.editor.create(document.getElementById("editor")!, {
        ...options,
        value: lastSavedValue,
        language: window.Editor.type === "plugin" ? "javascript" : "css"
    });

    const liveUpdateNode = document.getElementById("live-update")! as HTMLInputElement;
    let liveUpdate = false;
    if (window.Editor.type !== "custom-css") {liveUpdateNode.parentElement!.remove();}
    else {
        liveUpdateNode.checked = liveUpdate = defaultLiveUpdate;
        liveUpdateNode.addEventListener("change", () => {
            window.Editor.settings.set({liveUpdate: liveUpdate = liveUpdateNode.checked});

            if (liveUpdate) {
                save();
            }
        });
    }

    tabSize.textContent = `${options.insertSpaces ? "Spaces" : "Tabs"}: ${options.tabSize}`;
    window.Editor.settings.subscribe(({options: newOptions, liveUpdate: newLiveUpdate, alwaysOnTop: newAlwaysOnTop}) => {
        editor.updateOptions(newOptions);
        tabSize.textContent = `${newOptions.insertSpaces ? "Spaces" : "Tabs"}: ${newOptions.tabSize}`;

        liveUpdateNode.checked = liveUpdate = newLiveUpdate;
        if (window.Editor.type === "custom-css" && liveUpdate) {
            save();
        }

        if (newAlwaysOnTop) document.body.classList.add("pinned");
        else document.body.classList.remove("pinned");
    });

    const height = (node: HTMLElement) => Math.max(node.clientHeight, node.offsetHeight);
    function layout() {
        editor.getDomNode()!.style.height = `${height(document.body) - height(tabbar) - height(actionBar)}px`;
        editor.layout();
    }

    function save() {
        window.Editor.write(lastSavedValue = editor.getValue());
        window.Editor.shouldShowWarning(false);
    }

    editor.onDidChangeModelContent(() => {
        if (liveUpdate) {
            save();
            return;
        }

        window.Editor.shouldShowWarning(editor.getValue() !== lastSavedValue);
    });

    document.getElementById("refresh")!.addEventListener("click", () => {
        editor.executeEdits(null, [
            {
                range: editor.getModel()!.getFullModelRange(),
                text: window.Editor.read(),
                forceMoveMarkers: true
            }
        ]);
    });

    const currentPosition = document.getElementById("current-position")!;
    editor.onDidChangeCursorSelection(() => {
        const position = editor.getPosition()!;
        const selection = editor.getSelection()!;
        const selectedText = editor.getModel()!.getValueInRange(selection);

        let content = `Ln ${position.lineNumber}, Col ${position.column}`;
        if (selectedText.length) content += ` (${selectedText.length} selected)`;

        currentPosition.textContent = content;
    });
    document.getElementById("action-current-position")!.addEventListener("click", () => {
        editor.focus();
        editor.trigger("keyboard", "editor.action.gotoLine", "");
    });

    window.addEventListener("resize", layout);
    layout();

    document.getElementById("save")!.addEventListener("click", save);

    window.navigator.clipboard.readText = () => Promise.resolve(window.Editor.readText());

    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "s") {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            save();
        }
    });

    document.getElementById("wndow-unpinned")!.addEventListener("click", () => {
        document.body.classList.add("pinned");
        window.Editor.settings.set({alwaysOnTop: true});
    });
    document.getElementById("wndow-pinned")!.addEventListener("click", () => {
        document.body.classList.remove("pinned");
        window.Editor.settings.set({alwaysOnTop: false});
    });
});
