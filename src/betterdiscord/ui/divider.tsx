import React from "@modules/react";


export type DividerProps = {
    className?: string;
    [prop: string]: any;
};

export default ({className, ...props}: DividerProps) => <hr {...props} className={`bd-divider ${className || ""}`} />;