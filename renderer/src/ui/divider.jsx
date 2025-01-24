import React from "@modules/react";


export default ({className, ...props}) => <hr {...props} className={`bd-divider ${className || ""}`} />;