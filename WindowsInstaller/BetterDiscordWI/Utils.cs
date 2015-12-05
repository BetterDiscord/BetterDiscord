using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BetterDiscordWI
{
    class Utils
    {


        public void StartDownload(ProgressBar pb, String url, String name)
        {

           

            Thread t = new Thread(() =>
            {
                WebClient webClient = new WebClient();
                webClient.Headers["User-Agent"] = "Mozilla/5.0";
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

        public static String GetHash()
        {
            WebClient wc = new WebClient();
            wc.Headers["User-Agent"] = "Mozilla/5.0";
            String result = wc.DownloadString("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master");

            int start = result.IndexOf("{\"sha\":");
            int end = result.IndexOf("\",\"");

            return result.Substring(start + 8, end - 8);
        }


    }
}
