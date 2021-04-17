import Logger from "common/logger";
import {React, Strings, WebpackModules} from "modules";
import url from "url";
import util from "util";

const Text = WebpackModules.getByDisplayName("Text");

let reactInvariants;

function getInvariants() {
    return new Promise((resolve) => {
        fetch(
            "https://raw.githubusercontent.com/facebook/react/master/scripts/error-codes/codes.json"
        )
            .then((response) => response.json())
            .then((body) => {
                reactInvariants = body;
                resolve(reactInvariants);
            });
    });
}

function makeReactErrorString(newReactInvariants, error) {
    const reactUrl = url.parse(
        error.message.substring(
            error.message.indexOf("; visit ") + 8,
            error.message.indexOf(" for the full message")
        ),
        true
    );
    const invariant = reactUrl.query.invariant;
    const args = reactUrl.query["args[]"];

    return newReactInvariants
        ? `React Invariant Violation #${invariant}\n${util.format(
                newReactInvariants[invariant],
                ...args
          )}`
        : "";
}

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    componentDidCatch(error, info) {
        this.setState({hasError: true, error, info}, () => {
            this.props.onError?.(this.state);
        });
    }

    render() {
        if (this.state.hasError) {
            const Fallback = this.props.fallback ?? false;

            let reactErrorString;
            if (reactInvariants) {
                reactErrorString = makeReactErrorString(reactInvariants, this.state.error);
                if (!this.props.silent) {
                    Logger.log("ErrorBoundary", reactErrorString);
                }
            }
            else {
                getInvariants().then((newReactInvariants) => {
                    reactErrorString = makeReactErrorString(newReactInvariants, this.state.error);
                    this.setState({
                        reactErrorString,
                    });
                    if (!this.props.silent) {
                        Logger.log("ErrorBoundary", reactErrorString);
                    }
                });
            }

            if (Fallback) {
                return (
                    <ErrorBoundary
                        fallback={() => (
                            <ErrorBoundary
                                fallback={() => (
                                    <ErrorBoundary>
                                        {Strings.Addons.errorBoundaryErrorError}
                                    </ErrorBoundary>
                                )}
                            >
                                <Text>{Strings.Addons.errorBoundaryError}</Text>
                            </ErrorBoundary>
                        )}
                    >
                        <Fallback
                            {...this.state}
                            reactErrorString={reactErrorString ?? this.state.reactErrorString}
                        />
                    </ErrorBoundary>
                );
            }
            return null;
        }
        return this.props.children;
    }
}

const originalRender = ErrorBoundary.prototype.render;
Object.defineProperty(ErrorBoundary.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function () {
        Logger.warn(
            "ErrorBoundary",
            "Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins"
        );
    },
    get: () => originalRender,
});
