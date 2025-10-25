import React from "@modules/react";

export default function Edit(props) {
    return <svg viewBox="0 0 24 24" fill={props.color || "#FFFFFF"} width={"size" in props ? props.size || "24px" : props.width} height={"size" in props ? props.size || "24px" : props.height} size onClick={props.onClick} className={props.className}>
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            <path d="M0 0h24v24H0z" fill="none" />
            </svg>;
}