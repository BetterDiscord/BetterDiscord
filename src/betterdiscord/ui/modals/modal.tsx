import React, {type ReactNode, useCallback} from "react";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Text from "../base/text";
import Button from "../base/button";
import Flex from "@ui/base/flex.tsx";
import ErrorBoundary from "@ui/errorboundary.tsx";
import CheckBox from "@ui/settings/components/checkbox.tsx";
import Logger from "@common/logger.ts";
import {CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon} from "lucide-react";

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

export const Icon = ({type = "info"}: { type: "warning" | "critical" | "info" | "positive"; }) => {
    switch (type) {
        case "warning":
            return <TriangleAlertIcon color="var(--status-warning)" size="18px"/>;
        case "critical":
            return <CircleAlertIcon color="var(--status-danger)" size="18px"/>;
        case "info":
            return <InfoIcon color="#3B82F6" size="18px"/>;
        case "positive":
            return <CircleCheckIcon color="var(--status-positive)" size="18px"/>;
        default:
            return null;
    }
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

interface CheckboxProps {
    note: string;
    defaultValue: boolean;
    onChange: (value: boolean) => void;
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

    checkboxProps?: CheckboxProps;

    actions?: ActionProps[];
    notice?: {
        message: ReactNode;
        type?: "info" | "critical" | "positive" | "warning";
        icon?: React.FunctionComponent;
    };

    onClose?(): void;

    onCloseCallback?({
                         checked,
                     }: { checked: boolean }): void;
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
                                  checkboxProps
                              }: ModalProps) {
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);

    const [checked, setChecked] = useState<boolean>(checkboxProps?.defaultValue ?? false);

    const handleAction = useCallback(async (action: any, index: number) => {
        setPendingIndex(index);
        let result;
        try {
            result = await action.onClick?.();
        }
        catch (err) {
            Logger.err(err as string);
            return;
        }
        finally {
            setPendingIndex(null);
        }

        if (result !== false && action.closeOnClick !== false) onClose?.();
    }, [onClose]);

    useLayoutEffect(() => {
        onCloseCallback?.({
            checked: checked,
        });
    }, [checked, onCloseCallback]);

    return (
        <ErrorBoundary name="Modal" id="Components.Modal">
            <Root transitionState={transitionState} size={resolveSize(size)} className={className}>
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

                        {notice?.message && (
                            <div className={`bd-modal-notice-story-container bd-modal-notice-${notice.type}`}>
                                <div className="bd-modal-notice-story-container-inner">
                                    {notice.icon ? (
                                        <div className="bd-modal-icon-holder">
                                            <notice.icon/>
                                        </div>
                                        ) : <div className="bd-modal-icon-holder">
                                            {notice.type && <Icon type={notice.type}/>}
                                        </div>
                                    }
                                    <Flex align="bd-flex-align-center">
                                        <Text size={Text.Sizes.SIZE_14}>{notice.message}</Text>
                                    </Flex>
                                </div>
                            </div>
                        )}
                    </Flex>
                </Header>

                <Content className={"bd-text-muted"}>{children}</Content>

                {checkboxProps && (
                    <div className={"bd-checkbox-note-group"}>
                        <CheckBox
                            label={checkboxProps.note}
                            value={checked}
                            onChange={(newValue) => {
                                setChecked(newValue);
                                checkboxProps?.onChange?.(newValue);
                            }}
                        />
                    </div>
                )}

                {actions.length > 0 && (
                    <Footer
                        className={"bd-modal-footer-buttons"}>
                        {actions.map((action, index) => (
                            <Button
                                key={`${action.label}-${index}`}
                                type="button"
                                look={action.look ?? Button.Looks.FILLED}
                                color={resolveColor(action.color)}
                                disabled={action.disabled || pendingIndex !== null}
                                submitting={pendingIndex === index}
                                onClick={() => handleAction(action, index)}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Footer>
                )}
            </Root>
        </ErrorBoundary>
    );
}