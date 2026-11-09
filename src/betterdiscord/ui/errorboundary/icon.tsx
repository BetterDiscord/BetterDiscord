import React, {type SVGProps} from "react";


export default function ErrorIcon(props: SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 1a11 11 0 1 0 0 22a11 11 0 1 0 0-22zM10.75 6.5a1.25 1.25 0 0 1 2.5 0v7a1.25 1.25 0 0 1-2.5 0zM12 16a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3z"
        />
    </svg>;
}
