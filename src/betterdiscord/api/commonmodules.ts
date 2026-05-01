import {Filters, getBulkKeyed} from "@webpack";

interface Helpers {
    FluxDispatch: any;
    SimpleMarkdownWrapper: any;
    MessageActions: any;
    CloudUpload: any;
    Moment: any;
    // Hljs: any;
    Snowflake: any;
    Lodash: any;
    CssVars: any;
    Intl: any;
    Flux: any;
    Permissions: any;
    ComponentDispatch: any;
    ImageUtils: any;
    ReactSpring: any;
    Fetching: {
        fetchProfile: any;
        getUser: any;
    };
    ModalActions: {
        openModalLazy: any;
        openModal: any;
        closeModal: any;
        closeAllModals: any;
        updateModal: any;
    };
    Navigation: {
        transitionTo: any;
        replace: any;
        goBack: any;
        goForward: any;
        transitionToGuild: any;
    };
    Color: any;
    Electron: any;
}

interface Components {
    Popout: any;
    Clickable: any;
    Slider: any;
    Modal: any;
    FormNotice: any;
    LoadingPopout: any;
    Progress: any;
    Spinner: any;
    TextArea: any;
    CopyInput: any;
    SearchableSelect: any;
    Switch: any;
    FormSwitch: any;
    Text: any;
    Flex: any;
    Scroller: any;
    ProgressCircle: any;
    KeyCombo: any;
    Avatar: any;
    Slides: any;
    AnimatedAvatar: any;
    Button: any;
    CalendarPicker: any;
}

interface WebpackModules {
    Helpers: Helpers;
    Components: Components;
}

interface RawModules {
    ComponentDispatchModule: any;
    FetchingModule: {
        fetchProfile: any;
        getUser: any;
    };
    ModalActionsModule: {
        openModalLazy: any;
        openModal: any;
        closeModal: any;
        closeAllModals: any;
        updateModal: any;
    };
    NavigationModule: {
        transitionTo: any;
        replace: any;
        goBack: any;
        goForward: any;
        transitionToGuild: any;
    };
}

interface All extends Components, Omit<Helpers, "ComponentDispatch" | "Fetching" | "ModalActions" | "Navigation">, RawModules {}

const {SearchableSelect, AnimatedAvatar, FluxDispatch, SimpleMarkdownWrapper, Popout, MessageActions, Clickable, Slider, Modal, CloudUpload, Moment, Snowflake, Lodash, CssVars, Intl, Flux, Permissions, ComponentDispatchModule, FormNotice,
    ImageUtils, ReactSpring, FetchingModule, ModalActionsModule, NavigationModule, LoadingPopout, Progress, Spinner, TextArea, CopyInput, Switch, FormSwitch, Text, Flex, Scroller, ProgressCircle, KeyCombo, Avatar, Slides, Button, CalendarPicker, Color, Electron
} = getBulkKeyed<All>(
    {
// Slider
        Slider: {filter: Filters.byStrings("this.scaleValue("), searchExports: true, cacheId: "betterdiscord-Slider"},
// SearchableSelect
        SearchableSelect: {filter: Filters.byStrings("SearchableSelect"), searchExports: true, cacheId: "betterdiscord-SearchableSelect"},
// AnimatedAvatar
        AnimatedAvatar: {filter: x => String(x.type).includes("fromIsMobile"), searchExports: true, cacheId: "betterdiscord-AnimatedAvatar"},
// FluxDispatch
        FluxDispatch: {filter: Filters.byKeys(["_dispatch"]), searchExports: true, cacheId: "betterdiscord-FluxDispatch"},
// SimpleMarkdownWrapper
        SimpleMarkdownWrapper: {filter: Filters.byKeys(["defaultReactOutput"]), cacheId: "betterdiscord-SimpleMarkdownWrapper"},
// Popout
        Popout: {filter: Filters.byStrings("Unsupported animation config: "), searchExports: true, cacheId: "betterdiscord-Popout"},
// MessageActions
        MessageActions: {filter: Filters.byKeys(["editMessage"]), cacheId: "betterdiscord-MessageActions"},
// Clickable
        Clickable: {filter: Filters.byStrings("renderNonInteractive()"), searchExports: true, cacheId: "betterdiscord-Clickable"},
// Modal
        Modal: {filter: Filters.byStrings("actionBarInputLayout"), searchExports: true, cacheId: "betterdiscord-Modal"},
// CloudUpload
        CloudUpload: {filter: Filters.byStrings("uploadFileToCloud"), searchExports: true, cacheId: "betterdiscord-CloudUpload"},
// Moment
        Moment: {filter: Filters.byKeys(["parseTwoDigitYear"]), cacheId: "betterdiscord-Moment"},
// Snowflake
        Snowflake: {filter: Filters.byKeys(["extractTimestamp"]), cacheId: "betterdiscord-Snowflake"},
// Lodash
        Lodash: {filter: Filters.byKeys(["forEachRight"]), cacheId: "betterdiscord-Lodash"},
// CssVars
        CssVars: {filter: Filters.byKeys(["unsafe_rawColors"]), cacheId: "betterdiscord-CssVars"},
// Intl
        Intl: {filter: Filters.byKeys(["intl"]), cacheId: "betterdiscord-Intl"},
// Flux
        Flux: {filter: Filters.byKeys(["connectStores"]), cacheId: "betterdiscord-Flux"},
// Permissions
        Permissions: {filter: Filters.byKeys(["ADD_REACTIONS"]), searchExports: true, cacheId: "betterdiscord-Permissions"},
// ComponentDispatch
        ComponentDispatchModule: {
            filter: Filters.bySource("ComponentDispatchUtils"),
            map: {
                ComponentDispatch: Filters.byKeys(["_savedDispatches"])
            },
            cacheId: "betterdiscord-ComponentDispatchModule"
        },
// FormNotice
        FormNotice: {filter: Filters.byStrings("HORIZONTAL_REVERSE", "imageData"), searchExports: true, cacheId: "betterdiscord-FormNotice"},
// ImageUtils
        ImageUtils: {filter: Filters.byKeys(["getChannelIconURL"]), cacheId: "betterdiscord-ImageUtils"},
// ReactSpring
        ReactSpring: {filter: Filters.byKeys(["a", "animated"]), cacheId: "betterdiscord-ReactSpring"},
// Fetching
        FetchingModule: {
            filter: Filters.bySource("type:\"USER_PROFILE_FETCH_START\""),
            map: {
                getUser: Filters.byStrings(".USER("),
                fetchProfile: Filters.byStrings(".USER_PROFILE(")
            },
            cacheId: "betterdiscord-FetchingModule"
        },
// ModalActions
        ModalActionsModule: {
            filter: Filters.bySource(".modalKey?"),
            map: {
                openModalLazy: Filters.byStrings(".modalKey?"),
                openModal: Filters.byStrings(",instant:"),
                closeModal: Filters.byStrings(".onCloseCallback()"),
                closeAllModals: Filters.byStrings(".getState();for"),
                updateModal: Filters.byStrings("arguments.length>4&&void 0")
            },
            cacheId: "betterdiscord-ModalActionsModule"
        },
// Navigation
        NavigationModule: {
            filter: Filters.bySource("Transitioning to"),
            map: {
                transitionTo: Filters.byStrings("transitionTo - Transitioning to"),
                replace: Filters.byStrings("Replacing route"),
                goBack: Filters.byStrings(".goBack()"),
                goForward: Filters.byStrings(".goForward()"),
                transitionToGuild: Filters.byStrings("transitionToGuild")
            },
            cacheId: "betterdiscord-NavigationModule"
        },
// LoadingPopout
        LoadingPopout: {
            filter: Filters.byRegex(/className:.{1}\..{1},children:\(0,.{1}\.jsx\)\(.{1}\..{1,3},{type:.{1}\..{3}\.SPINNING_CIRCLE\}\)/),
            searchExports: true,
            cacheId: "betterdiscord-LoadingPopout"
        },
// Progress
        Progress: {filter: Filters.byStrings("percent", "foregroundGradientColor"), searchExports: true, cacheId: "betterdiscord-Progress"},
// Spinner
        Spinner: {filter: Filters.byStrings("=\"wanderingCubes\""), searchExports: true, cacheId: "betterdiscord-Spinner"},
// TextArea
        TextArea: {filter: Filters.byStrings("getPaddingRight(){let"), searchExports: true, cacheId: "betterdiscord-TextArea"},
// CopyInput
        CopyInput: {filter: Filters.byStrings("select(){this"), searchExports: true, cacheId: "betterdiscord-CopyInput"},
// Switch
        Switch: {filter: Filters.byStrings("xMinYMid meet"), searchExports: true, cacheId: "betterdiscord-Switch"},
// FormSwitch
        FormSwitch: {filter: Filters.byStrings("mana-toggle-inputs", "switchIconsEnabled:"), searchExports: true, cacheId: "betterdiscord-FormSwitch"},
// Text
        Text: {filter: Filters.byStrings("data-excessive-heading-level"), searchExports: true, cacheId: "betterdiscord-Text"},
// Flex
        Flex: {filter: Filters.byKeys(["Justify"]), searchExports: true, cacheId: "betterdiscord-Flex"},
// Scroller
        Scroller: {filter: Filters.byStrings("scrollbarType", "scrollerRef"), searchExports: true, cacheId: "betterdiscord-Scroller"},
// ProgressCircle
        ProgressCircle: {filter: Filters.byStrings("renderCircle(){let{strokeSize"), searchExports: true, cacheId: "betterdiscord-ProgressCircle"},
// KeyCombo
        KeyCombo: {filter: Filters.byStrings("{let{shortcut:"), searchExports: true, cacheId: "betterdiscord-KeyCombo"},
// Avatar
        Avatar: {filter: Filters.byStrings("typingIndicatorRef", "statusBackdropColor"), searchExports: true, cacheId: "betterdiscord-Avatar"},
// Slides
        Slides: {filter: Filters.byStrings("contentDisplay"), searchExports: true, cacheId: "betterdiscord-Slides"},
// Button
        Button: {filter: Filters.byStrings("pfChQ"), searchExports: true, cacheId: "betterdiscord-Button"},
// CalendarPicker
        CalendarPicker: {filter: Filters.byStrings("react-datepicker__day[tabindex=\"0\"]"), searchExports: true, cacheId: "betterdiscord-CalendarPicker"},
// Color
        Color: {filter: Filters.byKeys(["Color"]), searchExports: true, cacheId: "betterdiscord-Color"},
// Electron
        Electron: {filter: Filters.byKeys(["setBadge"]), cacheId: "betterdiscord-Electron"}
    }
);

const ComponentDispatch = ComponentDispatchModule?.ComponentDispatch;
const Fetching = {
    fetchProfile: FetchingModule?.fetchProfile,
    getUser: FetchingModule?.getUser
};

const ModalActions = {
    openModalLazy: ModalActionsModule?.openModalLazy,
    openModal: ModalActionsModule?.openModal,
    closeModal: ModalActionsModule?.closeModal,
    closeAllModals: ModalActionsModule?.closeAllModals,
    updateModal: ModalActionsModule?.updateModal
};

const Navigation = {
    transitionTo: NavigationModule?.transitionTo,
    replace: NavigationModule?.replace,
    goBack: NavigationModule?.goBack,
    goForward: NavigationModule?.goForward,
    transitionToGuild: NavigationModule?.transitionToGuild
};

const modules: WebpackModules = {
    Helpers: {
        FluxDispatch,
        SimpleMarkdownWrapper,
        MessageActions,
        CloudUpload,
        Moment,
        Snowflake,
        Lodash,
        CssVars,
        Intl,
        Flux,
        Permissions,
        ComponentDispatch,
        ImageUtils,
        ReactSpring,
        Fetching,
        ModalActions,
        Navigation,
        Color,
        Electron
    },
    Components: {
        Popout,
        Clickable,
        Slider,
        Modal,
        FormNotice,
        LoadingPopout,
        Progress,
        Spinner,
        TextArea,
        CopyInput,
        SearchableSelect,
        Switch,
        FormSwitch,
        Text,
        Flex,
        Scroller,
        ProgressCircle,
        KeyCombo,
        Avatar,
        Slides,
        AnimatedAvatar,
        Button,
        CalendarPicker
    }
};

export default modules;