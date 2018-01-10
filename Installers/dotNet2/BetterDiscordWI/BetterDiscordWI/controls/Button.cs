namespace BetterDiscordWI.controls {
    public partial class Button : System.Windows.Forms.Button {
        public Button() {
            InitializeComponent();
        }

        public Button HideDisable(string newText = null) {
            if (newText != null) Text = newText;
            Hide();
            Enabled = false;
            return this;
        }

        public Button HideEnable(string newText = null) {
            if (newText != null) Text = newText;
            Hide();
            Enabled = true;
            return this;
        }

        public Button ShowDisable(string newText = null) {
            if (newText != null) Text = newText;
            Show();
            Enabled = false;
            return this;
        }

        public Button ShowEnable(string newText = null) {
            if (newText != null) Text = newText;
            Show();
            Enabled = true;
            return this;
        }

    }
}
