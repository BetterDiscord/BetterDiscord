interface EditorWindow {
    Editor: import("../preload").EditorNative;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Window extends EditorWindow {};
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Window extends EditorWindow {};