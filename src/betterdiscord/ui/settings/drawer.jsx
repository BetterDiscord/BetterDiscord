import React from "@modules/react";

import Title from "./title";

import Divider from "@ui/divider";

const {useState, useCallback, useRef} = React;

const baseClassName = "bd-settings-group";


export default function Drawer({name, collapsible, shown = true, showDivider, children, titleChildren, onDrawerToggle}) {
    const container = useRef(null);
    const [collapsed, setCollapsed] = useState(collapsible && !shown);
    const toggleCollapse = useCallback(() => {
        const drawer = container.current;
        const timeout = collapsed ? 300 : 1;
        drawer.style.setProperty("height", drawer.scrollHeight + "px");
        drawer.classList.add("animating");
        if (onDrawerToggle) onDrawerToggle(collapsed);
        setCollapsed(!collapsed);
        setTimeout(() => {
            drawer.style.setProperty("height", "");
            drawer.classList.remove("animating");
        }, timeout);

    }, [collapsed, onDrawerToggle]);

    const collapseClass = collapsible ? `collapsible ${collapsed ? "collapsed" : "expanded"}` : "";
    const groupClass = `${baseClassName} ${collapseClass}`;

    return <div className={groupClass}>
                <Title text={name} collapsible={collapsible} onClick={toggleCollapse} isGroup={true}>
                    {titleChildren}
                </Title>
                <div className="bd-settings-container" ref={container}>
                    {children}
                </div>
                {showDivider && <Divider />}
            </div>;
}