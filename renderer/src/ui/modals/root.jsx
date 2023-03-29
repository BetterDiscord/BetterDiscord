import {React, Utilities, WebpackModules} from "modules";

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


export default function ModalRoot({className, transitionState, children, size = Sizes.DYNAMIC, style = Styles.CUSTOM}) {
    const visible = transitionState == 0 || transitionState == 1;
    const springStyles = Spring.useSpring({
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.7)",
        config: {
            duration: visible ? 300 : 100,
            easing: visible ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
            clamp: true
        }
    });
    return <Spring.animated.div
                className={Utilities.className("bd-modal-root", size, className, style)}
                style={springStyles}
            >
        {children}
    </Spring.animated.div>;
}

ModalRoot.Sizes = Sizes;
ModalRoot.Styles = Styles;