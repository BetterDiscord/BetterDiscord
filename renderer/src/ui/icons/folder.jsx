import React from "@modules/react";

export default function Folder(props) {
    const size = props.size || "20px";
    return <svg className={props.className || ""} fill="#FFFFFF" viewBox="0 0 24 24" style={{width: size, height: size}} onClick={props.onClick}>
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>;
}
