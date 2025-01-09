import React from "@modules/react";

export default function Clock(props) {
    const size = props.size || 18;
    return <svg viewBox="0 0 24 24" fill={props.color || "currentColor"} style={{width: size, height: size}} onClick={props.onClick}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1-18a1 1 0 1 0-2 0v7c0 .27.1.52.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.58V5Z" />
        </svg>;
}
