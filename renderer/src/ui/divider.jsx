import {React} from "modules";

export default ({className, ...rest}) => <hr className={`bd-divider ${className || ""}`} {...rest} />