import {React, WebpackModules} from "modules";
import "../../styles/ui/details.css";

const detailsClasses = WebpackModules.getByProps(
    "detailsWrapper",
    "detailsIcon"
);

export default React.memo(function DetailsIcon(props) {
    return (
        <svg
            className={`bd-details-icon ${detailsClasses.detailsIcon}${
                props.className ? ` ${props.className}` : ""
            }`}
            aria-hidden="false"
            width="16"
            height="16"
            viewBox="0 0 12 12"
        >
            <path
                fill="currentColor"
                d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"
            ></path>
        </svg>
    );
});
