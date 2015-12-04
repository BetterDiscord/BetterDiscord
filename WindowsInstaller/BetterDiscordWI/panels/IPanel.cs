using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace BetterDiscordWI.panels
{
    interface IPanel
    {

        void SetVisible();
        FormMain GetParent();
        void BtnNext();
        void BtnPrev();

    }
}
