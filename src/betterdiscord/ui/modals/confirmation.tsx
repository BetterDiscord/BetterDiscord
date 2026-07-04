import React from "react";
import {t} from "@common/i18n";

import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Text from "../base/text";
import Button from "../base/button";

const {useRef, useEffect, useLayoutEffect} = React;

export interface ConfirmationModalOptions {
    transitionState?: number;
    /** A callback to run when exiting the modal */
    onClose?(): void;
    /** A callback to run when clicking the submit button */
    onConfirm?(): void;
    /** A callback to run when clicking the cancel button */
    onCancel?(): void;
    /** Called immediately on render */
    onCloseCallback?(): void;
    /** The size of the modal */
    size?: typeof Root.Sizes[keyof typeof Root.Sizes];
    /** Classes to apply to the modal */
    className?: string;
    /** Text to show at the top of the modal */
    header?: string;
    /** Text for the confirmation/submit button */
    confirmText?: string;
    /** Text for the cancel button */
    cancelText?: string | null;
    /** Whether the main button should be red or not */
    danger?: boolean;
    /** A unique key for the modal */
    key?: string | number;
    /** The contents of the modal */
    children?: React.ReactNode;
};

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