import React from "react";
import {Filters, getModule} from "@webpack";
import type {DiscordIcon} from "@utils/icon";

export interface HeaderProps {
    toolbar?: React.ReactNode,
    children?: React.ReactNode,
    childrenBottom?: React.ReactNode,
    transparent?: boolean,
    className?: string,
    innerClassName?: string,
}
export interface HeaderTitleProps {
    className?: string,
    wrapperClassName?: string,
    children: React.ReactNode,
    onContextMenu?: React.JSX.IntrinsicElements["div"]["onContextMenu"],
    onClick?: React.JSX.IntrinsicElements["div"]["onClick"],
    id?: string,
    muted?: boolean,
    level?: number;
}

export interface HeaderIconProps {
    className?: string,
    iconClassName?: string,
    children?: React.ReactNode,
    selected?: boolean,
    disabled?: boolean,
    showBadge?: boolean,
    badgePosition?: "top" | "bottom",
    color?: React.CSSProperties["color"],
    foreground?: React.CSSProperties["color"],
    background?: React.CSSProperties["background"],
    icon: DiscordIcon,
    onContextMenu?: React.JSX.IntrinsicElements["div"]["onContextMenu"],
    onClick?: React.JSX.IntrinsicElements["div"]["onClick"],
    tooltip?: string,
    tooltipColor?: string,
    tooltipPosition?: string,
    tooltipDisabled?: boolean,
    hideOnClick?: boolean,
    role?: React.JSX.IntrinsicElements["div"]["role"],
    "aria-label"?: string,
    "aria-hidden"?: boolean,
    "aria-checked"?: boolean,
    "aria-expanded"?: boolean,
    "aria-haspopup"?: boolean;
}
export interface HeaderDividerProps {
    className?: string;
}
export interface HeaderCaretProps {
    className?: string;
}
export interface Header extends React.FunctionComponent<HeaderProps> {
    Icon: React.FunctionComponent<HeaderIconProps>,
    Title: React.FunctionComponent<HeaderTitleProps>,
    Divider: React.FunctionComponent<HeaderDividerProps>,
    Caret: React.FunctionComponent<HeaderCaretProps>;
}

let Header: Header | undefined;

function getHeaderBar(): Header {
    if (typeof Header === "undefined") {
        Header = getModule(Filters.combine(
            Filters.byKeys(["Icon", "Divider"]),
            Filters.not(Filters.byStrings("isAuthenticated"))
        ));
    }
    if (typeof Header === "undefined") {
        // Not Real
        return (() => {}) as unknown as Header;
    }

    return Header;
}

const HeaderBar = new Proxy<Header>(((props) => React.createElement(getHeaderBar(), props)) as Header, {
    get(_, p) {
        return getHeaderBar()[p as keyof Header];
    },
}) as Header;

export default HeaderBar;