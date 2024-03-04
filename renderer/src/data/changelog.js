// fixed, improved, added, progress
export default {
    video: "https://www.youtube.com/embed/evyvq9eQTqA?si=opmzjGjUArT4VLrj&vq=hd720p&hd=1&rel=0&showinfo=0&mute=1&loop=1&autohide=1",
    description: "This update brings a lot of small features that have been requested for a long time. For a quick demo of what's included in this update, take a look at the video above! If you want more details, keep reading on below!",
    changes: [
        {
            title: "Cool New Features",
            type: "added",
            description: "All of these features can be seen demo'd in the video up top!",
            items: [
                "**Enable/disable all buttons** for plugins and themes is finally here! With it comes a revamped set of controls on the plugins and themes pages. You'll find the search field has shifted up top while the open folder button has moved down and next to the new buttons.",
                "The **[BDContextMenu](https://betterdiscord.app/plugin/BDContextMenu) plugin has now been integrated** directly into BetterDiscord! If you're using it, *go ahead and delete it*. If you're not, try and right click the cog menu near your avatar at the bottom left.",
                "You can now **reset to default settings!** This helps when trying to debug why individuals pieces of BetterDiscord aren't working or figuring out if a problem you're having is from a plugin or not.",
                "BetterDiscord is now using a more **consistent design components!** Not only does this make the UI more __visually consistent for you,__ but it also makes developing easier for us as we add new features!",
                "Next time you need support, there is now **new debug information** at the bottom left of your settings page. Click it to copy advanced info and give it to the support team to help you out!",
            ]
        },
        {
            title: "Quality Of Life Improvements",
            type: "progress",
            items: [
                "The search bar on the plugins and themes pages will now auto focus upon entering. (Thanks [@flatypus](https://github.com/flatypus))",
                "Opening the plugin or theme folder will now happen in the foreground. (Thanks [@pschaub](https://github.com/pschaub))",
                "Users of the debug logging option will be notified when their log becomes overly large with a prompt to delete.",
                "All search fields are now clearable! The search icon will turn into an `x` when you input a query",
                "The search field on the plugins and theme pages will now show the total number installed.",
                "Searching for plugins and theme will display the number of results in the title.",
                "The Updater panel now uses proper icons for buttons instead of 3 different sized buttons with text.",
                "Live updating in Custom CSS is now smoother due to a new debouncer. This setting also now uses the common switch rather than a basic checkbox.",
                "This Changelog you're reading right now is now made using custom components. That means it should keep working even if Discord updates and changes things again!"
            ]
        },
        {
            title: "Bugs Squashed",
            type: "fixed",
            items: [
                "BetterDiscord should now be compatible with Electron 28 which is currently used in Canary/PTB.",
                "Clicking the support server button on plugin/theme cards should work again! (Thanks [@Huderon](https://github.com/Huderon))",
                "More untranslated strings were added to the translatable list.",
                "Lazy loaded modules are now restored to their original source. (Thanks [@Skamt](https://github.com/Skamt))",
                "Markdown used by BetterDiscord will now behave more consistently and embed links.",
                "Fixed some issues with general client lag.",
            ]
        },
        {
            title: "Developer Notes",
            type: "improved",
            items: [
                "Modal APIs now support `onClose` which will be called when the modal is closed regardless of the reason.",
                "The anonymous patch function from `Patcher` is no longer anonymous, it will show up as `BDPatcher` to make it clearer what the function is.",
                "Internally, BetterDiscord has moved to consistently using new UI components `Flex`, `Button`, and `Text`. These will become available to developers once they are more tested.",
                "BetterDiscord has also started using custom modal components including `ModalHeader`, `ModalContent`, `ModalFooter` `ModalRoot`, `ModalStack`, `CloseButton`, and `Backdrop`. ",
                "The Modal APIs now use our custom `ConfirmationModal` component built from the components above. This should prove more consistent through Discord updates. Access to the component itself will come in a future update.",
            ]
        }
    ]
};
