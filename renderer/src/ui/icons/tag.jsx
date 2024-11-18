import React from "@modules/react";

export default function Tag(props) {
    const size = props.size || 18;
    return <svg viewBox="0 0 24 24" fill={props.color || "currentColor"} style={{width: size, height: size}} onClick={props.onClick}>
        <path fillRule="evenodd" d="M12.24 2a3 3 0 0 0-2.12.88l-8.25 8.25a3 3 0 0 0 0 4.24l6.76 6.76a3 3 0 0 0 4.24 0l8.25-8.25a3 3 0 0 0 .88-2.12V4a2 2 0 0 0-2-2h-7.76ZM17 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>;
}
