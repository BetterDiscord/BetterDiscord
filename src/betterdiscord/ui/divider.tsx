import React from "react";
import clsx from "clsx";


export default ({className, ...props}: React.JSX.IntrinsicElements["hr"]) => <hr {...props} className={clsx("bd-divider", className)} />;