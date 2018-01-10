using System.Windows.Forms;

namespace BetterDiscordWI.panels {

    public partial class LicensePanel : UserControl, IPanel {

        private FormMain _formMain;

        public string Title => "License Agreement";
        public UserControl Control => this;

        public LicensePanel() {
            InitializeComponent();
            radioAccept.CheckedChanged += (sender, args) => {
                if (radioAccept.Checked) {
                    _formMain.btnBack.HideDisable();
                    _formMain.btnNext.ShowEnable();
                    _formMain.btnCancel.ShowEnable();
                    return;
                }
                _formMain.btnBack.HideDisable();
                _formMain.btnNext.ShowDisable();
                _formMain.btnCancel.ShowEnable();
            };
        }

        public void SetForm(FormMain formMain) => _formMain = formMain;

        public void ShowPanel() {
            radioAccept.Checked = false;
            radioDecline.Checked = true;
            _formMain.btnBack.HideDisable();
            _formMain.btnNext.ShowDisable();
            _formMain.btnCancel.ShowEnable();
            Show();
        }

        public void HidePanel() => Hide();
    }
}
