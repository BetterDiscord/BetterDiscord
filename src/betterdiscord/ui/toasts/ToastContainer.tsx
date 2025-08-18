import React, {Fragment} from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import ToastIcon from "@ui/toasts/ToastIcon";
import ToastStore from "@stores/toasts";
import {useInternalStore} from "@ui/hooks";

import clsx from "clsx";
import type {AnimatedProps} from "@react-spring/web";

const ReactSpring = DiscordModules.ReactSpring;

export type ToastType = "default" | "info" | "success" | "warning" | "error";

interface ToastItemProps {
    content: string;
    type: ToastType;
    icon: boolean;
    style: AnimatedProps<React.CSSProperties>;
}

export interface ToastProps {
    key: number;
    content: string;
    type: ToastType;
    icon: boolean;
    timeout: number;
}

export function Toast({content, type, icon, style}: ToastItemProps) {
    return <ReactSpring.animated.div className={clsx("bd-toast", `toast-${type}`)} style={style}>
        {icon && <ToastIcon type={type} />}
        <span>{content}</span>
    </ReactSpring.animated.div>;
}

export default function ToastContainer() {
    const toasts = useInternalStore(ToastStore, () => ToastStore.toasts);

    const transition = ReactSpring.useTransition(toasts, {
        keys: (toast: ToastProps) => toast.key,
        from: {opacity: 0, transform: "translateY(100%)"},
        enter: {opacity: 1, transform: "translateY(0px)"},
        leave: {opacity: 0, transform: "translateY(100%)"},
        config: ReactSpring.config.stiff,
    });

    return <Fragment>
        {transition((style, item) => (
            <Toast
                key={item.key}
                content={item.content}
                type={item.type}
                icon={item.icon}
                style={style}
            />
        ))}
    </Fragment>;
}