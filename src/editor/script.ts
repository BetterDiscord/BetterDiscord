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

const {options, liveUpdate: defaultLiveUpdate, discordTheme} = window.Editor.settings.get();

const loader = document.getElementById("loader")!;

function setLoaderTheme(theme: string) {
    // --background-primary
    let background: string;
    // --background-seconday-alt
    let backgroundAlt: string;
    // --text-normal
    let color: string;

    switch (theme) {
        case "light":
            background = "oklab(0.988044 0.0000450313 0.0000197887)";
            backgroundAlt = "oklab(0.940553 0.00079456 -0.00254363)";
            color = "oklab(0.335195 0.00285903 -0.0100273)";
            break;
        case "darker":
            background = "oklab(0.245196 0.00206329 -0.00723176)";
            backgroundAlt = "oklab(0.351123 0.00328721 -0.0115818)";
            color = "oklab(0.952331 0.000418991 -0.00125992)";
            break;
        case "midnight":
            background = "oklab(0.155263 0.00116055 -0.00404651)";
            backgroundAlt = "oklab(0.303553 0.00292034 -0.0103036)";
            color = "oklab(0.894999 0.000801653 -0.00257665)";
            break;
        // case "dark":
        default:
            background = "oklab(0.323409 0.00288205 -0.0101295)";
            backgroundAlt = "oklab(0.262384 0.00252247 -0.00889932)";
            color = "oklab(0.883042 0.00118408 -0.00389016)";
            break;
    }

    document.body.style.setProperty("--discord-background", background);
    document.body.style.setProperty("--discord-background-alt", backgroundAlt);
    document.body.style.setProperty("--discord-color", color);
}

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
            window.Editor.settings.setLiveUpdate(liveUpdate = liveUpdateNode.checked);

            if (liveUpdate) {
                save();
            }
        });
    }

    tabSize.textContent = `${options.insertSpaces ? "Spaces" : "Tabs"}: ${options.tabSize}`;
    window.Editor.settings.subscribe(({options: newOptions, liveUpdate: newLiveUpdate}) => {
        editor.updateOptions(newOptions);
        tabSize.textContent = `${newOptions.insertSpaces ? "Spaces" : "Tabs"}: ${newOptions.tabSize}`;

        liveUpdateNode.checked = liveUpdate = newLiveUpdate;
        if (window.Editor.type === "custom-css" && liveUpdate) {
            save();
        }
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
});
