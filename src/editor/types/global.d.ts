interface Settings {
    liveUpdate: boolean;
    options: import("monaco-editor").editor.IStandaloneEditorConstructionOptions;
    discordTheme: "light" | "dark" | "darker" | "midnight";
}

interface EditorNative {
    filepath: string;
    type: string;
    filename: string;
    read(): string;
    open(): void;
    write(contents: string): void;
    shouldShowWarning(shouldShowWarning: boolean): void;
    readText(): string;
    settings: {
        get: () => Settings;
        subscribe: (cb: (settings: Settings) => void) => void;
        setLiveUpdate: (liveUpdate: boolean) => void;
    };
}

interface EditorWindow {
    Editor: EditorNative;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Window extends EditorWindow {};
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Window extends EditorWindow {};