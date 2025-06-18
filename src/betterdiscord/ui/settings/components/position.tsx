import React, {useContext, useState} from "@modules/react";
import Text from "@ui/base/text";
import {none, SettingsContext} from "@ui/contexts";


const positions: Position[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right"
];

export type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export interface PositionProps {
    value: Position;
    onChange?(newValue: Position): void;
    disabled?: boolean;
}

const Position = ({value: initialValue, onChange, disabled}: PositionProps) => {
    const [internalValue, setValue] = useState(initialValue);
    const {value: contextValue, disabled: contextDisabled} = useContext(SettingsContext);

    const value = (contextValue !== none ? contextValue : internalValue) as Position;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;

    const handlePositionChange = (position: Position) => {
        if (isDisabled) return;
        onChange?.(position);
        setValue(position);
    };

    const getBoxClassName = (position: Position) => {
        return `bd-box${isDisabled ? "-disabled" : ""} ${position} ${value === position ? "selected" : ""}`;
    };

    return (
        <div className="position-wrapper">
            <div className={`bd-container${isDisabled ? "-disabled" : ""}`}>
                {positions.map((position) => (
                    <button
                        key={position}
                        className={getBoxClassName(position)}
                        onClick={() => handlePositionChange(position)}
                        role="radio"
                        aria-checked={value === position}
                        aria-label={`Select ${position} position`}
                        disabled={isDisabled}
                        tabIndex={isDisabled ? -1 : 0}
                    />
                ))}
            </div>

            <div className="bd-position-info">
                {value ? (
                    <>
                        <Text>Selected Position:</Text>
                        <Text>
                            {value.replace(/-/g, " ").toUpperCase()}
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