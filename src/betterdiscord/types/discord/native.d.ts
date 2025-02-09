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
    app: {
        getReleaseChannel(): string;
        getVersion(): void;
        getModuleVersions(): void;
        getBuildNumber(): void;
        getAppArch(): void;
        getPath(): void;
        setBadgeCount(): void;
        dock: {
            bounce(): void;
            cancelBounce(): void;
            setBadge(): void;
        };
        relaunch(): void;
        getDefaultDoubleClickAction(): void;
        pauseFrameEvictor(): void;
        unpauseFrameEvictor(): void;
        registerUserInteractionHandler(): void;
    };
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