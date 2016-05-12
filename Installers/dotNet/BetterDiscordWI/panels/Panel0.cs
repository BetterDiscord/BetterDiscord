using System.Windows.Forms;

namespace BetterDiscordWI.panels {
    public partial class Panel0 : UserControl, IPanel {
        public Panel0() {
            InitializeComponent();

            radioAcceptLicense.CheckedChanged += (sender, args) => {
                GetParent().btnNext.Enabled = radioAcceptLicense.Checked;
            };
        }

        public void SetVisible() {
            GetParent().btnBack.Visible = false;
            GetParent().btnNext.Enabled = false;
            GetParent().btnNext.Text = @"Next >";
            GetParent().lblPanelTitle.Text = @"BetterDiscord License Agreement";
            GetParent().btnNext.Enabled = radioAcceptLicense.Checked;
        }

        public FormMain GetParent() {
            return (FormMain)ParentForm;
        }

        public void BtnNext() {
            GetParent().SwitchPanel(1);
        }

        public void BtnPrev() {}
    }
}
