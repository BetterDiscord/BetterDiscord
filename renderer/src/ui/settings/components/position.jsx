import React from "@modules/react";
import Settings from "@modules/settingsmanager";

const Position = ({value, onChange, disabled, condition}) => {
    const positions = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right"
    ];

    const settingValue = condition
        ? Settings.get(condition.collection, condition.category, condition.id)
        : null;
    const isDisabled = disabled || (condition && settingValue === false);

    const handlePositionChange = (position) => {
        if (isDisabled) return;
        onChange?.(position);
    };

    const getBoxClassName = (position) => {
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
                        <h3 className="bd-text">Selected Position:</h3>
                        <p className="bd-p">
                            {value.replace(/-/g, " ").toUpperCase()}
                        </p>
                    </>
                ) : (
                    <h3 className="bd-text">Click a box to select position</h3>
                )}
            </div>
        </div>
    );
};

export default Position;