using System;
using System.Drawing;
using System.Windows.Forms;
using System.Xml;
using BetterDiscordWI.panels;

namespace BetterDiscordWI {
    public partial class FormMain : Form {

        private readonly IPanel[] _panels = { new Panel0(), new Panel1(), new Panel2() };
        private int _index;

        public string DiscordPath;
        public bool RestartDiscord = false;
        public string Sha;
        public bool Finished = false;

        public XmlNodeList ResourceList;

        public FormMain() {
            InitializeComponent();

            Sha = Utils.GetHash();

            if (Sha.Length < 1) {
                MessageBox.Show(@"Failed to get sha", @"Error", MessageBoxButtons.OK);
                Environment.Exit(0);
            }

            foreach (IPanel ipanel in _panels) {
                panelContainer.Controls.Add((UserControl)ipanel);
                ((UserControl)ipanel).Dock = DockStyle.Fill;
                ((UserControl)ipanel).Hide();
            }
            ((UserControl)_panels[_index]).Show();
            _panels[_index].SetVisible();

            btnCancel.Click += (sender, args) => Close();
            btnNext.Click += (sender, args) => _panels[_index].BtnNext();
            btnBack.Click += (sender, args) => _panels[_index].BtnPrev();
        }

        public void SwitchPanel(int index) {
            ((UserControl)_panels[_index]).Hide();
            _index = index;
            ((UserControl)_panels[_index]).Show();
            _panels[_index].SetVisible();
        }

        protected override void OnFormClosing(FormClosingEventArgs e) {
            if (Finished) return;
            DialogResult dr = MessageBox.Show(@"Setup is not complete. If you exit now, BetterDiscord will not be installed. Exit Setup?", @"Exit Setup?", MessageBoxButtons.YesNo);
            if (dr == DialogResult.No) {
                e.Cancel = true;
            }
        }

        readonly Pen _borderPen = new Pen(Color.FromArgb(160, 160, 160));
        protected override void OnPaint(PaintEventArgs e) {
            Graphics g = e.Graphics;
            g.FillRectangle(SystemBrushes.Window, new Rectangle(0, 0, Width, 50));
            g.DrawLine(_borderPen, 0, 50, Width, 50);
            g.DrawLine(SystemPens.Window, 0, 51, Width, 51);

            g.DrawLine(_borderPen, 0, 310, Width, 310);
            g.DrawLine(SystemPens.Window, 0, 311, Width, 311);

            base.OnPaint(e);
        }
    }
}
