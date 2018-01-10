using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace BetterDiscordWI.panels {
    public partial class ConfigPanel : UserControl, IPanel {

        private FormMain _formMain;
        private readonly Regex _matcher = new Regex(@"[0-9]+\.[0-9]+\.[0-9]+");

        private static string StablePath => $"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}\\Discord";
        private static bool StableExists() => Directory.Exists(StablePath);
        private static string CanaryPath => $"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}\\DiscordCanary";
        private static bool CanaryExists() => Directory.Exists(CanaryPath);
        private static string PtbPath => $"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}\\DiscordPTB";
        private static bool PtbExists() => Directory.Exists(PtbPath);

        public ConfigPanel() {
            InitializeComponent();
        }

        public void ShowPanel() {
            _formMain.btnBack.ShowEnable();
            _formMain.btnCancel.ShowEnable();
            _formMain.btnNext.ShowEnable("Install");

            if (!CanaryExists()) {
                lblCanarywarning.Show();
                cbCanary.Enabled = false;
            }

            if (!PtbExists()) {
                lblPtbwarning.Show();
                cbPtb.Enabled = false;
            }

            if (!StableExists()) {
                lblStablewarning.Show();
                cbStable.Enabled = false;
            }

            if (!StableExists() && !CanaryExists() && PtbExists()) {
                _formMain.btnNext.ShowDisable();
            }

            cbRestart.Checked = _formMain.RestartDiscord;
            cbCanary.Checked = _formMain.Canary;
            cbPtb.Checked = _formMain.Ptb;
            cbStable.Checked = _formMain.Stable;

            LocateDiscord();

            Show();
        }

        public void HidePanel() {
            Hide();
        }

        public void SetForm(FormMain formMain) => _formMain = formMain;

        public string Title => "Installation";
        public UserControl Control => this;

        private void btnBrowse_Click(object sender, System.EventArgs e) {
            var fbd = new FolderBrowserDialog {SelectedPath = tbPath.Text};
            fbd.ShowDialog();

            tbPath.Text = fbd.SelectedPath;
            _formMain.DiscordPath = fbd.SelectedPath;
        }

        private void LocateDiscord() {
            var finalPath = GetLatestVersion(cbPtb.Checked ? PtbPath : cbCanary.Checked ? CanaryPath : StablePath);

            tbPath.Text = finalPath;
            _formMain.DiscordPath = finalPath;
            _formMain.Stable = cbStable.Checked;
            _formMain.Canary = cbCanary.Checked;
            _formMain.Ptb = cbPtb.Checked;
        }

        

        private string GetLatestVersion(string path) {
            var dirs = Directory.GetDirectories(path);
            var latest = dirs[0];

            foreach (var dir in dirs) {
                if (!_matcher.IsMatch(dir)) continue;
                if (string.CompareOrdinal(dir, latest) > 0) latest = dir;
            }

            return latest;
        }

        private void cbCanary_CheckedChanged(object sender, EventArgs e) {
            if (cbCanary.Checked) {
                cbPtb.Checked = false;
                cbStable.Checked = false;
            }
            LocateDiscord();
        }

        private void cbPtb_CheckedChanged(object sender, EventArgs e) {
            if (cbPtb.Checked) {
                cbCanary.Checked = false;
                cbStable.Checked = false;
            }
            LocateDiscord();
        }

        private void cbRestart_CheckedChanged(object sender, EventArgs e) {
            _formMain.RestartDiscord = cbRestart.Checked;
        }

        private void cbStable_CheckedChanged(object sender, EventArgs e) {
            if (cbStable.Checked) {
                cbCanary.Checked = false;
                cbPtb.Checked = false;
            }
            LocateDiscord();
        }
    }
}
