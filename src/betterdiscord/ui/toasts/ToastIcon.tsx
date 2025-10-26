import React from "@modules/react";
import type {ToastType} from "@ui/toasts";

import {CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon} from "lucide-react";

export default function ToastIcon({type}: {type: ToastType}) {
    switch (type) {
        case "info":
            return <InfoIcon size="24px" />;
        case "success":
            return <CircleCheckIcon size="24px" />;
        case "warning":
            return <TriangleAlertIcon size="24px" />;
        case "error":
            return <CircleAlertIcon size="24px" />;
        default:
            return null;
    }
}