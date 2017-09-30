namespace BetterDiscordWI
{
    partial class FormMain
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

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FormMain));
            this.btnCancel = new System.Windows.Forms.Button();
            this.panelContainer = new System.Windows.Forms.Panel();
            this.btnNext = new System.Windows.Forms.Button();
            this.btnBack = new System.Windows.Forms.Button();
            this.lblPanelTitle = new System.Windows.Forms.Label();
            this.panel1 = new System.Windows.Forms.Panel();
            this.SuspendLayout();
            // 
            // btnCancel
            // 
            this.btnCancel.Location = new System.Drawing.Point(438, 328);
            this.btnCancel.Name = "btnCancel";
            this.btnCancel.Size = new System.Drawing.Size(75, 23);
            this.btnCancel.TabIndex = 0;
            this.btnCancel.Text = "Cancel";
            this.btnCancel.UseVisualStyleBackColor = true;
            // 
            // panelContainer
            // 
            this.panelContainer.BackColor = System.Drawing.SystemColors.Control;
            this.panelContainer.Location = new System.Drawing.Point(0, 52);
            this.panelContainer.Name = "panelContainer";
            this.panelContainer.Size = new System.Drawing.Size(524, 258);
            this.panelContainer.TabIndex = 0;
            // 
            // btnNext
            // 
            this.btnNext.Enabled = false;
            this.btnNext.Location = new System.Drawing.Point(357, 328);
            this.btnNext.Name = "btnNext";
            this.btnNext.Size = new System.Drawing.Size(75, 23);
            this.btnNext.TabIndex = 4;
            this.btnNext.Text = "Next >";
            this.btnNext.UseVisualStyleBackColor = true;
            // 
            // btnBack
            // 
            this.btnBack.Enabled = false;
            this.btnBack.Location = new System.Drawing.Point(276, 328);
            this.btnBack.Name = "btnBack";
            this.btnBack.Size = new System.Drawing.Size(75, 23);
            this.btnBack.TabIndex = 5;
            this.btnBack.Text = "< Back";
            this.btnBack.UseVisualStyleBackColor = true;
            // 
            // lblPanelTitle
            // 
            this.lblPanelTitle.AutoSize = true;
            this.lblPanelTitle.BackColor = System.Drawing.SystemColors.Window;
            this.lblPanelTitle.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblPanelTitle.Location = new System.Drawing.Point(61, 16);
            this.lblPanelTitle.Name = "lblPanelTitle";
            this.lblPanelTitle.Size = new System.Drawing.Size(103, 16);
            this.lblPanelTitle.TabIndex = 6;
            this.lblPanelTitle.Text = "BetterDiscord";
            // 
            // panel1
            // 
            this.panel1.BackColor = System.Drawing.SystemColors.Window;
            this.panel1.BackgroundImage = global::BetterDiscordWI.Properties.Resources.bd_logo_large_nobg;
            this.panel1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom;
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(64, 46);
            this.panel1.TabIndex = 0;
            // 
            // FormMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(524, 361);
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.lblPanelTitle);
            this.Controls.Add(this.btnBack);
            this.Controls.Add(this.panelContainer);
            this.Controls.Add(this.btnCancel);
            this.Controls.Add(this.btnNext);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "FormMain";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Setup - BetterDiscord ";
            this.TransparencyKey = System.Drawing.Color.LimeGreen;
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Panel panelContainer;
        public System.Windows.Forms.Button btnNext;
        public System.Windows.Forms.Button btnBack;
        public System.Windows.Forms.Label lblPanelTitle;
        private System.Windows.Forms.Panel panel1;
        public System.Windows.Forms.Button btnCancel;







    }
}

