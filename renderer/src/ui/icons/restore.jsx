import React from "@modules/react";

export default function Restore(props) {
    const size = props.size || "24px";
    return <svg className={props.className || ""} fill="#FFFFFF" viewBox="0 0 24 24" style={{width: size, height: size}} onClick={props.onClick}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>
        </svg>;
}
