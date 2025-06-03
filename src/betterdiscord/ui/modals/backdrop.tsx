import clsx from "clsx";
import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import type {MouseEvent} from "react";

const Spring = DiscordModules.ReactSpring;


export interface BackdropProps {
    isVisible: boolean;
    className?: string;
    onClick(e: MouseEvent): void;
}

export default function Backdrop({isVisible, className, onClick}: BackdropProps) {
    const transition = Spring.useTransition(isVisible, {
        keys: e => e ? "backdrop" : "empty",
        config: {duration: 300},
        from: {
            opacity: 0,
            background: "var(--black-500)"
        },
        enter: {
            opacity: 0.85,
            background: "var(--black-500)"
        },
        leave: {
            opacity: 0,
            background: "var(--black-500)"
        }
    });

    return transition((styles, visible) => {
        if (!visible) return null;

        return <Spring.animated.div
            className={clsx("bd-modal-backdrop", className)}
            style={styles}
            onClick={onClick}
        />;
    });
}