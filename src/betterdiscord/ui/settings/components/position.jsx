import React from "@modules/react";
import Text from "@ui/base/text";

const positions = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right"
];

const Position = ({value: initialValue, onChange, disabled}) => {
    const [value, setValue] = React.useState(initialValue);

    const handlePositionChange = (position) => {
        if (disabled) return;
        onChange?.(position);
        setValue(position);
    };

    const getBoxClassName = (position) => {
        return `bd-box${disabled ? "-disabled" : ""} ${position} ${value === position ? "selected" : ""}`;
    };

    return (
        <div className="position-wrapper">
            <div className={`bd-container${disabled ? "-disabled" : ""}`}>
                {positions.map((position) => (
                    <button
                        key={position}
                        className={getBoxClassName(position)}
                        onClick={() => handlePositionChange(position)}
                        role="radio"
                        aria-checked={value === position}
                        aria-label={`Select ${position} position`}
                        disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
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