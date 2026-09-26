import React, {type ReactNode} from "react";

import Root, {ModalSizes} from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Text from "../base/text";
import Button, {ButtonColors} from "../base/button";
import Flex from "@ui/base/flex.tsx";
import ErrorBoundary from "@ui/errorboundary.tsx";

const {useRef, useEffect, useLayoutEffect, useState} = React;

type MenuItemColor =
    | "default"
    | "brand"
    | "danger"
    | "success";

const COLOR_MAP: Record<MenuItemColor, string> = {
    "default": Button.Colors.PRIMARY,
    "brand": Button.Colors.BRAND,
    "danger": Button.Colors.RED,
    "success": Button.Colors.GREEN,
};

type ModalSize = "sm" | "md" | "lg" | "dy";

const SIZE_MAP: Record<ModalSize, typeof Root.Sizes[keyof typeof Root.Sizes]> = {
    sm: Root.Sizes.SMALL,
    md: Root.Sizes.MEDIUM,
    lg: Root.Sizes.LARGE,
    dy: Root.Sizes.DYNAMIC,
};

function resolveSize(size?: ModalSize | string): typeof Root.Sizes[keyof typeof Root.Sizes] | string {
    if (size?.startsWith("bd-")) return size;
    return SIZE_MAP[size as ModalSize] ?? Root.Sizes.MEDIUM;
}

function resolveColor(color?: MenuItemColor | string): string {
    if (color?.startsWith("bd-")) return color;
    return COLOR_MAP[color as MenuItemColor] ?? Button.Colors.PRIMARY;
}

interface ActionProps {
    label: string;
    color?: MenuItemColor | string;
    look?: typeof Button.Looks[keyof typeof Button.Looks];
    disabled?: boolean;

    onClick?(): void | boolean | Promise<void | boolean>;

    closeOnClick?: boolean;
}

interface ModalProps {
    size?: ModalSize | string;
    transitionState?: number;
    className?: string;

    title: string | ReactNode;
    subtitle?: string | ReactNode;

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
        <Root transitionState={transitionState} size={resolveSize(size) as typeof ModalSizes[keyof typeof ModalSizes]}
              className={className}>
            <ErrorBoundary name={"Modal"} id={"Components.Modal"}>
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
                                        <notice.icon/>
                                    </div>
                                )}
                                <Flex align="bd-flex-align-center">
                                    <Text size={Text.Sizes.SIZE_14}>{notice.message}</Text>
                                </Flex>
                            </div>
                        </div>
                    </div>
                )}

                <Content>
                    {children}
                </Content>

                {actions.length > 0 && (
                    <Footer>
                        {actions.map((action, index) => (
                            <Button
                                key={`${action.label}-${index}`}
                                type="button"
                                look={action.look ?? Button.Looks.FILLED}
                                color={(resolveColor(action.color) as typeof ButtonColors[keyof typeof ButtonColors])}
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