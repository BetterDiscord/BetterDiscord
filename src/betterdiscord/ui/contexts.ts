import {createContext} from "@modules/react";


export const none = Symbol("betterdiscord.none");
export const SettingsContext = createContext<any>(none);