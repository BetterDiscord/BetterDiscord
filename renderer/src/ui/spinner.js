import WebpackModules from "@modules/webpackmodules";
import React from "@modules/react";

const {Spinner: WebpackSpinner} = WebpackModules.getByProps("Spinner", "Tooltip");

/**
 * @typedef {typeof SpinnerType} SpinnerType
 */

/**
 * 
 * @param {{
 *    type?: SpinnerType[keyof SpinnerType], 
 *    animated?: boolean, 
 *    className?: string, 
 *    itemClassName?: string, 
 *    "aria-label"?: string
 * }} props 
 * @returns 
 */
function Spinner(props) {
  return React.createElement(WebpackSpinner, props);
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