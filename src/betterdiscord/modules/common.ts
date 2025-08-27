import * as Webpack from "@webpack";

export function sleep(delay: number) {
    return new Promise<void>(done => setTimeout(() => done(), delay));
}

const [FluxDispatch, Parse, TextInput, Popout, MessageActions, Clickable, Slider, Modal, CloudUpload, useStateFromStores, moment, hljs, Snowflake, Tooltip, lodash, cssVars, fetchUser, Intl, Flux, permissions, ComponentDispatch, FormNotice, ColorPicker] = Webpack.getBulk(
    {filter: x => x._dispatch}, // flux
    {filter: x => x.parseTopic}, // parser
    {filter: Webpack.Filters.byStrings('bmQU//', '+DFxLS'), searchExports: true}, // textnput
    {filter: Webpack.Filters.byStrings("Unsupported animation config: "), searchExports: true}, //popout
    {filter: Webpack.Filters.byKeys(["sendMessage", "editMessage"])}, // actions
    {filter: Webpack.Filters.byStrings('renderNonInteractive()'), searchExports: true}, // clickable
    {filter: Webpack.Filters.byStrings("markerPositions"), searchExports: true}, // slider
    {filter: Webpack.Filters.byStrings('["size","title"'), searchExports: true}, // modal
    {filter: Webpack.Filters.byStrings("uploadFileToCloud"), searchExports: true}, // cloud uploader
    {filter: Webpack.Filters.byStrings('useStateFromStores'), searchExports: true}, // states
    {filter: x => x?.parseTwoDigitYear}, // moment
    {filter: x => x?.registerLanguage}, // hljs
    {filter: x => x.extractTimestamp}, // snowflake
    {
        filter: x => x.toString?.().includes('disabledText') &&
            x.toString?.().includes('tooltipNote'),
        searchExports: true
    }, // tooltip
    {
        filter: (x) => x?.forEachRight, searchExports: false // lodash
    },
    {filter: x => x?.BACKGROUND_PRIMARY, searchExports: false}, // css vars var(--interactive-normal)
    {filter: Webpack.Filters.byStrings('.USER('), searchExports: true}, // fetch user
    {filter: (x) => x?.intl}, // STRINGSSSS
    {filter: x => x?.connectStores}, // flux
    {filter: x => x?.ADD_REACTIONS, searchExports: true}, // permissions
    {filter: x => x._savedDispatches, searchExports: true}, // component dispatch
    {filter: Webpack.Filters.byStrings('HORIZONTAL_REVERSE', 'imageData'), searchExports: true},
    {filter: Webpack.Filters.byStrings('Qp04hI'), searchExports: true}
);

const LayerManager = {
    push: (comp: React.ComponentType, fallback: React.ComponentType) => {
        FluxDispatch.dispatch({type: 'LAYER_PUSH', component: comp, fallback});
    },
    pop: () => {
        FluxDispatch.dispatch({type: "LAYER_POP"});
    },
    clear: () => {
        FluxDispatch.dispatch({type: "LAYER_POP_ALL"});
    }
};

// react components
const Components = {
    TextInput,
    Popout,
    Clickable,
    Slider,
    Modal,
    Tooltip,
    FormNotice,
    ColorPicker
};

// flux and stuff
const Common = {
    FluxDispatch,
    Flux,
    moment,
    CloudUpload,
    hljs,
    Parse,
    useStateFromStores,
    MessageActions,
    cssVars,
    lodash,
    fetchUser,
    Snowflake,
    permissions,
    LayerManager,
    ComponentDispatch,
    intl: {intl: Intl.intl, t: Intl.t},
    Modals: Webpack.getMangled(".modalKey?", {
        openModalLazy: Webpack.Filters.byStrings(".modalKey?"),
        openModal: Webpack.Filters.byStrings(",instant:"),
        closeModal: Webpack.Filters.byStrings(".onCloseCallback()"),
        closeAllModals: Webpack.Filters.byStrings(".getState();for")
    }),
    Navigation: Webpack.getMangled("transitionTo - Transitioning to", {
        transitionTo: Webpack.Filters.byStrings("\"transitionTo - Transitioning to \""),
        replace: Webpack.Filters.byStrings("\"Replacing route with \""),
        goBack: Webpack.Filters.byStrings(".goBack()"),
        goForward: Webpack.Filters.byStrings(".goForward()"),
        transitionToGuild: Webpack.Filters.byStrings("\"transitionToGuild - Transitioning to \"")
    }),
};

export {Common, Components};