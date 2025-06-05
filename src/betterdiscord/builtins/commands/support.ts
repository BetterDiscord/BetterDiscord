import Modals from "@ui/modals";


export default {
    id: "support",
    name: "support",
    description: "Get help and support for BetterDiscord",
    options: [],
    execute: async () => {
        Modals.showGuildJoinModal("rC8b2H6SCt");
    }
};