export interface RemoteModule {
    releaseChannel: string;
    version: string[];
    buildNumber: number;
    architecture: string;
    parsedOSRelease: number[];
}

export type GetClientInfo = () => {
    buildNumber: string;
    logsUploaded: string;
    releaseChannel: string;
    versionHash: string;
};

export interface UserAgentInfo {
    description: string;
    layout: string;
    manufacturer: string | null;
    name: "Electron";
    os: {
        architecture: number;
        family: string;
        version: string;
        toString: () => string;
    };
    parse: () => void;
    prerelease: null;
    product: null;
    toString: () => string;
    ua: string;
    version: string;
}