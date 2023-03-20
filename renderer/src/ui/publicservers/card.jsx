import {React, Strings} from "modules";

const {useState, useCallback, useMemo} = React;


const badge = <div className="flowerStarContainer-1QeD-L verified-1Jv_7P background-3Da2vZ rowIcon-2tDEcE" style={{width: "16px", height: "16px"}}>
                    <svg aria-label="Verified &amp; Partnered" className="flowerStar-2tNFCR" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2">
                        <path fill="currentColor" fillRule="evenodd" d="m16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z"></path>
                    </svg>
                    <div className="childContainer-U_a6Yh">
                        <svg className="icon-3BYlXK" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2">
                            <path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </div>;


export default function ServerCard({server, joined, join, navigateTo, defaultAvatar}) {
    const [isError, setError] = useState(false);
    const handleError = useCallback(() => {
        setError(true);
    }, []);

    const [hasJoined, setJoined] = useState(joined);
    const doJoin = useCallback(async () => {
        if (hasJoined) return navigateTo(server.identifier);
        setJoined("joining");
        const didJoin = await join(server.identifier, server.nativeJoin);
        setJoined(didJoin);
    }, [hasJoined, join, navigateTo, server.identifier, server.nativeJoin]);

    const defaultIcon = useMemo(() => defaultAvatar(), [defaultAvatar]);
    const currentIcon = !server.iconUrl || isError ? defaultIcon : server.iconUrl;

    const addedDate = new Date(server.insertDate * 1000); // Convert from unix timestamp
    const buttonText = typeof(hasJoined) == "string" ? `${Strings.PublicServers.joining}...` : hasJoined ? Strings.PublicServers.joined : Strings.PublicServers.join;

    return <div className="bd-server-card" role="button" tabIndex="0" onClick={doJoin}>
                <div className="bd-server-header">
                        <div className="bd-server-splash-container"><img src={currentIcon} onError={handleError} className="bd-server-splash" /></div>
                        <img src={currentIcon} onError={handleError} className="bd-server-icon" />
                </div>
                <div className="bd-server-info">
                    <div className="bd-server-title">
                        {server.pinned && badge}
                        <div className="bd-server-name">{server.name}</div>
                        {hasJoined && <div className="bd-server-tag">{buttonText}</div>}
                    </div>
                    <div className="bd-server-description">{server.description}</div>
                    <div className="bd-server-footer">
                        <div className="bd-server-count">
                            <div className="bd-server-count-dot"></div>
                            <div className="bd-server-count-text">{server.members.toLocaleString()} Members</div>
                        </div>
                        <div className="bd-server-count">
                            <div className="bd-server-count-dot"></div>
                            <div className="bd-server-count-text">Added {addedDate.toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>;
}