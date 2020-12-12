export default [
    {
        type: "category",
        id: "general",
        name: "General",
        collapsible: true,
        settings: [
            {type: "switch", id: "download", value: true},
            {type: "switch", id: "emoteMenu", value: true},
            {type: "switch", id: "hideEmojiMenu", value: false, enableWith: "emoteMenu"},
            {type: "switch", id: "modifiers", value: true},
            {type: "switch", id: "animateOnHover", value: false}
        ]
    },
    {
        type: "category",
        id: "categories",
        name: "Categories",
        collapsible: true,
        settings: [
            {type: "switch", id: "twitchglobal", value: true},
            {type: "switch", id: "twitchsubscriber", value: false},
            {type: "switch", id: "frankerfacez", value: true},
            {type: "switch", id: "bttv", value: true}
        ]
    }
];