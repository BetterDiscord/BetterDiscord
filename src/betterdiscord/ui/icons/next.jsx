import React from "@modules/react";

export default function ArrowRight(props) {
    const size = props.size || "24px";
    return <svg viewBox="0 0 24 24" style={{width: size, height: size}}>
        <path d="M10 17l5-5-5-5v10z" />
        <path d="M0 24V0h24v24H0z" fill="none" />
        </svg>;
}
