import Webpack from "@modules/api/webpack";
import Patcher from "@modules/patcher";
import Button from "@ui/base/button";
import React from "@modules/react";
import Logger from "@common/logger";
import DiscordModules from "@modules/discordmodules";
import Strings from "@modules/strings";
import Builtin from "@structs/builtin";

const Dispatcher = DiscordModules.Dispatcher;

const ErrorDetails = ({componentStack}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [height, setHeight] = React.useState(0);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
        const updateHeight = () => {
            if (isExpanded) {
                const maxHeight = Math.min(0.6 * window.innerHeight, 534);
                setHeight(maxHeight);
            }
 else {
                setHeight(0);
            }
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => window.removeEventListener("resize", updateHeight);
    }, [isExpanded]);

    return (
        <div className="bd-error-container">
            <div className="bd-error-toggle-wrapper">
                <Button
                    className={`bd-error-toggle ${isExpanded ? "expanded" : ""}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? "Hide Error Details ▼" : "Show Error Details ▶"}
                </Button>
            </div>
            <div
                className="bd-error-content-wrapper"
                style={{height: `${height}px`, overflow: "hidden"}}
            >
                <div ref={contentRef} className="bd-error-content">
                    {componentStack}
                </div>
            </div>
        </div>
    );
};

export default class Recovery extends Builtin {
    static initialize() {
        this.patchErrorBoundry();
        this.parseModule = Webpack.getByKeys("defaultRules", "parse");
        this.routeModule = Webpack.getByStrings("transitionTo", {searchExports: true});
    }

    static attemptRecovery() {
        try {
            Dispatcher?.dispatch?.({
                type: "LAYER_POP_ALL"
            });
        }
        catch (error) {
            Logger.error("Failed to pop all layers:", error);
        }

        try {
            Dispatcher?.dispatch?.({
                type: "MODAL_POP_ALL"
            });
        }
        catch (error) {
            Logger.error("Failed to pop all modals:", error);
        }

        try {
            this?.routeModule?.("/channels/@me");
        }
        catch (error) {
            Logger.error("Failed to route to main channel:", error);
        }
    }

    static patchErrorBoundry() {
        const [mod] = Webpack.getWithKey(Webpack.Filters.byStrings(":this._handleSubmitReport,children:"));

        Patcher.after("Recovery", mod?.Z?.prototype, "render", (instance, args, retValue) => {
            const buttons = retValue?.props?.action?.props;

            if (!buttons) return;

            const errorStack = instance.state?.info?.componentStack;
            const parsedError = errorStack ? this.parseModule.parse(`\`\`\`${errorStack}\`\`\``) : null;

            buttons.children.push(
                <Button
                    className={`bd-button-recovery`}
                    onClick={() => {
                        this.attemptRecovery();
                        instance.setState({info: null, error: null});
                    }}
                >
                    {Strings.Collections.settings.developer.recover}
                </Button>,
                parsedError && <ErrorDetails componentStack={parsedError} />
            );
        });
    }
}