using System;
using System.Diagnostics;
using System.IO;
using System.Security.AccessControl;
using System.Windows.Forms;
using System.Windows.Forms.VisualStyles;
using System.Xml;

namespace BetterDiscordWI.panels
{
    public partial class Panel2 : UserControl, IPanel
    {

        private String _dataPath, _tempPath;
        private Utils _utils;

        public Panel2()
        {
            InitializeComponent();
        }

        public void SetVisible()
        {
            GetParent().btnBack.Enabled = false;
            GetParent().btnNext.Enabled = false;


            
            CreateDirectories();

            
        }

        private void CreateDirectories()
        {
            _dataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + "\\BetterDiscord";
            _tempPath = _dataPath + "\\temp";


            if (!Directory.Exists(_dataPath))
            {
                AppendLog("Creating Directory: " + _dataPath);
                Directory.CreateDirectory(_dataPath);
            }

            if (!Directory.Exists(_dataPath))
            {
                AppendLog("ERROR: Directory does not exist: " + _dataPath);
                return;
            }

            if (!Directory.Exists(_tempPath))
            {
                AppendLog("Creating Directory: " + _tempPath);
                Directory.CreateDirectory(_tempPath);
            }
            else
            {
                AppendLog("Directory already exists: " + _tempPath);
                AppendLog("Deleting Directory: " + _tempPath);
                Directory.Delete(_tempPath, true);
            }

            if (!Directory.Exists(_tempPath))
            {
                AppendLog("Creating Directory: " + _tempPath);
                Directory.CreateDirectory(_tempPath);
            }

            if (!Directory.Exists(_tempPath))
            {
                AppendLog("ERROR: Directory does not exists: " + _tempPath);
                return;
            }

            CheckNode();
        }

        private void CheckNode()
        {
            AppendLog("Checking if node exists");

            bool nodeExists = false;
            String nodePath = "";


            Process p = new Process
            {
                StartInfo = { UseShellExecute = false, RedirectStandardOutput = true, FileName = "cmd.exe", Arguments = "/C where node" }
            };

            p.Start();

            String output = p.StandardOutput.ReadToEnd();

            if (File.Exists(output))
            {
                nodeExists = true;
                nodePath = output;
            }


            if (!nodeExists)
            {
                if (File.Exists(_dataPath + "\\node.exe")) ;
                nodePath = _dataPath + "\\node.exe";
                nodeExists = true;
            }

            if (nodeExists)
            {
                AppendLog("Node located at: " + nodePath);
            }

            DownloadResources(nodeExists);
        }



        private void DownloadResources(bool node)
        {
            _utils = new Utils();


            foreach (XmlNode resource in GetParent().ResourceList)
            {

                String name = resource["name"].InnerText;
                String url = resource["url"].InnerText;

                if (name.ToLower().Equals("node"))
                {
                    if (!node)
                    {
                        DownloadResource(".exe", name, url);
                    }
                }
                else
                {
                    DownloadResource(".zip", name, url);
                }
            }


        }

        private void DownloadResource(String extension, String resource, String url)
        {
            AppendLog("Downloading Resource: " + resource);
            _utils.StartDownload(pbMain, url, resource + extension);
        }

        public FormMain GetParent()
        {
            return (FormMain)ParentForm;
        }

        public void BtnNext()
        {
            throw new NotImplementedException();
        }

        public void BtnPrev()
        {
            throw new NotImplementedException();
        }

        private void AppendLog(String message)
        {
            rtLog.AppendText(message + "\n");
            rtLog.SelectionStart = rtLog.Text.Length;
            rtLog.ScrollToCaret();
        }
    }
}
