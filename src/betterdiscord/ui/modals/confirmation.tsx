import React from "@modules/react";
import {t} from "@common/i18n";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Text from "../base/text";
import Button from "../base/button";
import type {PropsWithChildren} from "react";

const {useRef, useEffect, useLayoutEffect} = React;


export type ConfirmationModalOptions = PropsWithChildren<{
    onClose?(): void;
    onConfirm?(): void;
    onCancel?(): void;
    onCloseCallback?(): void;
    transitionState?: number;
    size?: typeof Root.Sizes[keyof typeof Root.Sizes];
    className?: string;
    header?: string;
    confirmText?: string;
    cancelText?: string | null;
    danger?: boolean;
    key?: string | number;
}>;

export default function ConfirmationModal({transitionState, onClose, onCloseCallback, className, size = Root.Sizes.SMALL, header, children, danger = false, onCancel = () => {}, onConfirm = () => {}, cancelText = t("Modals.cancel"), confirmText = t("Modals.okay")}: ConfirmationModalOptions) {

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setTimeout(() => buttonRef?.current?.focus?.(), 0);
    }, []);

    useLayoutEffect(() => {
        onCloseCallback?.();
    }, [onCloseCallback]);

    return <Root transitionState={transitionState} size={size} className={className}>
        <Header>
            <Text tag="h1" size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY} strong={true}>{header}</Text>
        </Header>
        <Content>{children}</Content>
        <Footer>
            {confirmText && <Button
                type="submit"
                buttonRef={buttonRef}
                color={danger ? Button.Colors.RED : Button.Colors.BRAND}
                onClick={() => {
                    onConfirm?.();
                    onClose?.();
                }}
            >
                {confirmText}
            </Button>}
            {cancelText && <Button
                type="button"
                look={Button.Looks.LINK}
                color={Button.Colors.PRIMARY}
                onClick={() => {
                    onCancel?.();
                    onClose?.();
                }}
            >
                {cancelText}
            </Button>}
        </Footer>
    </Root>;
}