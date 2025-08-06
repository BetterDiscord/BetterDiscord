import React from "@modules/react";
import Events from "@modules/emitter";

import Backdrop from "./backdrop";
import {getWithKey} from "@webpack";
import type {ReactNode} from "react";

const {Fragment, useState, useCallback, useEffect} = React;


const [Transitions, TransitionKey] = getWithKey(m => m?.defaultProps?.transitionAppear);
const TransitionGroup = Transitions && TransitionKey ? Transitions[TransitionKey] : function () {};

class ModalLayer extends React.Component<{onClose(): void; render(p: any): ReactNode;}, {transitionState: number | null;}> {
    constructor(props: {onClose(): void; render(p: any): ReactNode;}) {
        super(props);
        this.state = {transitionState: null};
    }

    componentWillEnter(finish: () => void) {
        this.setState({transitionState: 0});
        setTimeout(() => {
            this.setState({transitionState: 1});
            finish();
        }, 300);

    }
    componentWillLeave(finish: () => void) {
        this.setState({transitionState: 2});
        setTimeout(() => {
            this.setState({transitionState: 3});
            finish();
        }, 300);
    }

    render() {
        return React.createElement("div", {className: "bd-modal-layer"}, this.props.render({
            transitionState: this.state.transitionState,
            onClose: this.props.onClose
        }));
    }
}

// ENTERING 0
// ENTERED 1
// EXITING 2
// EXITED 3
// HIDDEN 4

let modalKey = 0;
export const generateKey = (key?: string | number) => key ? `${key}-${modalKey++}` : modalKey++;

export default function ModalStack() {
    const [modals, setModals] = useState<Array<{render(props?: unknown): ReactNode; modalKey: string; onClose?(): void;}>>([]);

    const addModal = useCallback((render: (props?: unknown) => ReactNode, props: any = {}) => {
        setModals(m => [...m, {...props, render}]);
    }, []);
    const removeModal = useCallback((key: string) => {
        setModals(mods => mods.filter(m => {
            if (m.modalKey === key && m.onClose) m.onClose();
            return m.modalKey !== key;
        }));
    }, []);

    useEffect(() => {
        Events.on("open-modal", addModal);
        return () => {
            Events.off("open-modal", addModal);
        };
    }, [addModal]);

    return <TransitionGroup component={Fragment}>
        <Backdrop isVisible={!!modals.length} onClick={() => removeModal(modals[modals.length - 1].modalKey)} />
        {!!modals.length && <ModalLayer key={modals[modals.length - 1].modalKey} {...modals[modals.length - 1]} onClose={() => removeModal(modals[modals.length - 1].modalKey)} />}
    </TransitionGroup>;
}