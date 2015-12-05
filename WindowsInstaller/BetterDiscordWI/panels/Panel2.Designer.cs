namespace BetterDiscordWI.panels
{
    partial class Panel2
    {
        /// <summary> 
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.pbMain = new System.Windows.Forms.ProgressBar();
            this.rtLog = new System.Windows.Forms.RichTextBox();
            this.SuspendLayout();
            // 
            // pbMain
            // 
            this.pbMain.Location = new System.Drawing.Point(3, 267);
            this.pbMain.Name = "pbMain";
            this.pbMain.Size = new System.Drawing.Size(518, 16);
            this.pbMain.TabIndex = 0;
            // 
            // rtLog
            // 
            this.rtLog.Location = new System.Drawing.Point(3, 3);
            this.rtLog.Name = "rtLog";
            this.rtLog.Size = new System.Drawing.Size(518, 252);
            this.rtLog.TabIndex = 1;
            this.rtLog.Text = "";
            // 
            // Panel2
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.rtLog);
            this.Controls.Add(this.pbMain);
            this.Name = "Panel2";
            this.Size = new System.Drawing.Size(524, 258);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.ProgressBar pbMain;
        private System.Windows.Forms.RichTextBox rtLog;
    }
}
