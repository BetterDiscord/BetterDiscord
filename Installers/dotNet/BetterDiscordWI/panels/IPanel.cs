namespace BetterDiscordWI.panels {
    interface IPanel {
        void SetVisible();
        FormMain GetParent();
        void BtnNext();
        void BtnPrev();
    }
}