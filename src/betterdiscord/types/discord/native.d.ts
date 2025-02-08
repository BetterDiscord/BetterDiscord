export interface DiscordNativeAPI {
    isRenderer: unknown;
    setUncaughtExceptionHandler: unknown;
    nativeModules: unknown;
    process: unknown;
    os: {
        appArch: string;
        arch: string;
        release: string;
    };
    app: unknown;
    clipboard: {
        copy(s: string): void;
        copyImage(b: Uint8Array): void;
        cut(): void;
        paste(): void;
        read(): void;
    };
    ipc: unknown;
    gpuSettings: unknown;
    window: unknown;
    powerMonitor: unknown;
    spellCheck: unknown;
    crashReporter: unknown;
    desktopCapture: unknown;
    fileManager: unknown;
    clips: unknown;
    processUtils: unknown;
    powerSaveBlocker: unknown;
    http: unknown;
    accessibility: unknown;
    features: unknown;
    settings: unknown;
    userDataCache: unknown;
    thumbar: unknown;
    safeStorage: unknown;
    globalOverlay: unknown;
    hardware: unknown;
    riotGames: unknown;
    remoteApp: unknown;
    remotePowerMonitor: unknown;
    webAuthn: unknown;
}