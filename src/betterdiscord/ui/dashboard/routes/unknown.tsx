import React from "react";
import type {RouteComponentProps} from "react-router";
import HeaderBar from "../header";
import {Logo} from "@ui/logo";
import Button from "@ui/base/button";
import DiscordModules from "@modules/discordmodules";

function Unknown(props: RouteComponentProps) {
    return (
        <div className="bd-route">
            <HeaderBar>
                <HeaderBar.Icon icon={Logo.Discord} />
                <HeaderBar.Title>Unknown Page</HeaderBar.Title>
            </HeaderBar>
            <div className="bd-route-body">
                <div style={{whiteSpace: "pre"}}>URL: {props.match.url}</div>
                <div style={{whiteSpace: "pre"}}>Matched URL: {props.match.path}</div>
                <div style={{whiteSpace: "pre"}}>exact: {props.match.isExact.toString()}</div>

                <div style={{whiteSpace: "pre"}}>Params {JSON.stringify(props.match.params, null, "\t")}</div>

                <div>
                    {props.history?.goBack && (
                        <Button onClick={() => props.history.goBack()}>
                            Go Back
                        </Button>
                    )}
                    <Button onClick={() => DiscordModules.transitionTo("/betterdiscord")}>
                        Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Unknown;