using System;
using System.Net;
using System.Threading.Tasks;

namespace BetterDiscordWI {
    public static class Utils {

        public static WebHeaderCollection Headers = new WebHeaderCollection { ["User-Agent"] = "Mozilla/5.0" };

        public static async Task<string> GetHash() {
            using (var wc = new WebClient { Headers = Headers }) {
                var result = await wc.DownloadStringTaskAsync(@"https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master");

                var start = result.IndexOf("{\"sha\":") + 8;
                var end = result.IndexOf("\",\"") - 8;

                return result.Substring(start, end);
            }
        }

    }
}
