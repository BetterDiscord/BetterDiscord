import DiscordModules from "./discordmodules";
import DOM from "./reactdom";

/** @type {import("react")} */
const React = DiscordModules.React;
export default React;
export const ReactDOM = DOM;

const {Children, Component, Fragment, cloneElement, createContext, createElement, createRef, forwardRef, lazy, memo, startTransition, useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, useTransition} = React;
export {Children, Component, Fragment, cloneElement, createContext, createElement, createRef, forwardRef, lazy, memo, startTransition, useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, useTransition}; // Re-export these for lucide