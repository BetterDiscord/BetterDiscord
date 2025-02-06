/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import Utilities from "./utilities";
import {Filters, getByKeys, getByStrings, getModule} from "./webpack";


const DiscordModules = Utilities.memoizeObject({
    get React() {return getByKeys([ "createElement", "cloneElement" ]);},
    get ReactDOM() {return getByKeys([ "render", "findDOMNode" ]);},
    get ChannelActions() {return getByKeys([ "selectChannel" ]);},
    get LocaleStore() {return getByKeys([ "locale", "initialize" ]);},
    get UserStore() {return getByKeys([ "getCurrentUser", "getUser" ]);},
    get InviteActions() {return getByKeys([ "createInvite" ]);},
    get SimpleMarkdown() {return getByKeys([ "parseBlock", "parseInline", "defaultOutput" ]);},
    get Strings() {return getByKeys([ "Messages" ]).Messages;},
    get Dispatcher() {return getByKeys([ "dispatch", "subscribe", "register" ]);},
    get Tooltip() {
        // Make fallback component just pass children, so it can at least render that.
        const fallback = props => props.children?.({}) ?? null;

        return getModule(Filters.byPrototypeKeys(["renderTooltip"]), {searchExports: true}) ?? fallback;
    },
    get promptToUpload() {return getByStrings([ "getUploadCount", "instantBatchUpload" ], {searchExports: true});},
    get RemoteModule() {return getByKeys([ "setBadge" ]);},
    get UserAgent() {return getByKeys([ "os", "layout" ]);},
    get MessageUtils() {return getByKeys([ "sendMessage" ]);},
});

export default DiscordModules;