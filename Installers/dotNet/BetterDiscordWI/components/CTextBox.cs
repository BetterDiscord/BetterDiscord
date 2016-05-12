using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BetterDiscordWI.components
{
    class CTextBox : TextBox
    {

        public bool CAutoSize
        {
            get { return AutoSize; }
            set { AutoSize = value; }
        }

    }
}
