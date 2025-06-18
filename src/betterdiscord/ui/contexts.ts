import {createContext} from "@modules/react";


export interface SettingsContextValue {
    value: any;
    disabled: boolean;
}

export const none = Symbol("betterdiscord.none");
export const SettingsContext = createContext<SettingsContextValue>({value: none, disabled: false});