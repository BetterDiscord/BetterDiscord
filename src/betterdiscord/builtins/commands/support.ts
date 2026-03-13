import Modals from "@ui/modals";
import type {Command} from "@modules/commandmanager";


export default {
    id: "support",
    name: "support",
    description: "Get help and support for BetterDiscord",
    options: [],
    execute: async () => {
        Modals.showGuildJoinModal("rC8b2H6SCt");
    }
} satisfies Command;