import type AddonError from "@structs/addonerror";
import type {AddonMeta} from "./addonmeta";
import type {AddonAny} from "./addon";

export type AddonMetaLoaded = {
    kind: "loaded";
    meta: AddonMeta;
};
export type AddonMetaNotLoaded = {
    kind: "not-loaded";
    error: AddonError;
};
export type AddonMetaLoad = AddonMetaLoaded | AddonMetaNotLoaded;

export type AddonStateLoaded = {
    kind: "loaded";
    addon: AddonAny;
};

export type AddonStateNotLoaded = {
    kind: "not-loaded";
    error: AddonError;
};

export type AddonStateStarted<A extends AddonAny> = {
    kind: "started";
    addon: A;
};

export type AddonStateNotStarted = {
    kind: "not-started";
    error: AddonError;
};

export type AddonStateStopped = {
    kind: "stopped";
};

export type AddonStateNotStopped = {
    kind: "not-stopped";
    error: AddonError;
};

export type AddonStateError = AddonStateNotLoaded | AddonStateNotStarted | AddonStateNotStopped;
export type AddonStateLoad = AddonStateLoaded | AddonStateNotLoaded;
export type AddonStateStart<A extends AddonAny> = AddonStateStarted<A> | AddonStateNotStarted;
export type AddonStateStop = AddonStateStopped | AddonStateNotStopped;
export type AddonState<A extends AddonAny> = AddonStateStart<A> | AddonStateLoad | AddonStateStop;
