import React from "react";
import {t} from "@common/i18n";
import ErrorIcon from "@ui/errorboundary/icon";
import type {ErrorBoundaryProps} from "@ui/errorboundary";


export default function SmallFallback({name, style}: Pick<ErrorBoundaryProps, "name" | "style">) {
    return <span className="bd-error-boundary-small" style={style} role="status">
        <ErrorIcon width="1.15em" height="1.15em" />
        {t("ErrorBoundary.short", {context: name && "named", name})}
    </span>;
}
