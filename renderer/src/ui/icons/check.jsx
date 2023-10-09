import React from "@modules/react";

export default function Checkmark(props) {
    const size = props.size || "24px";
    return <svg viewBox="0 0 24 24" fill="#FFFFFF" className={props.className || ""} style={{width: size, height: size}} onClick={props.onClick}>
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>;
}