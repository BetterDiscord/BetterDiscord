import DiscordModules from "./discordmodules";

const React = DiscordModules.React;
export default React;

const {Children, Component, Fragment, cloneElement, createContext, createElement, createRef, forwardRef, lazy, memo, startTransition, useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, useTransition} = React;
export {Children, Component, Fragment, cloneElement, createContext, createElement, createRef, forwardRef, lazy, memo, startTransition, useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, useTransition}; // Re-export these for lucide

export const useEffectEvent: typeof import("react").useEffectEvent = function useEffectEvent(callback) {
    const ref = useRef(callback);

    ref.current = callback;

    return useMemo(() => {
        const handler: ProxyHandler<typeof ref.current> = {
            get [Symbol.for("callback")]() {
                return ref.current;
            }
        };

        for (const key of Reflect.ownKeys(Reflect) as Array<keyof typeof Reflect>) {
            if (typeof Reflect[key] !== "function") continue;

            // @ts-expect-error TS Sucks
            handler[key] = (_, ...args) => Reflect[key](ref.current, ...args);
        }

        return new Proxy(ref.current, handler);
    }, []);
};
