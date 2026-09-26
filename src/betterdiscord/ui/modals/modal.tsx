import React, {type ReactNode} from "react";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Text from "../base/text";
import Button from "../base/button";
import Flex from "@ui/base/flex.tsx";
import ErrorBoundary from "@ui/errorboundary.tsx";

const {useLayoutEffect, useState} = React;

type MenuItemColor = "default" | "brand" | "danger" | "success";
type ModalSize = "sm" | "md" | "lg" | "dy";

type RootSize = (typeof Root.Sizes)[keyof typeof Root.Sizes];
type ButtonColor = (typeof Button.Colors)[keyof typeof Button.Colors];
type ButtonLook = (typeof Button.Looks)[keyof typeof Button.Looks];

const SIZE_MAP: Record<ModalSize, RootSize> = {
    sm: Root.Sizes.SMALL,
    md: Root.Sizes.MEDIUM,
    lg: Root.Sizes.LARGE,
    dy: Root.Sizes.DYNAMIC,
};

const COLOR_MAP: Record<MenuItemColor, ButtonColor> = {
    "default": Button.Colors.PRIMARY,
    "brand": Button.Colors.BRAND,
    "danger": Button.Colors.RED,
    "success": Button.Colors.GREEN,
};

function resolveMapped<TKey extends string, TValue extends string>(
    value: TKey | TValue | undefined,
    map: Record<TKey, TValue>,
    fallback: TValue,
): TValue {
    if (typeof value === "string" && value.startsWith("bd-")) return value as TValue;
    return (map as Record<string, TValue>)[value as string] ?? fallback;
}

function resolveSize(size?: ModalSize | RootSize): RootSize {
    return resolveMapped(size, SIZE_MAP, Root.Sizes.MEDIUM);
}

function resolveColor(color?: MenuItemColor | ButtonColor): ButtonColor {
    return resolveMapped(color, COLOR_MAP, Button.Colors.PRIMARY);
}

interface ActionProps {
    label: string;
    color?: MenuItemColor | ButtonColor;
    look?: ButtonLook;
    disabled?: boolean;
    onClick?(): void | boolean | Promise<void | boolean>;
    closeOnClick?: boolean;
}

interface ModalProps {
    size?: ModalSize | RootSize;
    transitionState?: number;
    className?: string;

    title: ReactNode;
    subtitle?: ReactNode;

    children?: ReactNode;

    actions?: ActionProps[];
    notice?: {
        message: ReactNode;
        type?: "info" | "critical" | "positive" | "warning";
        icon?: React.FunctionComponent;
    };

    onClose?(): void;
    onCloseCallback?(): void;
}

export default function Modal({
                                  size,
                                  transitionState,
                                  className,
                                  title,
                                  subtitle,
                                  children,
                                  actions = [],
                                  notice,
                                  onClose,
                                  onCloseCallback,
                              }: ModalProps) {
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);

    useLayoutEffect(() => {
        onCloseCallback?.();
    }, [onCloseCallback]);

    return (
        <Root transitionState={transitionState} size={resolveSize(size)} className={className}>
            <ErrorBoundary name="Modal" id="Components.Modal">
                <Header>
                    <Flex direction={Flex.Direction.VERTICAL}>
                        <Text tag="h1" size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY} strong>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text tag="h1" size={Text.Sizes.SIZE_16} color={Text.Colors.HEADER_SECONDARY}>
                                {subtitle}
                            </Text>
                        )}
                    </Flex>
                </Header>

                {notice?.message && (
                    <div style={{padding: "0px 10px"}}>
                        <div className={`bd-modal-notice-story-container bd-modal-notice-${notice.type}`}>
                            <div className="bd-modal-notice-story-container-inner">
                                {notice.icon && (
                                    <div className="bd-modal-icon-holder">
                                        <notice.icon />
                                    </div>
                                )}
                                <Flex align="bd-flex-align-center">
                                    <Text size={Text.Sizes.SIZE_14}>{notice.message}</Text>
                                </Flex>
                            </div>
                        </div>
                    </div>
                )}

                <Content>{children}</Content>

                {actions.length > 0 && (
                    <Footer>
                        {actions.map((action, index) => (
                            <Button
                                key={`${action.label}-${index}`}
                                type="button"
                                look={action.look ?? Button.Looks.FILLED}
                                color={resolveColor(action.color)}
                                disabled={action.disabled || pendingIndex !== null}
                                submitting={pendingIndex === index}
                                onClick={async () => {
                                    const maybePromise = action.onClick?.();
                                    if (maybePromise instanceof Promise) {
                                        setPendingIndex(index);
                                        try {
                                            const result = await maybePromise;
                                            if (result !== false && action.closeOnClick !== false) {
                                                onClose?.();
                                            }
                                        }
                                        finally {
                                            setPendingIndex(null);
                                        }
                                        return;
                                    }

                                    if (maybePromise !== false && action.closeOnClick !== false) {
                                        onClose?.();
                                    }
                                }}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Footer>
                )}
            </ErrorBoundary>
        </Root>
    );
}