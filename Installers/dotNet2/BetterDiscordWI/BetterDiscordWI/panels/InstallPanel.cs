using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using asardotnetasync;

namespace BetterDiscordWI.panels {
    public partial class InstallPanel : UserControl, IPanel {

        private FormMain _formMain;
        private readonly SynchronizationContext _synchronizationContext;

        private string _asarPath => $"{_formMain.DiscordPath}\\modules\\discord_desktop_core";

        public InstallPanel() {
            InitializeComponent();
            _synchronizationContext = SynchronizationContext.Current;
        }

        private async Task<int> InstallTask() {

            var asarExists = LocateAsar();
            if (!asarExists) return 0;

            Append("Killing Discord Processes");

            var discordPname = _formMain.Canary ? "DiscordCanary" : _formMain.Ptb ? "DiscordPTB" : "Discord";
            string discordExePath = null;
            foreach (var process in Process.GetProcessesByName(discordPname)) {
                Append($"Killing Discord process {process.Id}", true);
                discordExePath = process.MainModule.FileName;
                process.Kill();
            }

            if (await AsarExtract() != 1) return 0;
            if (await InjectBd() != 1) return 0;
            if (await DownloadBd() != 1) return 0;
            if (await Verify() != 1) return 0;

            if (_formMain.RestartDiscord && discordExePath != null) {
                Append("Restarting Discord");
                Process.Start(discordExePath);
            }

            Append("Finished installing BetterDiscord!");

            return 1;
        }

        private async Task<int> AsarExtract() {

            Append("Extracting core.asar");

            var asarArchive = new AsarArchive($"{_asarPath}\\core.asar");
            var asarExtractor = new AsarExtractor();

            asarExtractor.FileExtracted += (s, e) => {
                _synchronizationContext.Post(o => {
                    pbStatus.Value = (int)((AsarExtractEvent)o).Progress;
                }, e);
                Append(e.File.Path, true);
            };

            asarExtractor.Finished += (s, e) => {
                Append($"Finished extracting core.asar");
            };

            try {
                if (!Directory.Exists($"{_asarPath}\\app")) Directory.CreateDirectory($"{_asarPath}\\core");
                await asarExtractor.ExtractAll(asarArchive, $"{_asarPath}\\core\\");
            }
            catch (Exception e) {
                Debug.Print(e.Message);
            }

            return 1;
        }

        private async Task<int> InjectBd() {

            var mainScreenPath = $"{_asarPath}\\core\\app\\mainScreen.js";
            var indexPath = $"{_asarPath}\\index.js";

            Append($"Injecting BetterDiscord to {_asarPath}\\core");

            if (!File.Exists(mainScreenPath)) {
                Append($"{mainScreenPath} does not exist! Cannot continue.");
                _formMain.Fail();
                return 0;
            }

            Append("Rewriting index.js");
            File.WriteAllText(indexPath, "module.exports = require('./core');");

            var lines = new List<string>();
            foreach (var line in File.ReadAllLines(mainScreenPath)) {
                lines.Add(line);
                if (line.Contains("mainWindow = new")) {
                    lines.Add("  _betterDiscord2 = new _betterDiscord.BetterDiscord(mainWindow);");
                }
            }

            lines.Insert(1, "var _betterDiscord = require('BetterDiscord');");
            lines.Insert(2, "var _betterDiscord2;");

            File.WriteAllLines(mainScreenPath, lines.ToArray());

            Append("Finished injecting BetterDiscord");

            return 1;
        }

        private async Task<int> DownloadBd() {
            Append("Fetching latest hash");
           // var hash = await Utils.GetHash();
           // Append($"Latest hash: {hash}");

            var repo = "Jiiks";
            var branch = "stable16";
            var channel = $"https://github.com/{repo}/BetterDiscordApp/archive/{branch}.zip";
            var dest = $"{_formMain.DiscordPath}\\modules\\discord_desktop_core\\BetterDiscord.zip";

            Append("Downloading BetterDiscord package");

            using (var wc = new WebClient {Headers = Utils.Headers}) {
                wc.DownloadProgressChanged += (sender, args) => {
                    _synchronizationContext.Post(e => {
                        var state = (DownloadProgressChangedEventArgs) e;
                        pbStatus.Value = state.ProgressPercentage;
                    }, args);
                };

                Append($"Using channel: {channel}", true);
                Append($"Downloading to: {dest}", true);

                await wc.DownloadFileTaskAsync(channel, dest);

            }

            Append("Finished downloading BetterDiscord package");

            await ExtractBd(dest, $"{_formMain.DiscordPath}\\modules\\discord_desktop_core\\node_modules");

            return 1;
        }

        private async Task<int> ExtractBd(string path, string dest) {

            if (Directory.Exists($"{dest}\\BetterDiscord")) {
                Append("Deleting old BetterDiscord");
                Directory.Delete($"{dest}\\BetterDiscord", true);
            }

            if (Directory.Exists($"{dest}\\BetterDiscordApp-stable16")) {
                Append("Deleting old BetterDiscordApp-stable16");
                Directory.Delete($"{dest}\\BetterDiscordApp-stable16", true);
            }

            Append("Extracting BetterDiscord package");

            if (!File.Exists(path)) {
                Append($"BetterDiscord package does not exist in: {path}. Cannot continue.");
                _formMain.Fail();
                return 0;
            }

            var zar = ZipFile.OpenRead(path);

            if (!Directory.Exists(dest)) {
                Directory.CreateDirectory(dest);
            }

            zar.ExtractToDirectory(dest);
            zar.Dispose();
            if (!Directory.Exists($"{dest}\\BetterDiscordApp-stable16")) {
                Append($"BetterDiscord package does not exist in: {dest}\\BetterDiscordApp-stable16. Cannot continue.");
                _formMain.Fail();
                return 0;
            }

            Append("Renaming package dir", true);

            Directory.Move($"{dest}\\BetterDiscordApp-stable16", $"{dest}\\BetterDiscord");

            if (File.Exists(path)) {
                Append($"Deleting temp file {path}");
                File.Delete(path);
            }

            return 1;
        }

        private async Task<int> Verify() {
            
            Append("Verifying installation");

            var mainScreenPath = $"{_asarPath}\\core\\app\\mainScreen.js";
            var indexPath = $"{_asarPath}\\index.js";

            Append("Verifying: Discord files");
            if (!File.ReadAllText(indexPath).Contains("module.exports = require('./core');")) {
                Append($"{indexPath} NOT OK! Verification failed!");
                _formMain.Fail();
                return 0;
            }

            var mainScreen = File.ReadAllText(mainScreenPath);

            if (!mainScreen.Contains("var _betterDiscord = require('BetterDiscord');") && mainScreen.Contains("var _betterDiscord2;") && mainScreen.Contains("_betterDiscord2 = new _betterDiscord.BetterDiscord(mainWindow);")) {
                Append($"{mainScreenPath} NOT OK! Verification failed!");
                _formMain.Fail();
                return 0;
            }

            Append($"Verifying BetterDiscord package");
            var modulePath = $"{_formMain.DiscordPath}\\modules\\discord_desktop_core\\node_modules";

            if (!Directory.Exists(modulePath)) {
                Append($"{modulePath} does not exist! Verification failed!");
                _formMain.Fail();
                return 0;
            }

            var bdPath = $"{modulePath}\\BetterDiscord";

            if (!Directory.Exists(modulePath)) {
                Append($"{modulePath} does not exist! Verification failed!");
                _formMain.Fail();
                return 0;
            }

            var currentPath = $"{bdPath}\\lib";

            if (!Directory.Exists(currentPath)) {
                Append($"{currentPath} does not exist! Verification failed!");
                _formMain.Fail();
                return 0;
            }

            var bdFiles = new[]{"betterdiscord.js", "package.json", "lib\\BetterDiscord.js", "lib\\config.json", "lib\\Utils.js"};

            foreach (var bdFile in bdFiles) {
                if (File.Exists($"{bdPath}\\{bdFile}")) continue;
                Append($"{bdPath}\\{bdFile} does not exist! Verification failed!");
                _formMain.Fail();
                return 0;
            }
            
            Append("Verification successful");

            return 1;
        }

        public void ShowPanel() {

            _formMain.btnBack.HideDisable();
            _formMain.btnNext.HideDisable();
            _formMain.btnCancel.ShowDisable("Exit");

            rtbStatus.Text = "";
            Task.Run(InstallTask).ContinueWith(result => {
                Debug.WriteLine($"Install task finished with code: {result.Result}");
                if (result.Result == 0) _formMain.Fail();
                _synchronizationContext.Post(o => {
                    _formMain.btnCancel.ShowEnable("Exit");
                }, result);
            });

        }

        private bool LocateAsar() {
            Append($"Searching for Discord core in: {_asarPath}");

            if (!File.Exists($"{_asarPath}\\core.asar")) {
                Append($"core.asar does not exist in: {_asarPath}!");
                Append("Unable to continue installation.");
                return false;
            }

            Append($"Located core.asar in: {_asarPath}");
            return true;
        }

        public void HidePanel() {
        }

        public void SetForm(FormMain formMain) => _formMain = formMain;

        public string Title => "Installing";
        public UserControl Control => this;

        private void Append(string text, bool detailed = false) {
            _synchronizationContext.Post(o  => {
                if (!detailed) {
                    rtbStatus.AppendText((string) o);
                    rtbStatus.AppendText(Environment.NewLine);
                }
                rtbDetailed.AppendText((string)o);
                rtbDetailed.AppendText(Environment.NewLine);
                rtbStatus.ScrollToCaret();
                rtbDetailed.ScrollToCaret();
            }, text);
        }

        private void cbDetailed_CheckedChanged(object sender, EventArgs e) {
            rtbDetailed.Visible = cbDetailed.Checked;
            rtbStatus.Visible = !cbDetailed.Checked;
        }
    }
}
