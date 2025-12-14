
import React from "react";
import {getLazyBySource} from "@webpack";
import type * as RR from "react-router";

export let useLocation: typeof RR["useLocation"] = () => {
    return React.useMemo(() => ({
        pathname: location.pathname,
        search: location.search,
        state: {} as any,
        hash: location.hash,
        key: undefined
    }), []);
};

getLazyBySource([".location", "withRouter"], {searchDefault: false}).then((ReactRouter: any) => {
    const _useLocation = Object.values(ReactRouter)
        .find((m: any) => m?.length === 0 && String(m).includes(".location"));

    if (_useLocation) {
        useLocation = _useLocation as typeof RR["useLocation"];
    }
});