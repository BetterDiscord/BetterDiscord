import {Filters, getBulk} from "@webpack";

const bulkModules = getBulk(
    // FluxDispatch
    {filter: Filters.byKeys(["_dispatch"]), searchExports: true},
    // Parser
    {filter: Filters.byKeys(["parseTopic"])},
    // Popout
    {filter: Filters.byStrings("Unsupported animation config: "), searchExports: true},
    // MessageActions
    {filter: Filters.byKeys(["editMessage"])},
    // Clickable
    {filter: Filters.byStrings("renderNonInteractive()"), searchExports: true},
    // Slider
    {filter: Filters.byStrings("markerPositions"), searchExports: true},
    // Modal
    {filter: Filters.byStrings("actionBarInputLayout"), searchExports: true},
    // CloudUpload
    {filter: Filters.byStrings("uploadFileToCloud"), searchExports: true},
    // Moment
    {filter: Filters.byKeys(["parseTwoDigitYear"])},
    // Hljs
    {filter: Filters.byKeys(["registerLanguage"])},
    // Snowflake
    {filter: Filters.byKeys(["extractTimestamp"])},
    // Lodash
    {filter: Filters.byKeys(["forEachRight"])},
    // CssVars
    {filter: Filters.byKeys(["unsafe_rawColors"])},
    // Intl
    {filter: Filters.byKeys(["intl"])},
    // Flux
    {filter: Filters.byKeys(["connectStores"])},
    // Permissions
    {filter: Filters.byKeys(["ADD_REACTIONS"]), searchExports: true},
    // ComponentDispatch
    {
        filter: Filters.bySource("ComponentDispatchUtils"),
        map: {
            ComponentDispatch: Filters.byKeys(["_savedDispatches"])
        }
    },
    // FormNotice
    {filter: Filters.byStrings("HORIZONTAL_REVERSE", "imageData"), searchExports: true},
    // ImageUtils
    {filter: Filters.byKeys(["getChannelIconURL"])},
    // ReactSpring
    {filter: Filters.byKeys(["a", "animated"])},
    // Fetching
    {
        filter: Filters.bySource("type:\"USER_PROFILE_FETCH_START\""),
        map: {
            fetchProfile: Filters.byStrings("USER_PROFILE_FETCH_START"),
            getUser: Filters.byStrings("USER_UPDATE")
        }
    },
    // ModalActions
    {
        filter: Filters.bySource(".modalKey?"),
        map: {
            openModalLazy: Filters.byStrings(".modalKey?"),
            openModal: Filters.byStrings(",instant:"),
            closeModal: Filters.byStrings(".onCloseCallback()"),
            closeAllModals: Filters.byStrings(".getState();for"),
            updateModal: Filters.byStrings("arguments.length>4&&void 0")
        }
    },
    // Navigation
    {
        filter: Filters.bySource("Transitioning to"),
        map: {
            transitionTo: Filters.byStrings("transitionTo - Transitioning to"),
            replace: Filters.byStrings("Replacing route"),
            goBack: Filters.byStrings(".goBack()"),
            goForward: Filters.byStrings(".goForward()"),
            transitionToGuild: Filters.byStrings("transitionToGuild")
        }
    },
    // LoadingPopout
    {
        filter: Filters.byRegex(/className:.{1}\..{1},children:\(0,.{1}\.jsx\)\(.{1}\..{1,3},{type:.{1}\..{3}\.SPINNING_CIRCLE\}\)/),
        searchExports: true
    },
    // Progress
    {filter: Filters.byStrings("percent", "foregroundGradientColor"), searchExports: true},
    // Spinner
    {filter: Filters.byStrings("=\"wanderingCubes\""), searchExports: true},
    // TextArea
    {filter: Filters.byStrings("getPaddingRight(){let"), searchExports: true},
    // CopyInput
    {filter: Filters.byStrings("select(){this"), searchExports: true},
    // SearchableSelect
    {filter: Filters.byStrings("SearchableSelect"), searchExports: true},
    // Switch
    {filter: Filters.byStrings("xMinYMid meet"), searchExports: true},
    // FormSwitch
    {filter: Filters.byStrings("mana-toggle-inputs", "switchIconsEnabled:"), searchExports: true},
    // Text
    {filter: Filters.byStrings("data-excessive-heading-level"), searchExports: true},
    // Flex
    {filter: Filters.byKeys(["Justify"]), searchExports: true},
    // Scroller
    {filter: Filters.byStrings("scrollbarType", "scrollerRef"), searchExports: true},
    // ProgressCircle
    {filter: Filters.byStrings("renderCircle(){let{strokeSize"), searchExports: true},
    // KeyCombo
    {filter: Filters.byStrings("{let{shortcut:"), searchExports: true},
    // Avatar
    {filter: Filters.byStrings("typingIndicatorRef", "statusBackdropColor"), searchExports: true},
    // Slides
    {filter: Filters.byStrings("contentDisplay"), searchExports: true},
    // AnimatedAvatar
    {filter: Filters.byStrings("avatarTooltipAsset"), searchExports: true},
    // Button
    {filter: Filters.byStrings("pfChQ"), searchExports: true},
    // CalendarPicker
    {filter: Filters.byStrings("react-datepicker__day[tabindex=\"0\"]"), searchExports: true},
    // Color
    {filter: Filters.byKeys(["Color"]), searchExports: true},
    // Electron
    {filter: Filters.byKeys(["setBadge"])}
);

const [
    FluxDispatch, Parser, Popout, MessageActions, Clickable, Slider, Modal,
    CloudUpload, Moment, Hljs, Snowflake, Lodash, CssVars, Intl, Flux,
    Permissions, ComponentDispatchModule, FormNotice, ImageUtils,
    ReactSpring, FetchingModule, ModalActionsModule, NavigationModule, LoadingPopout, Progress,
    Spinner, TextArea, CopyInput, SearchableSelect, Switch, FormSwitch, Text,
    Flex, Scroller, ProgressCircle, KeyCombo, Avatar, Slides, AnimatedAvatar,
    Button, CalendarPicker, Color, Electron
] = bulkModules;

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

export default {
    Helpers: {
        FluxDispatch,
        Parser,
        MessageActions,
        CloudUpload,
        Moment,
        Hljs,
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