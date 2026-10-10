import clsx from "clsx";
import React, {type PropsWithChildren} from "react";
import DiscordModules from "@modules/discordmodules";
import {Filters, getByKeys, getProxy} from "@webpack";

// TODO: rewrite these types properly
const Anims: any = getByKeys(["Easing"], {firstId: 615300, cacheId: "core-modalroot-anims"});


export const ModalSizes = Object.freeze({
    SMALL: "bd-modal-small",
    MEDIUM: "bd-modal-medium",
    LARGE: "bd-modal-large",
    DYNAMIC: ""
});

export const ModalStyles = Object.freeze({
    STANDARD: "bd-modal-standard",
    CUSTOM: ""
});

const ReactFocusRings = getProxy<typeof import("react-focus-rings")>(Filters.bySource("focus-rings-ring"), {
    cacheId: "core-react-focus-rings",
    map: {
        FocusRing: Filters.byStrings("FocusRing was given a focusTarget"),
        FocusRingScope: Filters.byStrings(".current),", ".Provider,{value:", ".current.setThemeOptions"),
        FocusRingManager: x => typeof x === "object"
    }
});

type RootProps = PropsWithChildren<{
    className?: string;
    transitionState?: number;
    size?: typeof ModalSizes[keyof typeof ModalSizes];
    style?: typeof ModalStyles[keyof typeof ModalStyles];
}>;

export default function ModalRoot({className, transitionState, children, size = ModalSizes.DYNAMIC, style = ModalStyles.CUSTOM}: RootProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const visible = transitionState == 0 || transitionState == 1; // 300 ms

    const preferences: any = React.useContext(DiscordModules.AccessibilityContext ?? {});
    const reducedMotion = preferences?.reducedMotion?.enabled ?? document.documentElement?.classList.contains("reduce-motion");

    const springStyles = DiscordModules.ReactSpring.useSpring({
        opacity: visible ? 1 : 0,
        transform: visible || reducedMotion ? "scale(1)" : "scale(0.7)",
        config: {
            duration: visible ? 300 : 100,
            easing: visible ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
            clamp: true
        }
    });

    return (
        <ReactFocusRings.FocusRingScope containerRef={ref}>
            <DiscordModules.ReactSpring.animated.div
                ref={ref}
                className={clsx("bd-modal-root", size, className, style)}
                style={springStyles}
            >
                {children}
            </DiscordModules.ReactSpring.animated.div>
        </ReactFocusRings.FocusRingScope>
    );
}

ModalRoot.Sizes = ModalSizes;
ModalRoot.Styles = ModalStyles;