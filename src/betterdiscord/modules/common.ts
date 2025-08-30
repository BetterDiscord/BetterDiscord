import * as Webpack from "@webpack";

const [
    fluxDispatch,
    parser,
    textInput,
    popout,
    messageActions,
    clickable,
    slider,
    modal,
    CloudUpload,
    useStateFromStores,
    moment,
    hljs,
    snowflake,
    tooltip,
    lodash,
    cssVars,
    intl,
    flux,
    permissions,
    componentDispatch,
    formNotice,
    colorPicker,
    imageUtils,
    ReactSpring,
    mappedFetchUtils,
    modals,
    navigation
] = Webpack.getBulk(
    {filter: x => x._dispatch}, // flux dispatch
    {filter: x => x.parseTopic}, // parser
    {filter: Webpack.Filters.byStrings("bmQU//", "+DFxLS"), searchExports: true}, // text input
    {filter: Webpack.Filters.byStrings("Unsupported animation config: "), searchExports: true}, // popout
    {filter: Webpack.Filters.byKeys(["sendMessage", "editMessage"])}, // message actions
    {filter: Webpack.Filters.byStrings("renderNonInteractive()"), searchExports: true}, // clickable
    {filter: Webpack.Filters.byStrings("markerPositions"), searchExports: true}, // slider
    {filter: Webpack.Filters.byStrings("[\"size\",\"title\""), searchExports: true}, // modal
    {filter: Webpack.Filters.byStrings("uploadFileToCloud"), searchExports: true}, // cloud uploader
    {filter: Webpack.Filters.byStrings("useStateFromStores"), searchExports: true}, // state hook
    {filter: x => x?.parseTwoDigitYear}, // moment
    {filter: x => x?.registerLanguage}, // highlight.js
    {filter: x => x.extractTimestamp}, // snowflake
    {
        filter: x => x.toString?.().includes("disabledText")
            && x.toString?.().includes("tooltipNote"),
        searchExports: true
    }, // tooltip
    {
        filter: (x) => x?.forEachRight, searchExports: false // lodash
    },
    {filter: x => x?.BACKGROUND_PRIMARY, searchExports: false}, // css variables
    {filter: (x) => x?.intl}, // internationalization
    {filter: x => x?.connectStores}, // flux
    {filter: x => x?.ADD_REACTIONS, searchExports: true}, // permissions
    {filter: x => x._savedDispatches, searchExports: true}, // component dispatch
    {filter: Webpack.Filters.byStrings("HORIZONTAL_REVERSE", "imageData"), searchExports: true}, // form notice
    {filter: Webpack.Filters.byStrings("Qp04hI"), searchExports: true}, // color picker
    {filter: m => m.getChannelIconURL}, // image utils
    {filter: x => x.a && x.animated}, // react spring
    {
        filter: Webpack.Filters.bySource("type:\"USER_PROFILE_FETCH_START\""),
        map: {
            fetchProfile: Webpack.Filters.byStrings("USER_PROFILE_FETCH_START"),
            getUser: Webpack.Filters.byStrings("USER_UPDATE", "Promise.resolve")
        }
    },
    {
        filter: Webpack.Filters.bySource(".modalKey?"),
        map: {
            openModalLazy: Webpack.Filters.byStrings(".modalKey?"),
            openModal: Webpack.Filters.byStrings(",instant:"),
            closeModal: Webpack.Filters.byStrings(".onCloseCallback()"),
            closeAllModals: Webpack.Filters.byStrings(".getState();for")
        }
    },
    {
        filter: Webpack.Filters.bySource("transitionTo - Transitioning to"),
        map: {
            transitionTo: Webpack.Filters.byStrings("\"transitionTo - Transitioning to \""),
            replace: Webpack.Filters.byStrings("\"Replacing route with \""),
            goBack: Webpack.Filters.byStrings(".goBack()"),
            goForward: Webpack.Filters.byStrings(".goForward()"),
            transitionToGuild: Webpack.Filters.byStrings("\"transitionToGuild - Transitioning to \"")
        }
    }
);

const layerManager = {
    push: (comp: React.ComponentType, fallback: React.ComponentType) => {
        fluxDispatch.dispatch({type: "LAYER_PUSH", component: comp, fallback});
    },
    pop: () => {
        fluxDispatch.dispatch({type: "LAYER_POP"});
    },
    clear: () => {
        fluxDispatch.dispatch({type: "LAYER_POP_ALL"});
    }
};

export const DiscordComponents = {
    TextInput: textInput,
    Popout: popout,
    Clickable: clickable,
    Slider: slider,
    Modal: modal,
    Tooltip: tooltip,
    FormNotice: formNotice,
    ColorPicker: colorPicker
};

export const Discord = {
    fluxDispatch,
    flux,
    messageActions,
    permissions,
    componentDispatch,
    layerManager,
    snowflake,
    fetchUtils: mappedFetchUtils,
    simpleMarkdownWrapper: parser,
    CloudUpload,
    imageUtils,
    modals: modals,
    navigation: navigation,
    moment,
    hljs,
    lodash,
    cssVars,
    intl: {intl: intl.intl, t: intl.t},
    useStateFromStores,
    // fetchUser,
    ReactSpring
};

Object.freeze(Discord);
Object.freeze(DiscordComponents);
export const Common = Discord;
export const Components = DiscordComponents;