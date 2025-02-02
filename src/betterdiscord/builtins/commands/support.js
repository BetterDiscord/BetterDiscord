import Utilities from "@modules/utilities";


export default {
    id: "support",
    name: "support",
    description: "Get help and support for BetterDiscord",
    options: [],
    execute: async () => {
        Utilities.showGuildJoinModal("rC8b2H6SCt");
    }
};