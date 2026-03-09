import type {Plugin} from "./plugin";
import type {Theme} from "./theme";

export type AddonType = "plugin" | "theme";

export type AddonAny = Plugin | Theme;
export type AddonSome = Plugin & Theme;
