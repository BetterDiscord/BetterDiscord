import React from "@modules/react";
import clsx from "clsx";


export default ({className, ...props}: React.JSX.IntrinsicElements["hr"]) => <hr {...props} className={clsx("bd-divider", className)} />;