import {createContext, useContext} from "react";

export interface SettingsContextValue {
    value: any;
    disabled: boolean;
    fail?: boolean;
}

export interface TypedSettingsContextValue<T> {
    value: T;
    disabled: boolean;
    fail?: boolean;
}

export const none = Symbol("betterdiscord.none");
export const SettingsContext = createContext<SettingsContextValue>({value: none, disabled: false, fail: true});

export function useSettingsContext<T>(): TypedSettingsContextValue<T> {
    return useContext(SettingsContext);
}