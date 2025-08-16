import React, {Fragment} from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import ToastStore from "@stores/toasts";
import {useInternalStore} from "@ui/hooks";

import Toast, {type ToastType} from "@ui/toasts/Toast";

const ReactSpring = DiscordModules.ReactSpring;

export interface ToastProps {
    key: number;
    content: string;
    type: ToastType;
    icon: boolean;
    timeout: number;
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