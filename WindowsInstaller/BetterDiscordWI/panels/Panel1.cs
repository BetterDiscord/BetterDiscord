using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace BetterDiscordWI.panels
{
    public partial class Panel1 : UserControl, IPanel
    {
        public Panel1()
        {
            InitializeComponent();
        }

        public void SetVisible()
        {

            GetParent().btnBack.Visible = true;
            GetParent().btnNext.Enabled = true;
            GetParent().btnBack.Enabled = true;
            GetParent().btnNext.Text = "Install";
            GetParent().lblPanelTitle.Text = "BetterDiscord Installation";

            String[] directories = Directory.GetDirectories(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\Discord");

            String highestVersion = null;

            foreach(String s in directories)
            {
                Debug.Print(s);
                if (s.Contains("app-"))
                {
                    

                    if (highestVersion == null)
                    {
                        highestVersion = s;
                        continue;
                    }

                    if (String.CompareOrdinal(s, highestVersion) > 0)
                    {
                        highestVersion = s;
                    }

                }
            }

            tbPath.Text = highestVersion;
        }

        public FormMain GetParent()
        {
            return (FormMain) ParentForm;
        }

        public void BtnNext()
        {
            GetParent().DiscordPath = tbPath.Text;
            GetParent().SwitchPanel(2);
        }

        public void BtnPrev()
        {
            GetParent().SwitchPanel(0);
        }

        private void btnBrowser_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog fbd = new FolderBrowserDialog {SelectedPath = tbPath.Text};
            fbd.ShowDialog(GetParent());

            tbPath.Text = fbd.SelectedPath;
        }
    }
}
