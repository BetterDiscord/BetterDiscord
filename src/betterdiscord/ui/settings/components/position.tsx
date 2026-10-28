import React from "react";
import Text from "@ui/base/text";
import {useItemProps, type BaseSettingProps} from "./utils";


const positions: Position[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right"
];

export type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type PositionProps = BaseSettingProps<Position>;

const Position = (props: PositionProps) => {
    const {state, setState, disabled} = useItemProps(props);

    const getBoxClassName = (position: Position) => {
        return `bd-box${disabled ? "-disabled" : ""} ${position} ${state === position ? "selected" : ""}`;
    };

    return (
        <div className="position-wrapper">
            <div className={`bd-container${disabled ? "-disabled" : ""}`}>
                {positions.map((position) => (
                    <button
                        key={position}
                        className={getBoxClassName(position)}
                        onClick={() => setState(position)}
                        role="radio"
                        aria-checked={state === position}
                        aria-label={`Select ${position} position`}
                        disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                    />
                ))}
            </div>

            <div className="bd-position-info">
                {state ? (
                    <>
                        <Text>Selected Position:</Text>
                        <Text>
                            {state.replace(/-/g, " ").toUpperCase()}
                        </Text>
                    </>
                ) : (
                    <Text>Click a box to select position</Text>
                )}
            </div>
        </div>
    );
};

export default Position;