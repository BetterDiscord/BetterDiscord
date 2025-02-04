import clsx from "clsx";
import React from "@modules/react";
import WebpackModules from "@modules/webpackmodules";

const Spring = WebpackModules.getByProps("useSpring", "animated");
const Anims = WebpackModules.getByProps("Easing");


export const Sizes = Object.freeze({
    SMALL: "bd-modal-small",
    MEDIUM: "bd-modal-medium",
    LARGE: "bd-modal-large",
    DYNAMIC: ""
});

export const Styles = Object.freeze({
    STANDARD: "bd-modal-standard",
    CUSTOM: ""
});


const AccessibilityContext = WebpackModules.getModule(m => m?._currentValue?.reducedMotion, {searchExports: true});
const FocusLock = WebpackModules.getModule(m => m?.render?.toString().includes("impressionProperties") && m?.render?.toString().includes(".Provider"), {searchExports: true}) ?? React.Fragment;

export default function ModalRoot({className, transitionState, children, size = Sizes.DYNAMIC, style = Styles.CUSTOM}) {
    const visible = transitionState == 0 || transitionState == 1; // 300 ms
    
    const preferences = React.useContext(AccessibilityContext ?? {});
    const reducedMotion = preferences?.reducedMotion?.enabled ?? document.documentElement?.classList.contains("reduce-motion");
    
    const springStyles = Spring.useSpring({
        opacity: visible ? 1 : 0,
        transform: visible || reducedMotion ? "scale(1)" : "scale(0.7)",
        config: {
            duration: visible ? 300 : 100,
            easing: visible ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
            clamp: true
        }
    });

    return <FocusLock disableTrack={true}>
        <Spring.animated.div
                className={clsx("bd-modal-root", size, className, style)}
                style={springStyles}
            >
        {children}
    </Spring.animated.div>
    </FocusLock>;
    // const [visible, setVisible] = React.useState(true);

    // const visible = transitionState < 2;
    // const springTransition = Spring.useTransition(transitionState, {
    //     keys: e => e ? "backdrop" : "empty",
    //     from: {
    //         opacity: 0,
    //         transform: "scale(0.7)"
    //     },
    //     enter: {
    //         opacity: 1,
    //         transform: "scale(1)"
    //     },
    //     leave: {
    //         opacity: 0,
    //         transform: "scale(0.7)"
    //     },
    //     // config: (a, b, c, d) => {
    //     //     console.log({a, b, c, d});
    //     //     return {
    //     //         duration: a ? 300 : 100,
    //     //         easing: a ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
    //     //         clamp: true
    //     //     };
    //     // }
    //     config: (a, b, c) => {
    //         console.log({a, b, c});
    //         return {
    //             duration: true ? 300 : 100,
    //             easing: true ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
    //             clamp: true
    //         };
    //     }
    // });

    // return springTransition((styles, isVisible) => {
    //     if (!isVisible) console.log("not visible");
    //     return <Spring.animated.div
    //             className={clsx("bd-modal-root", size, className, style)}
    //             style={styles}
    //         >
    //     {children}
    // </Spring.animated.div>;
    // });
}

ModalRoot.Sizes = Sizes;
ModalRoot.Styles = Styles;