using System;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace BetterDiscordWI
{
    class Utils
    {
        public void StartDownload(ProgressBar pb, string url, string name)
        {
            Thread t = new Thread(() =>
            {
                WebClient webClient = new WebClient {Headers = {["User-Agent"] = "Mozilla/5.0"}};
                webClient.DownloadProgressChanged += delegate(object sender, DownloadProgressChangedEventArgs args)
                {                   
                    double percentage = (double.Parse(args.BytesReceived.ToString()) /double.Parse(args.TotalBytesToReceive.ToString())) * 100;
                    Debug.Print(percentage.ToString());
                    pb.Invoke((MethodInvoker) delegate
                    {
                        pb.Value = (int)Math.Truncate(percentage);
                    });

                };


                webClient.DownloadFile(new Uri(url), Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + "\\BetterDiscord\\temp\\" + name);

            });

            t.Start();
        }

        public static string GetHash()
        {
            WebClient wc = new WebClient {Headers = {["User-Agent"] = "Mozilla/5.0"}};
            string result = wc.DownloadString(@"https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master");

            int start = result.IndexOf("{\"sha\":");
            int end = result.IndexOf("\",\"");

            return result.Substring(start + 8, end - 8);
        }
    }
}