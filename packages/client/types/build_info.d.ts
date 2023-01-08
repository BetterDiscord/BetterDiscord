type BuildInfo = {
    newUpdater: boolean,
    version: string,
    releaseChannel: "staging" | "development" | "canary" | "ptb" | "stable" 
}

export default BuildInfo;
