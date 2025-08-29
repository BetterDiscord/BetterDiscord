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
    cloudUpload,
    useStateFromStores,
    moment,
    hljs,
    snowflake,
    tooltip,
    lodash,
    cssVars,
    fetchUser,
    intl,
    flux,
    permissions,
    componentDispatch,
    formNotice,
    colorPicker,
    imageUtils
] = Webpack.getBulk(
    {filter: x => x._dispatch}, // flux dispatch
    {filter: x => x.parseTopic}, // parser
    {filter: Webpack.Filters.byStrings('bmQU//', '+DFxLS'), searchExports: true}, // text input
    {filter: Webpack.Filters.byStrings("Unsupported animation config: "), searchExports: true}, // popout
    {filter: Webpack.Filters.byKeys(["sendMessage", "editMessage"])}, // message actions
    {filter: Webpack.Filters.byStrings('renderNonInteractive()'), searchExports: true}, // clickable
    {filter: Webpack.Filters.byStrings("markerPositions"), searchExports: true}, // slider
    {filter: Webpack.Filters.byStrings('["size","title"'), searchExports: true}, // modal
    {filter: Webpack.Filters.byStrings("uploadFileToCloud"), searchExports: true}, // cloud uploader
    {filter: Webpack.Filters.byStrings('useStateFromStores'), searchExports: true}, // state hook
    {filter: x => x?.parseTwoDigitYear}, // moment
    {filter: x => x?.registerLanguage}, // highlight.js
    {filter: x => x.extractTimestamp}, // snowflake
    {
        filter: x => x.toString?.().includes('disabledText') &&
            x.toString?.().includes('tooltipNote'),
        searchExports: true
    }, // tooltip
    {
        filter: (x) => x?.forEachRight, searchExports: false // lodash
    },
    {filter: x => x?.BACKGROUND_PRIMARY, searchExports: false}, // css variables
    {filter: Webpack.Filters.byStrings('.USER('), searchExports: true}, // fetch user
    {filter: (x) => x?.intl}, // internationalization
    {filter: x => x?.connectStores}, // flux
    {filter: x => x?.ADD_REACTIONS, searchExports: true}, // permissions
    {filter: x => x._savedDispatches, searchExports: true}, // component dispatch
    {filter: Webpack.Filters.byStrings('HORIZONTAL_REVERSE', 'imageData'), searchExports: true}, // form notice
    {filter: Webpack.Filters.byStrings('Qp04hI'), searchExports: true}, // color picker
    {filter: m => m.getChannelIconURL} // image utils
);

const layerManager = {
    push: (comp: React.ComponentType, fallback: React.ComponentType) => {
        fluxDispatch.dispatch({type: 'LAYER_PUSH', component: comp, fallback});
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

const Utils = {
    moment,
    hljs,
    lodash,
    cssVars,
    intl: {intl: intl.intl, t: intl.t},
    useStateFromStores,
    fetchUser,
};

export const Discord = {
    fluxDispatch,
    flux,
    messageActions,
    permissions,
    componentDispatch,
    layerManager,
    snowflake,
    simpleMarkdownWrapper: parser,
    cloudUpload,
    imageUtils,
    modals: Webpack.getMangled(".modalKey?", {
        openModalLazy: Webpack.Filters.byStrings(".modalKey?"),
        openModal: Webpack.Filters.byStrings(",instant:"),
        closeModal: Webpack.Filters.byStrings(".onCloseCallback()"),
        closeAllModals: Webpack.Filters.byStrings(".getState();for")
    }),
    navigation: Webpack.getMangled("transitionTo - Transitioning to", {
        transitionTo: Webpack.Filters.byStrings("\"transitionTo - Transitioning to \""),
        replace: Webpack.Filters.byStrings("\"Replacing route with \""),
        goBack: Webpack.Filters.byStrings(".goBack()"),
        goForward: Webpack.Filters.byStrings(".goForward()"),
        transitionToGuild: Webpack.Filters.byStrings("\"transitionToGuild - Transitioning to \"")
    }),
    Utils
};

export const Common = Discord;
export const Components = DiscordComponents;