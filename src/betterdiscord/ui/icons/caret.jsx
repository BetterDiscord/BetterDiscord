import React from "@modules/react";

/**
 * @param {{ angle?: number, size?: number }} props \
 */
export default function Caret(props) {
    const size = props.size || 24;
    const angle = props.angle || 0;

    return (
        <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" style={{width: size, height: size, rotate: `${angle}deg`}} fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z" />
        </svg>
    );
}
