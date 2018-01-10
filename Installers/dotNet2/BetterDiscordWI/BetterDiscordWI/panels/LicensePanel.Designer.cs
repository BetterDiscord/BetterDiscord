namespace BetterDiscordWI.panels {
    partial class LicensePanel {
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(LicensePanel));
            this.radioAccept = new System.Windows.Forms.RadioButton();
            this.radioDecline = new System.Windows.Forms.RadioButton();
            this.label1 = new System.Windows.Forms.Label();
            this.richTextBox1 = new System.Windows.Forms.RichTextBox();
            this.SuspendLayout();
            // 
            // radioAccept
            // 
            this.radioAccept.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.radioAccept.AutoSize = true;
            this.radioAccept.Location = new System.Drawing.Point(413, 286);
            this.radioAccept.Name = "radioAccept";
            this.radioAccept.Size = new System.Drawing.Size(59, 17);
            this.radioAccept.TabIndex = 0;
            this.radioAccept.Text = "Accept";
            this.radioAccept.UseVisualStyleBackColor = true;
            // 
            // radioDecline
            // 
            this.radioDecline.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.radioDecline.AutoSize = true;
            this.radioDecline.Checked = true;
            this.radioDecline.Location = new System.Drawing.Point(478, 286);
            this.radioDecline.Name = "radioDecline";
            this.radioDecline.Size = new System.Drawing.Size(61, 17);
            this.radioDecline.TabIndex = 1;
            this.radioDecline.TabStop = true;
            this.radioDecline.Text = "Decline";
            this.radioDecline.UseVisualStyleBackColor = true;
            // 
            // label1
            // 
            this.label1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.label1.Location = new System.Drawing.Point(3, 5);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(480, 13);
            this.label1.TabIndex = 2;
            this.label1.Text = "Please read the following License Agreement and accept the terms before continuin" +
    "g the installation.";
            // 
            // richTextBox1
            // 
            this.richTextBox1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.richTextBox1.Location = new System.Drawing.Point(3, 21);
            this.richTextBox1.Name = "richTextBox1";
            this.richTextBox1.Size = new System.Drawing.Size(533, 259);
            this.richTextBox1.TabIndex = 3;
            this.richTextBox1.Text = resources.GetString("richTextBox1.Text");
            // 
            // LicensePanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.richTextBox1);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.radioDecline);
            this.Controls.Add(this.radioAccept);
            this.Name = "LicensePanel";
            this.Size = new System.Drawing.Size(542, 306);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.RadioButton radioAccept;
        private System.Windows.Forms.RadioButton radioDecline;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.RichTextBox richTextBox1;
    }
}
