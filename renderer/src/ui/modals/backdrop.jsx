import React from "@modules/react";
import WebpackModules from "@modules/webpackmodules";
import Utilities from "@modules/utilities";

const Spring = WebpackModules.getByProps("useSpring", "animated");


export default function Backdrop({isVisible, className, onClick}) {
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
                className={Utilities.className("bd-modal-backdrop", className)}
                style={styles}
                onClick={onClick}
        />;
    });
}