import clsx from "clsx";
import React from "@modules/react";
import {getModule} from "@webpack";

const AccessibilityContext = getModule(m => m?._currentValue?.reducedMotion, {searchExports: true}) || React.createContext({
    reducedMotion: {enabled: false}
});

/**
 * @typedef {typeof SpinnerType} SpinnerType
 */
/**
 * @typedef {SpinnerType[keyof SpinnerType]} SpinnerTypes
 */

/**
 * @typedef {Object} SpinnerProps
 * @property {SpinnerType} [type] Type of the spinner
 * @property {boolean} [animated] Should the spinner be animated
 * @property {string} [className] Classes to pass to the spinner
 * @property {string} [itemClassName] Classes for the motion items in the spinner
 * @property {string} [aria-label]
 */

/**
 * Clone of Discord's builtin spinner, acts 100% the same
 * @param {SpinnerProps} props
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

    /** @type {string} */
    const className = React.useMemo(() => {
        return clsx({
            "bd-spinner-stopAnimation": !animated
        }, "bd-spinner", `bd-spinner-${type}`, props.className);
    }, [props.className, animated, type]);

    const itemClassName = React.useMemo(() => {
        return clsx("bd-spinner-path", props.itemClassName);
    }, [props.itemClassName]);

    switch (type) {
        case SpinnerType.SPINNING_CIRCLE:
        case SpinnerType.SPINNING_CIRCLE_SIMPLE: {
            return (
                <div
                    className={className}
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
                                    <circle cx={50} cy={50} r={20} className={itemClassName} />
                                    <circle cx={50} cy={50} r={20} className={itemClassName} />
                                </>
                            )}
                            <circle cx={50} cy={50} r={20} className={itemClassName} />
                        </svg>
                    </div>
                </div>
            );
        }
        default: {
            return (
                <span
                    className={className}
                    role="img"
                    aria-label={props["aria-label"]}
                    {...props}
                >
                    <span className="bd-spinner-inner">
                        <span className={itemClassName} />
                        <span className={itemClassName} />
                        {(type === SpinnerType.PULSING_ELLIPSIS || type === SpinnerType.LOW_MOTION) && (
                            <span className={itemClassName} />
                        )}
                    </span>
                </span>
            );
        }
    }
}

export const SpinnerType = Spinner.Type = Object.freeze({
    WANDERING_CUBES: "wandering-cubes",
    CHASING_DOTS: "chasing-dots",
    PULSING_ELLIPSIS: "pulsing-ellipsis",
    SPINNING_CIRCLE: "spinning-circle",
    SPINNING_CIRCLE_SIMPLE: "spinning-circle-simple",
    LOW_MOTION: "low-motion"
});

export default Object.freeze(Spinner);
