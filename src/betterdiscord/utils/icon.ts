import React from "react";
import type {LucideIcon, LucideProps} from "lucide-react";

export type DiscordProps = {
    color?: string;
    className?: string;
} & ({
    size?: keyof typeof sizes;
} | {
    size: "custom",
    width: React.CSSProperties["width"];
    height: React.CSSProperties["height"];
});

export type DiscordIcon = React.ComponentType<DiscordProps>;

// BdApi.Webpack.getModule(m => m.refresh_sm);
const sizes = <const>{
    xxs: 12,
    xs: 16,
    sm: 18,
    md: 24,
    lg: 32,
    custom: void 0,
    refresh_sm: 20
};

type LucideMiddleware = (props: LucideProps, passedProps: DiscordProps) => LucideProps;
type DiscordMiddleware = (props: DiscordProps, passedProps: LucideProps) => DiscordProps;

type LucideToDiscord = (lucide: LucideIcon, middleWare?: LucideMiddleware) => DiscordIcon;
type DiscordToLucide = (lucide: DiscordIcon, middleWare?: DiscordMiddleware) => LucideIcon;

// TODO: Extend for all discord icon prop types
export const lucideToDiscordIcon: LucideToDiscord = (lucide, middleWare = v => v) => (
    (props) => React.createElement(lucide, middleWare({
        size: sizes[props.size || "md"],
        className: props.className,
        color: props.color
    }, props))
);

export const discordIconToLucide: DiscordToLucide = (discord, middleWare = v => v) => (
    (props) => React.createElement(discord, middleWare({
        size: "custom",
        width: props.size,
        height: props.size,
        className: props.className,
        color: props.color
    }, props))
) as LucideIcon; // React.forwardRef is deprecated so we do not need it here