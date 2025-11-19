import React from "react";
import type {LucideIcon, LucideProps} from "lucide-react";

export interface DiscordProps {
    color: string;
    size: keyof typeof sizes;
    className: string;
}

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

// TODO: Extend for all discord icon prop types
export const lucideToDiscordIcon = (lucide: LucideIcon, middleWare: LucideMiddleware = v => v) => (
    (props: DiscordProps) => React.createElement(lucide, middleWare({
        size: sizes[props.size],
        className: props.className,
        color: props.color
    }, props))
);

// TODO: Extend for all discord icon prop types
export const discordIconToLucide = (discord: DiscordIcon, middleWare: DiscordMiddleware = v => v) => (
    (props: LucideProps) => React.createElement(discord, middleWare({
        size: "custom",
        width: props.size,
        height: props.size,
        className: props.className,
        color: props.color
    } as any, props))
);