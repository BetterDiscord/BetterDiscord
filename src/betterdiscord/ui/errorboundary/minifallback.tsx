import React from "react";
import {t} from "@common/i18n";
import ErrorIcon from "@ui/errorboundary/icon";
import type {ErrorBoundaryProps} from "@ui/errorboundary";


export default function MiniFallback({name, style}: Pick<ErrorBoundaryProps, "name" | "style">) {
    const label = t("ErrorBoundary.short", {context: name && "named", name});

    return <span className="bd-error-boundary-mini" style={style} role="img" aria-label={label} title={label}>
        <ErrorIcon width="1em" height="1em" />
    </span>;
}
