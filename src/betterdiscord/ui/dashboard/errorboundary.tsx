// import Button from "@ui/base/button";
import React from "react";
// import HeaderBar from "./header";
// import ErrorBoundary from "@ui/errorboundary";
// import {lucideToDiscordIcon} from "@utils/icon";
// import {CircleAlertIcon} from "lucide-react";

interface State {
    hasError: boolean;
}

class ErrorScreen extends React.PureComponent<React.PropsWithChildren, State> {
    state: State = {
        hasError: false
    };

    componentDidCatch(
        // error: Error, errorInfo: React.ErrorInfo
    ): void {
        this.setState({hasError: true});
    }

    // private recover() {
    //     this.setState({hasError: false});
    // }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bd-route bd-route-error-container">
                    {/* <ErrorBoundary fallback={<></>}>
                        <HeaderBar transparent className="bd-header-transparent">
                            <HeaderBar.Icon icon={lucideToDiscordIcon(CircleAlertIcon)} />
                        </HeaderBar>
                    </ErrorBoundary> */}

                    <div className="bd-route-error">
                        <div className="bd-route-error-image" />

                        <div className="bd-route-error-text">
                            <h2 className="bd-route-error-title">Well, this is awkward</h2>

                            <div className="bd-route-error-note">
                                <div>
                                    <p>Looks like BetterDiscord has crashed...</p>
                                </div>
                            </div>
                        </div>

                        {/* <div className="bd-route-error-actions">
                            <Button onClick={this.recover}>Recover</Button>
                            <Button onClick={() => location.reload()}>Reload</Button>
                        </div> */}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorScreen;