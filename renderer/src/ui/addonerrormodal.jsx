import {React, Strings, WebpackModules} from "modules";
import Extension from "./icons/extension";
import ThemeIcon from "./icons/theme";
import DetailsIcon from "./icons/details";
import ErrorBoundary from "./errorboundary";

const {useState, useEffect} = React;

const ButtonModule = WebpackModules.getByProps("ButtonColors");
const TabBarModule = WebpackModules.getModule(
    (m) => m?.default?.displayName === "TabBar"
);
const ModalModule = WebpackModules.getByProps("ModalRoot");

const UserSettingsModule = WebpackModules.getByProps("open", "updateAccount");

const FormTitle = WebpackModules.getByDisplayName("FormTitle");
const FormDivider = WebpackModules.getByDisplayName("FormDivider");
const Header = WebpackModules.getByDisplayName("Header");
const Text = WebpackModules.getByDisplayName("Text");
const Caret = WebpackModules.getByDisplayName("Caret");
const Flex = WebpackModules.getByDisplayName("Flex");
const TabBar = TabBarModule?.default;
const Button = ButtonModule?.default;

const expandIconClasses = WebpackModules.getByProps("expandIcon");
const dividerClasses = WebpackModules.getByProps("topDivider");
const detailsClasses = WebpackModules.getByProps(
    "detailsWrapper",
    "detailsIcon"
);
const markupClasses = {
    ...WebpackModules.getByProps("blockquoteContainer", "markup"),
    ...WebpackModules.getByProps("zalgo", "messageContent"),
};

const parser = Object(WebpackModules.getByProps("defaultRules", "parse"));

export default function AddonErrorModal(props) {
    const [selectedTab, setSelectedTab] = useState("plugins");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        switch (selectedTab) {
            case "plugins":
                setErrors(
                    props.pluginErrors.map((error, index) => (
                        <AddonError
                            key={`${error.name}-${index}`}
                            type={selectedTab}
                            error={error}
                        />
                    ))
                );
                break;
            case "themes":
                setErrors(
                    props.themeErrors.map((error, index) => (
                        <AddonError
                            key={`${error.name}-${index}`}
                            type={selectedTab}
                            error={error}
                        />
                    ))
                );
                break;
            default:
                setErrors(<Text>{Strings.Modals.nevermind}</Text>);
                break;
        }
    }, [JSON.stringify(errors), selectedTab]);

    return (
        <ErrorBoundary
            fallback={() => <Text>{Strings.Addons.errorLoadingErrors}</Text>}
        >
            <ModalModule.ModalHeader>
                <Flex direction={Flex.Direction.VERTICAL}>
                    <Flex justify={Flex.Justify.SPACE_BETWEEN}>
                        <FormTitle tag="h4">{Strings.Modals.addonErrors}</FormTitle>
                        <ModalModule.ModalCloseButton onClick={props.onClose} />
                    </Flex>
                    <TabBar
                        look={TabBarModule.Looks.GREY}
                        type={TabBarModule.Types.TOP_PILL}
                        selectedItem={selectedTab}
                        onItemSelect={(item) => setSelectedTab(item)}
                    >
                        <TabBarModule.Item
                            id="plugins"
                            className="bd-addon-error-tabbar-item"
                        >
                            {Strings.Panels.plugins}
                        </TabBarModule.Item>
                        <TabBarModule.Item
                            id="themes"
                            className="bd-addon-error-tabbar-item"
                        >
                            {Strings.Panels.themes}
                        </TabBarModule.Item>
                    </TabBar>
                </Flex>
            </ModalModule.ModalHeader>
            <ModalModule.ModalContent className="bd-addon-error-content">
                <ErrorBoundary
                    fallback={() => <Text>{Strings.Addons.errorLoadingErrors}</Text>}
                >
                    {errors}
                </ErrorBoundary>
            </ModalModule.ModalContent>
            <ModalModule.ModalFooter>
                <Button color={ButtonModule.ButtonColors.BRAND} onClick={props.onClose}>
                    {Strings.Modals.done}
                </Button>
                <Button
                    style={{marginRight: "8px"}}
                    color={ButtonModule.ButtonColors.TRANSPARENT}
                    onClick={() => {
                        props.onClose();
                        // Discord.
                        UserSettingsModule.open("Settings");
                        setTimeout(() => UserSettingsModule.open("plugins"), 1e1);
                    }}
                >
                    {Strings.Addons.pluginSettings}
                </Button>
                <Button
                    style={{marginRight: "8px"}}
                    color={ButtonModule.ButtonColors.TRANSPARENT}
                    onClick={() => {
                        props.onClose();
                        // Discord.
                        UserSettingsModule.open("Settings");
                        setTimeout(() => UserSettingsModule.open("themes"), 1e1);
                    }}
                >
                    {Strings.Addons.themeSettings}
                </Button>
            </ModalModule.ModalFooter>
        </ErrorBoundary>
    );
}

export function AddonError(props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Flex
            className={`bd-addon-error ${expanded ? "expanded" : "collapsed"}`}
            direction={Flex.Direction.VERTICAL}
        >
            <Flex
                className="bd-addon-error-header"
                align={Flex.Align.CENTER}
                onClick={() => {
                    setExpanded(!expanded);
                }}
            >
                <div className="bd-addon-error-icon">
                    {props.type === "plugins" ? <Extension /> : <ThemeIcon />}
                </div>
                <Flex direction={Flex.Direction.VERTICAL}>
                    <Header tag="h3" size={Header.Sizes.SIZE_16}>
                        {props.error.name}
                    </Header>
                    <Flex
                        align={Flex.Align.CENTER}
                        wrap={Flex.Wrap.WRAP}
                        className={`bd-addon-error-details ${detailsClasses.detailsWrapper}`}
                    >
                        <DetailsIcon />
                        <Text
                            color={Text.Colors.HEADER_SECONDARY}
                            size={Text.Sizes.SIZE_12}
                        >
                            {props.error.message}
                        </Text>
                    </Flex>
                </Flex>
                <Caret className={expandIconClasses.expandIcon} expanded={expanded} />
            </Flex>
            {expanded ? (
                <>
                    <FormDivider className={dividerClasses.topDivider} />
                    <div
                        className={`bd-addon-error-stack ${markupClasses.markup} ${markupClasses.messageContent}`}
                    >
                        {parser.defaultRules.codeBlock.react(
                            {content: props.error.stack, lang: "ruby"},
                            null,
                            {}
                        )}
                    </div>
                </>
            ) : null}
        </Flex>
    );
}
