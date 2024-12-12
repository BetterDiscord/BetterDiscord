import React from "@modules/react";
import Utilities from "@modules/utilities";
import WebpackModules from "@modules/webpackmodules";

const AccessibilityContext = WebpackModules.getModule(m => m?._currentValue?.reducedMotion, {searchExports: true}) || React.createContext({
    reducedMotion: {enabled: false}
});

/**
 * @typedef {typeof SpinnerType} SpinnerType
 */
/**
 * @typedef {SpinnerType[keyof SpinnerType]} SpinnerTypes
 */

/**
 * @param {{
 *    type?: SpinnerTypes, 
 *    animated?: boolean, 
 *    className?: string, 
 *    itemClassName?: string, 
 *    "aria-label"?: string
 * }} props 
 * @returns {JSX.Element}
 */
function Spinner(props) {
    const {reducedMotion} = React.useContext(AccessibilityContext);
    
    const {animated = true} = props;

    /** @type {SpinnerTypes} */
    const type = React.useMemo(() => {
        const spinnerType = props.type || SpinnerType.WANDERING_CUBES;
        if (!reducedMotion?.enabled) return spinnerType;

        switch (spinnerType) {
            case SpinnerType.WANDERING_CUBES:
            case SpinnerType.CHASING_DOTS:
                return SpinnerType.LOW_MOTION;
            default:
                return spinnerType;
        }
    }, [props.type, reducedMotion?.enabled]);

    switch (type) {
        case SpinnerType.SPINNING_CIRCLE:
        case SpinnerType.SPINNING_CIRCLE_SIMPLE: {
            return (
                <div
                    className={Utilities.className({
                        "bd-spinner-stopAnimation": !animated
                    }, "bd-spinner", `bd-spinner-${type}`, props.className)}
                    role="img"
                    aria-label={props["aria-label"]}
                    {...props}
                >
                    <div className="bd-spinner-inner">
                        <svg 
                            className="bd-spinner-circular"
                            viewBox="25 25 50 50"
                        >
                            {type === SpinnerType.SPINNING_CIRCLE && (
                                <>
                                    <circle cx={50} cy={50} r={20} className="bd-spinner-path" />
                                    <circle cx={50} cy={50} r={20} className="bd-spinner-path" />
                                </>
                            )}
                            <circle cx={50} cy={50} r={20} className="bd-spinner-path" />
                        </svg>
                    </div>
                </div>
            );
        }
        default: {
            return (
                <span
                    className={Utilities.className({
                        "bd-spinner-stopAnimation": !animated
                    }, "bd-spinner", `bd-spinner-${type}`, props.className)}
                    role="img"
                    aria-label={props["aria-label"]}
                    {...props}
                >
                    <span className="bd-spinner-inner">
                        <span className="bd-spinner-path" />
                        <span className="bd-spinner-path" />
                        {(type === SpinnerType.PULSING_ELLIPSIS || type === SpinnerType.LOW_MOTION) && (
                            <span className="bd-spinner-path" />
                        )}
                    </span>
                </span>
            );
        }
    }
}

export const SpinnerType = Spinner.Type = Object.freeze({
    WANDERING_CUBES: "wanderingCubes",
    CHASING_DOTS: "chasingDots",
    PULSING_ELLIPSIS: "pulsingEllipsis",
    SPINNING_CIRCLE: "spinningCircle",
    SPINNING_CIRCLE_SIMPLE: "spinningCircleSimple",
    LOW_MOTION: "lowMotion"
});

export default Spinner;
