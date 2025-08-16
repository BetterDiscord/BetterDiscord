import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import ToastIcon from "@ui/toasts/ToastIcon";

import clsx from "clsx";

const ReactSpring = DiscordModules.ReactSpring;

export type ToastType = "default" | "info" | "success" | "warning" | "error";

interface ToastProps {
    content: string;
    type: ToastType;
    icon: boolean;
    style?: any;
}

export default function Toast({content, type, icon, style}: ToastProps) {
    return <ReactSpring.animated.div className={clsx("bd-toast", `toast-${type}`)} style={style}>
            {icon && <ToastIcon type={type} />}
            <span>{content}</span>
        </ReactSpring.animated.div>;
}