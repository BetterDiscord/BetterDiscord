import {React} from "modules";
import Root from "./root";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";

import Text from "../base/text";
import Button from "../base/button";
import CloseButton from "./close";

const {useRef, useEffect} = React;


export default function ConfirmationModal({transitionState, onClose, header, children, danger = false, onCancel = () => {}, onConfirm = () => {}, cancelText = "Cancel", confirmText = "Okay"}) {
    
    useEffect(() => {
        setTimeout(() => buttonRef?.current?.focus?.(), 0);
    }, []);

    const buttonRef = useRef(null);


    return <Root transitionState={transitionState} size={Root.Sizes.SMALL}>
        <Header><Text tag="h1" size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY} strong={true}>{header}</Text><CloseButton onClose={onClose} /></Header>
        <Content>{children}</Content>
        <Footer>
            {confirmText && <Button
                type="submit"
                buttonRef={buttonRef}
                color={danger ? Button.Colors.RED : Button.Colors.BRAND}
                onClick={() => {
                    onConfirm?.();
                    onClose();
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
                    onClose();
                }}
            >
                {cancelText}
            </Button>}
        </Footer>
    </Root>;
}