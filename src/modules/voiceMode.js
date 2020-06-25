import DOM from "./domtools";

const style = `
    .container-2Rl01u {
        display: none!important;
    }

    .chat-3bRxxu {
        display: none!important;
    }

    .sidebar-2K8pFh {
        flex-grow: 1!important;
    }
`;

export default new class VoiceMode {
    start() {
        DOM.addStyle("VoiceMode", style);
    }

    stop() {
        DOM.removeStyle("VoiceMode");
    }
};