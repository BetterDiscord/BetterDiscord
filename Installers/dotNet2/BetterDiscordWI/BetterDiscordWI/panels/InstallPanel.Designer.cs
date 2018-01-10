namespace BetterDiscordWI.panels {
    partial class InstallPanel {
        /// <summary> 
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent() {
            this.rtbStatus = new System.Windows.Forms.RichTextBox();
            this.pbStatus = new System.Windows.Forms.ProgressBar();
            this.cbDetailed = new System.Windows.Forms.CheckBox();
            this.rtbDetailed = new System.Windows.Forms.RichTextBox();
            this.SuspendLayout();
            // 
            // rtbStatus
            // 
            this.rtbStatus.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.rtbStatus.Location = new System.Drawing.Point(3, 3);
            this.rtbStatus.Name = "rtbStatus";
            this.rtbStatus.Size = new System.Drawing.Size(492, 126);
            this.rtbStatus.TabIndex = 0;
            this.rtbStatus.Text = "";
            // 
            // pbStatus
            // 
            this.pbStatus.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.pbStatus.Location = new System.Drawing.Point(67, 135);
            this.pbStatus.Name = "pbStatus";
            this.pbStatus.Size = new System.Drawing.Size(428, 23);
            this.pbStatus.TabIndex = 1;
            // 
            // cbDetailed
            // 
            this.cbDetailed.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.cbDetailed.AutoSize = true;
            this.cbDetailed.Location = new System.Drawing.Point(4, 138);
            this.cbDetailed.Name = "cbDetailed";
            this.cbDetailed.Size = new System.Drawing.Size(58, 17);
            this.cbDetailed.TabIndex = 2;
            this.cbDetailed.Text = "Details";
            this.cbDetailed.UseVisualStyleBackColor = true;
            this.cbDetailed.CheckedChanged += new System.EventHandler(this.cbDetailed_CheckedChanged);
            // 
            // rtbDetailed
            // 
            this.rtbDetailed.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.rtbDetailed.Location = new System.Drawing.Point(3, 3);
            this.rtbDetailed.Name = "rtbDetailed";
            this.rtbDetailed.Size = new System.Drawing.Size(492, 126);
            this.rtbDetailed.TabIndex = 3;
            this.rtbDetailed.Text = "";
            this.rtbDetailed.Visible = false;
            // 
            // InstallPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.rtbDetailed);
            this.Controls.Add(this.cbDetailed);
            this.Controls.Add(this.pbStatus);
            this.Controls.Add(this.rtbStatus);
            this.Name = "InstallPanel";
            this.Size = new System.Drawing.Size(501, 166);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.RichTextBox rtbStatus;
        private System.Windows.Forms.ProgressBar pbStatus;
        private System.Windows.Forms.CheckBox cbDetailed;
        private System.Windows.Forms.RichTextBox rtbDetailed;
    }
}
