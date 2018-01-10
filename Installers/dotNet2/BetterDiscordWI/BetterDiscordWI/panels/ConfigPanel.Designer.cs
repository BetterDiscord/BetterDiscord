namespace BetterDiscordWI.panels {
    partial class ConfigPanel {
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
            this.label1 = new System.Windows.Forms.Label();
            this.tbPath = new System.Windows.Forms.TextBox();
            this.btnBrowse = new BetterDiscordWI.controls.Button();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.cbRestart = new System.Windows.Forms.CheckBox();
            this.cbCanary = new System.Windows.Forms.CheckBox();
            this.cbPtb = new System.Windows.Forms.CheckBox();
            this.lblCanarywarning = new System.Windows.Forms.Label();
            this.lblPtbwarning = new System.Windows.Forms.Label();
            this.cbStable = new System.Windows.Forms.CheckBox();
            this.lblStablewarning = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(3, 3);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(380, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Setup will install BetterDiscord to the following location. Click Install to cont" +
    "inue.";
            // 
            // tbPath
            // 
            this.tbPath.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbPath.Location = new System.Drawing.Point(6, 31);
            this.tbPath.Name = "tbPath";
            this.tbPath.ReadOnly = true;
            this.tbPath.Size = new System.Drawing.Size(377, 20);
            this.tbPath.TabIndex = 1;
            // 
            // btnBrowse
            // 
            this.btnBrowse.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.btnBrowse.Location = new System.Drawing.Point(389, 31);
            this.btnBrowse.Name = "btnBrowse";
            this.btnBrowse.Size = new System.Drawing.Size(75, 23);
            this.btnBrowse.TabIndex = 2;
            this.btnBrowse.Text = "Browse";
            this.btnBrowse.UseVisualStyleBackColor = true;
            this.btnBrowse.Click += new System.EventHandler(this.btnBrowse_Click);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(3, 66);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(422, 13);
            this.label2.TabIndex = 3;
            this.label2.Text = "*If the path is not pointing to the latest version of Discord then click browse a" +
    "nd select it.";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(3, 79);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(161, 13);
            this.label3.TabIndex = 4;
            this.label3.Text = "*Installer will kill Discord process.";
            // 
            // cbRestart
            // 
            this.cbRestart.AutoSize = true;
            this.cbRestart.Location = new System.Drawing.Point(6, 106);
            this.cbRestart.Name = "cbRestart";
            this.cbRestart.Size = new System.Drawing.Size(175, 17);
            this.cbRestart.TabIndex = 5;
            this.cbRestart.Text = "Restart Discord after installation";
            this.cbRestart.UseVisualStyleBackColor = true;
            this.cbRestart.CheckedChanged += new System.EventHandler(this.cbRestart_CheckedChanged);
            // 
            // cbCanary
            // 
            this.cbCanary.AutoSize = true;
            this.cbCanary.Location = new System.Drawing.Point(6, 150);
            this.cbCanary.Name = "cbCanary";
            this.cbCanary.Size = new System.Drawing.Size(137, 17);
            this.cbCanary.TabIndex = 6;
            this.cbCanary.Text = "Install to DiscordCanary";
            this.cbCanary.UseVisualStyleBackColor = true;
            this.cbCanary.CheckedChanged += new System.EventHandler(this.cbCanary_CheckedChanged);
            // 
            // cbPtb
            // 
            this.cbPtb.AutoSize = true;
            this.cbPtb.Location = new System.Drawing.Point(6, 173);
            this.cbPtb.Name = "cbPtb";
            this.cbPtb.Size = new System.Drawing.Size(125, 17);
            this.cbPtb.TabIndex = 7;
            this.cbPtb.Text = "Install to DiscordPTB";
            this.cbPtb.UseVisualStyleBackColor = true;
            this.cbPtb.CheckedChanged += new System.EventHandler(this.cbPtb_CheckedChanged);
            // 
            // lblCanarywarning
            // 
            this.lblCanarywarning.AutoSize = true;
            this.lblCanarywarning.ForeColor = System.Drawing.Color.Red;
            this.lblCanarywarning.Location = new System.Drawing.Point(149, 151);
            this.lblCanarywarning.Name = "lblCanarywarning";
            this.lblCanarywarning.Size = new System.Drawing.Size(97, 13);
            this.lblCanarywarning.TabIndex = 8;
            this.lblCanarywarning.Text = "(Canary not found!)";
            this.lblCanarywarning.Visible = false;
            // 
            // lblPtbwarning
            // 
            this.lblPtbwarning.AutoSize = true;
            this.lblPtbwarning.ForeColor = System.Drawing.Color.Red;
            this.lblPtbwarning.Location = new System.Drawing.Point(149, 173);
            this.lblPtbwarning.Name = "lblPtbwarning";
            this.lblPtbwarning.Size = new System.Drawing.Size(85, 13);
            this.lblPtbwarning.TabIndex = 9;
            this.lblPtbwarning.Text = "(PTB not found!)";
            this.lblPtbwarning.Visible = false;
            // 
            // cbStable
            // 
            this.cbStable.AutoSize = true;
            this.cbStable.Location = new System.Drawing.Point(6, 127);
            this.cbStable.Name = "cbStable";
            this.cbStable.Size = new System.Drawing.Size(98, 17);
            this.cbStable.TabIndex = 10;
            this.cbStable.Text = "Install to Stable";
            this.cbStable.UseVisualStyleBackColor = true;
            this.cbStable.CheckedChanged += new System.EventHandler(this.cbStable_CheckedChanged);
            // 
            // lblStablewarning
            // 
            this.lblStablewarning.AutoSize = true;
            this.lblStablewarning.ForeColor = System.Drawing.Color.Red;
            this.lblStablewarning.Location = new System.Drawing.Point(149, 128);
            this.lblStablewarning.Name = "lblStablewarning";
            this.lblStablewarning.Size = new System.Drawing.Size(97, 13);
            this.lblStablewarning.TabIndex = 11;
            this.lblStablewarning.Text = "(Canary not found!)";
            this.lblStablewarning.Visible = false;
            // 
            // ConfigPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.lblStablewarning);
            this.Controls.Add(this.cbStable);
            this.Controls.Add(this.lblPtbwarning);
            this.Controls.Add(this.lblCanarywarning);
            this.Controls.Add(this.cbPtb);
            this.Controls.Add(this.cbCanary);
            this.Controls.Add(this.cbRestart);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.btnBrowse);
            this.Controls.Add(this.tbPath);
            this.Controls.Add(this.label1);
            this.Name = "ConfigPanel";
            this.Size = new System.Drawing.Size(538, 284);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox tbPath;
        private controls.Button btnBrowse;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.CheckBox cbRestart;
        private System.Windows.Forms.CheckBox cbCanary;
        private System.Windows.Forms.CheckBox cbPtb;
        private System.Windows.Forms.Label lblCanarywarning;
        private System.Windows.Forms.Label lblPtbwarning;
        private System.Windows.Forms.CheckBox cbStable;
        private System.Windows.Forms.Label lblStablewarning;
    }
}
