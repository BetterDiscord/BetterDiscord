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
                if (!s.Contains("app-")) continue;
                if (String.IsNullOrEmpty(highestVersion))
                {
                    highestVersion = s;
                    continue;
                }

                if (String.CompareOrdinal(s, highestVersion) > 0)
                {
                    highestVersion = s;
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
            GetParent().RestartDiscord = cbRestart.Checked;
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

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBox1.Checked == true)
            {
                checkBox2.Checked = false;
                String[] directories = Directory.GetDirectories(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\DiscordCanary");

                String highestVersion = null;

                foreach (String s in directories)
                {
                    Debug.Print(s);
                    if (!s.Contains("app-")) continue;
                    if (String.IsNullOrEmpty(highestVersion))
                    {
                        highestVersion = s;
                        continue;
                    }

                    if (String.CompareOrdinal(s, highestVersion) > 0)
                    {
                        highestVersion = s;
                    }
                }


                tbPath.Text = highestVersion;
            }
            if (checkBox1.Checked == false)
            {
                if (checkBox2.Checked == false)
                {
                    String[] directories = Directory.GetDirectories(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\Discord");

                    String highestVersion = null;

                    foreach (String s in directories)
                    {
                        Debug.Print(s);
                        if (!s.Contains("app-")) continue;
                        if (String.IsNullOrEmpty(highestVersion))
                        {
                            highestVersion = s;
                            continue;
                        }

                        if (String.CompareOrdinal(s, highestVersion) > 0)
                        {
                            highestVersion = s;
                        }
                    }


                    tbPath.Text = highestVersion;
                }
            }
        }

        private void checkBox2_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBox2.Checked == true)
            {
                checkBox1.Checked = false;
                String[] directories = Directory.GetDirectories(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\DiscordPTB");

                String highestVersion = null;

                foreach (String s in directories)
                {
                    Debug.Print(s);
                    if (!s.Contains("app-")) continue;
                    if (String.IsNullOrEmpty(highestVersion))
                    {
                        highestVersion = s;
                        continue;
                    }

                    if (String.CompareOrdinal(s, highestVersion) > 0)
                    {
                        highestVersion = s;
                    }
                }


                tbPath.Text = highestVersion;
            }
            if (checkBox2.Checked == false)
            {
                if (checkBox1.Checked == false)
                {
                    String[] directories = Directory.GetDirectories(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\Discord");

                    String highestVersion = null;

                    foreach (String s in directories)
                    {
                        Debug.Print(s);
                        if (!s.Contains("app-")) continue;
                        if (String.IsNullOrEmpty(highestVersion))
                        {
                            highestVersion = s;
                            continue;
                        }

                        if (String.CompareOrdinal(s, highestVersion) > 0)
                        {
                            highestVersion = s;
                        }
                    }


                    tbPath.Text = highestVersion;
                }
            }
        }
    }
}
