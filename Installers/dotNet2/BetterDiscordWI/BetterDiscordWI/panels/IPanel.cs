using System.Windows.Forms;

namespace BetterDiscordWI.panels {
    internal interface IPanel {
        void ShowPanel();
        void HidePanel();
        void SetForm(FormMain formMain);
        string Title { get; }
        UserControl Control { get; }
    }
}
