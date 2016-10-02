namespace BetterDiscordWI.panels
{
    partial class Panel0
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Panel0));
            this.label2 = new System.Windows.Forms.Label();
            this.richTextBox1 = new System.Windows.Forms.RichTextBox();
            this.radioDeclineLicense = new System.Windows.Forms.RadioButton();
            this.radioAcceptLicense = new System.Windows.Forms.RadioButton();
            this.SuspendLayout();
            // 
            // label2
            // 
            this.label2.Location = new System.Drawing.Point(35, 18);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(455, 31);
            this.label2.TabIndex = 5;
            this.label2.Text = "Please read the following License Agreement and accept the terms before continuin" +
    "g the installation.";
            // 
            // richTextBox1
            // 
            this.richTextBox1.Location = new System.Drawing.Point(38, 54);
            this.richTextBox1.Name = "richTextBox1";
            this.richTextBox1.ReadOnly = true;
            this.richTextBox1.Size = new System.Drawing.Size(452, 169);
            this.richTextBox1.TabIndex = 4;
            this.richTextBox1.Text = resources.GetString("richTextBox1.Text");
            // 
            // radioDeclineLicense
            // 
            this.radioDeclineLicense.AutoSize = true;
            this.radioDeclineLicense.Checked = true;
            this.radioDeclineLicense.Location = new System.Drawing.Point(108, 229);
            this.radioDeclineLicense.Name = "radioDeclineLicense";
            this.radioDeclineLicense.Size = new System.Drawing.Size(61, 17);
            this.radioDeclineLicense.TabIndex = 8;
            this.radioDeclineLicense.TabStop = true;
            this.radioDeclineLicense.Text = "Decline";
            this.radioDeclineLicense.UseVisualStyleBackColor = true;
            // 
            // radioAcceptLicense
            // 
            this.radioAcceptLicense.AutoSize = true;
            this.radioAcceptLicense.Location = new System.Drawing.Point(38, 229);
            this.radioAcceptLicense.Name = "radioAcceptLicense";
            this.radioAcceptLicense.Size = new System.Drawing.Size(59, 17);
            this.radioAcceptLicense.TabIndex = 7;
            this.radioAcceptLicense.Text = "Accept";
            this.radioAcceptLicense.UseVisualStyleBackColor = true;
            // 
            // Panel0
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.radioDeclineLicense);
            this.Controls.Add(this.radioAcceptLicense);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.richTextBox1);
            this.Name = "Panel0";
            this.Size = new System.Drawing.Size(524, 258);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.RichTextBox richTextBox1;
        private System.Windows.Forms.RadioButton radioDeclineLicense;
        private System.Windows.Forms.RadioButton radioAcceptLicense;
    }
}
