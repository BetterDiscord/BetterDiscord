using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Threading;
using System.Windows.Forms;
using asardotnet;

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
            GetParent().btnBack.Visible = false;
            GetParent().btnNext.Visible = false;
            GetParent().btnCancel.Enabled = false;

            _utils = new Utils();

            AppendLog("Killing Discord");
            foreach (var process in Process.GetProcessesByName("Discord"))
            {
                process.Kill();
            }
            
            CreateDirectories();
        }

        private void CreateDirectories()
        {
            Thread t = new Thread(() =>
            {
                _dataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + "\\BetterDiscord";
                _tempPath = _dataPath + "\\temp";


                if (Directory.Exists(_tempPath))
                {
                    AppendLog("Deleting temp path");
                    Directory.Delete(_tempPath, true);
                }

                while (Directory.Exists(_tempPath))
                {
                    Debug.Print("Waiting for dirdel");
                    Thread.Sleep(100);
                }

                Directory.CreateDirectory(_tempPath);

                DownloadResource("BetterDiscord.zip", "https://github.com/Jiiks/BetterDiscordApp/archive/stable.zip");

                while (!File.Exists(_tempPath + "\\BetterDiscord.zip"))
                {
                    Debug.Print("Waiting for download");
                    Thread.Sleep(100);
                }

                AppendLog("Extracting BetterDiscord");

                ZipArchive zar =
                    ZipFile.OpenRead(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) +
                                     "\\BetterDiscord\\temp\\BetterDiscord.zip");
                zar.ExtractToDirectory(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) +
                                       "\\BetterDiscord\\temp\\");

                DeleteDirs();
            });
            t.Start();

        }


        private void DeleteDirs()
        {
            Thread t = new Thread(() =>
            {
                String dir = GetParent().DiscordPath + "\\resources\\app";

                if (Directory.Exists(dir))
                {
                    AppendLog("Deleting " + dir);
                    Directory.Delete(dir, true);
                }

                while (Directory.Exists(dir))
                {
                    Debug.Print("Waiting for direl");
                    Thread.Sleep(100);
                }

                dir = GetParent().DiscordPath + "\\resources\\node_modules\\BetterDiscord";


                if (Directory.Exists(dir))
                {
                    AppendLog("Deleting " + dir);
                    Directory.Delete(dir, true);
                }

                while (Directory.Exists(dir))
                {
                    Debug.Print("Waiting for direl");
                    Thread.Sleep(100);
                }

                AppendLog("Moving BetterDiscord to resources\\node_modules\\");

                Directory.Move(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + "\\BetterDiscord\\temp\\BetterDiscordApp-stable", GetParent().DiscordPath + "\\resources\\node_modules\\BetterDiscord");

                AppendLog("Extracting app.asar");

                AsarArchive archive = new AsarArchive(GetParent().DiscordPath + "\\resources\\app.asar");

                AsarExtractor extractor = new AsarExtractor();
                extractor.ExtractAll(archive, GetParent().DiscordPath + "\\resources\\app\\");

                Splice();
            });
            
            
            t.Start();
        }


        private void DownloadResource(String resource, String url)
        {
            AppendLog("Downloading Resource: " + resource);

            WebClient webClient = new WebClient();
            webClient.Headers["User-Agent"] = "Mozilla/5.0";
            
            webClient.DownloadFile(new Uri(url), Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + "\\BetterDiscord\\temp\\" + resource);
        }

        private void Splice()
        {
            String indexloc = GetParent().DiscordPath + "\\resources\\app\\app\\index.js";

            Thread t = new Thread(() =>
            {

                List<String> lines = new List<string>();

                AppendLog("Spicing index");

                using (FileStream fs = new FileStream(indexloc, FileMode.Open))
                {
                    using (StreamReader reader = new StreamReader(fs))
                    {
                        String line = "";
                        while((line = reader.ReadLine()) != null)
                        {
                            if (line.Contains("var _overlay2"))
                            {
                                AppendLog("Splicing require");
                                lines.Add(line);
                                lines.Add("var _betterDiscord = require('betterdiscord');");
                            }else if (line.Contains("mainWindow = new _BrowserWindow2"))
                            {
                                AppendLog("Splicing function call");
                                lines.Add(line);
                                lines.Add("betterDiscord(mainWindow);");
                            }
                            else if (line.Contains("main();"))
                            {
                                AppendLog("Splicing function");
                                lines.Add("function betterDiscord(mw) { _betterDiscord = new _betterDiscord.BetterDiscord(mw); _betterDiscord.init(); }");
                                lines.Add(line);
                            }
                            else
                            {
                                lines.Add(line);
                            }
                        }
                    }
                }

                AppendLog("Writing index");

                File.WriteAllLines(indexloc, lines.ToArray());

                Finalize();
            });
            t.Start();
        }

        private void Finalize()
        {
            AppendLog("Finished installing BetterDiscord");

            Invoke((MethodInvoker) delegate
            {
                GetParent().finished = true;
                GetParent().btnCancel.Text = "OK";
                GetParent().btnCancel.Enabled = true;
            });
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
            Invoke((MethodInvoker) delegate
            {
                rtLog.AppendText(message + "\n");
                rtLog.SelectionStart = rtLog.Text.Length;
                rtLog.ScrollToCaret();
            });
            
        }
    }
}
