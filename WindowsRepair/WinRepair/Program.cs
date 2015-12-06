using System;
using System.IO;
using System.Text.RegularExpressions;

namespace WinRepair
{
    class Program
    {
        static void Main(string[] args)
        {

            Console.WriteLine("WinRepair will delete all nonessential BetterDiscord/Discord files that might cause problems");
            Console.WriteLine("The following files/directories will be deleted");

            String appdata = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);

            
            String discordDir = appdata + "\\discord";
            String bdDir = appdata + "\\betterdiscord";

            Console.WriteLine(Environment.SpecialFolder.ApplicationData);

            if (Directory.Exists(bdDir))
            {
                foreach (string directory in Directory.GetDirectories(bdDir))
                {
                    Console.WriteLine(directory);
                }

                foreach (string file in Directory.GetFiles(bdDir))
                {
                    Console.WriteLine(file);
                }
            }

            if (Directory.Exists(discordDir))
            {
                if (Directory.Exists(discordDir + "\\cache"))
                {
                    Console.WriteLine(discordDir + "\\cache and all it's contents");   
                }
            }

            if (Directory.Exists(discordDir + "\\Local Storage"))
            {
                if (File.Exists(discordDir + "\\Local Storage\\https_discordapp.com_0.localstorage"))
                {
                    Console.WriteLine(discordDir + "\\Local Storage\\https_discordapp.com_0.localstorage");
                }
            }

            Console.WriteLine("Is this ok? Y/N");

            String response = Console.ReadLine().ToLower();

            if (Regex.IsMatch(response, "(yes|y)"))
            {

                if (Directory.Exists(bdDir))
                {
                    DeleteAndLogFiles(bdDir);
                }

                if (Directory.Exists(bdDir))
                {
                    DeleteAndLogDirectories(bdDir);
                }

                if (Directory.Exists(discordDir + "\\cache"))
                {
                    DeleteAndLogFiles(discordDir + "\\cache");
                }

                if (File.Exists(discordDir + "\\Local Storage\\https_discordapp.com_0.localstorage"))
                {
                    Console.WriteLine("Deleting: " + discordDir + "\\Local Storage\\https_discordapp.com_0.localstorage");
                    File.Delete(discordDir + "\\Local Storage\\https_discordapp.com_0.localstorage");
                }

                Console.WriteLine("All done");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
            }
            else
            {
                Console.WriteLine("Aborted");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
            }          
        }

        private static void DeleteAndLogFiles(String directory)
        {
            foreach (String file in Directory.GetFiles(directory))
            {
                Console.WriteLine("Deleting: " + file);
                File.Delete(file);
            }

            foreach (String dir in Directory.GetDirectories(directory))
            {
                DeleteAndLogFiles(dir);
            }
        }

        private static void DeleteAndLogDirectories(String directory)
        {
            Console.WriteLine("Cleaning: " + directory);

            Directory.Delete(directory, true);
        }
    }
}
