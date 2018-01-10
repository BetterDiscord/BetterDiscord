using System;
using System.Drawing;
using System.Windows.Forms;
using BetterDiscordWI.panels;

namespace BetterDiscordWI {

    public partial class FormMain : Form {

        private readonly IPanel[] _panels = { new LicensePanel(), new ConfigPanel(), new InstallPanel() };
        private int _currentPanel;

        public string DiscordPath = null;
        public bool RestartDiscord = true;
        public bool Stable = true, Canary, Ptb;

        public FormMain() {
            InitializeComponent();

            foreach (var panel in _panels) {
                panel.SetForm(this);
                panel.Control.Dock = DockStyle.Fill;
                panelDock.Controls.Add(panel.Control);
            }
            SwitchPanel(0);
        }
        

        public void SetTitle(string title) => lblTitle.Text = title;

        public void SwitchPanel(int index) {
            _currentPanel = index;
            foreach (var panel in _panels) { panel.HidePanel(); }
            SetTitle($"BetterDiscord {_panels[index].Title}");
            _panels[index].ShowPanel();
        }

        private readonly Pen _borderPen = new Pen(Color.FromArgb(160, 160, 160));
        protected override void OnPaint(PaintEventArgs e) {
            base.OnPaint(e);

            var g = e.Graphics;
            g.FillRectangle(SystemBrushes.Window, new Rectangle(0, 0, Width, 85));
            g.DrawLine(_borderPen, 0, 85, Width, 85);
            g.DrawLine(SystemPens.Window, 0, 86, Width, 86);

            g.DrawLine(_borderPen, 0, 445, Width, 445);
            g.DrawLine(SystemPens.Window, 0, 446, Width, 446);
        }
        
        private void btnNext_Click(object sender, EventArgs e) {
            _currentPanel++;
            SwitchPanel(_currentPanel);
        }

        private void btnCancel_Click(object sender, EventArgs e) {
            Application.Exit();
        }

        private void btnBack_Click(object sender, EventArgs e) {
            _currentPanel--;
            SwitchPanel(_currentPanel);
        }

        public void Fail() {
            btnCancel.ShowEnable();
            btnNext.ShowDisable();
            btnBack.ShowEnable();
        }
    }
}
