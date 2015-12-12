using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
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
                                AppendLog("Splicing plugin&theme loaders");

                                lines.Add("    mainWindow.webContents.on('dom-ready', function() {");
                                lines.Add("        var fs = require('fs');");
                                lines.Add("        fs.readdir('G:/BetterDiscord/plugins/',function(err,files) {");
                                lines.Add("            if (err) { console.log(err); return; } ");
                                lines.Add("            mainWindow.webContents.executeJavaScript('var bdplugins = {};');");
                                lines.Add("            files.forEach(function(fileName){");
                                lines.Add("                var plugin = fs.readFileSync('G:/BetterDiscord/plugins/' + fileName,'utf8');");
                                lines.Add("                var meta = plugin.split('\\n')[0];");
                                lines.Add("                if(meta.indexOf('META') < 0) {");
                                lines.Add("                    console.log('BetterDiscord: ERROR[Plugin META not found in file: '+fileName+']');");
                                lines.Add("                    return;");
                                lines.Add("                }");
                                lines.Add("                var pluginVar = meta.substring(meta.lastIndexOf('//META')+6, meta.lastIndexOf('*//'));");
                                lines.Add("                var parse = JSON.parse(pluginVar);");
                                lines.Add("                var pluginName = parse['name'];");
                                lines.Add("                console.log('BetterDiscord: Loading Plugin: ' + pluginName);");
                                lines.Add("                mainWindow.webContents.executeJavaScript(plugin);");
                                lines.Add("                mainWindow.webContents.executeJavaScript('(function() { var plugin = new '+pluginName+'(); bdplugins[plugin.getName()] = { \"plugin\": plugin, \"enabled\": false } })();')");
                                lines.Add("            });");
                                lines.Add("        });");
                                lines.Add("\n");
                                lines.Add("        fs.readdir('G:/BetterDiscord/themes/', function(err, files) {");
                                lines.Add("            if (err) { console.log(err); return; }");
                                lines.Add("            mainWindow.webContents.executeJavaScript('var bdthemes = {};');");
                                lines.Add("            files.forEach(function(fileName) {");
                                lines.Add("                var theme = fs.readFileSync('G:/BetterDiscord/themes/' + fileName, 'utf8');");
                                lines.Add("                var split = theme.split('\\n');");
                                lines.Add("                var meta = split[0];");
                                lines.Add("                if(meta.indexOf('META') < 0) {");
                                lines.Add("                    console.log('BetterDiscord: ERROR[Theme META not found in file: '+fileName+']');");
                                lines.Add("                    return;");
                                lines.Add("                }");
                                lines.Add("                var themeVar = meta.substring(meta.lastIndexOf('//META')+6, meta.lastIndexOf('*//'));");
                                lines.Add("                var parse = JSON.parse(themeVar);");
                                lines.Add("                var themeName = parse['name'];");
                                lines.Add("                console.log('BetterDiscord: Loading Theme: ' + themeName);");
                                lines.Add("                split.splice(0, 1);");
                                lines.Add("                theme = split.join('\\n');");
                                lines.Add("                theme = theme.replace(/(\\r\\n|\\n|\\r)/gm,'');");
                                lines.Add("                theme = theme.replace(/\\s/g, '');");
                                lines.Add("                mainWindow.webContents.executeJavaScript('var theme' + themeName + ' = \"' + escape(theme) + '\";');");
                                lines.Add("                mainWindow.webContents.executeJavaScript('(function() { bdthemes[theme'+themeName+'] = false })();');");
                                lines.Add("            });");
                                lines.Add("        });");
                                lines.Add("    });\n");

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

                
                AppendLog("Finished installation, verifying installation...");

                int errors = 0;

                String curPath = GetParent().DiscordPath + "\\resources\\app\\app\\index.js";
                
                if (!File.Exists(curPath))
                {
                    AppendLog("ERROR: FILE: " + curPath + " DOES NOT EXIST!");
                    errors++;
                }

                curPath = GetParent().DiscordPath + "\\resources\\node_modules\\BetterDiscord";

                if (!Directory.Exists(curPath))
                {
                    AppendLog("ERROR: DIRECTORY: " + curPath + " DOES NOT EXIST");
                    errors++;
                }


                String basePath = GetParent().DiscordPath + "\\resources\\node_modules\\BetterDiscord";
                String[] bdFiles = {"\\package.json", "\\betterdiscord.js", "\\lib\\BetterDiscord.js", "\\lib\\config.json", "\\lib\\Utils.js"};

                foreach (string s in bdFiles.Where(s => !File.Exists(basePath + s)))
                {
                    AppendLog("ERROR: FILE: " + basePath + s + " DOES NOT EXIST");
                    errors++;
                }


                Finalize(errors);
            });


        }

        private void Finalize(int errors)
        {
            AppendLog("Finished installing BetterDiscord with " + errors + " errors");


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
