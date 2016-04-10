function CustomCssEditor() { }

CustomCssEditor.prototype.init = function() {
var self = this;
self.hideBackdrop = false;
self.editor = CodeMirror.fromTextArea(document.getElementById("bd-custom-css-ta"), {
    lineNumbers: true,
    mode: 'css',
    indentUnit: 4,
    theme: 'neat'
});

self.editor.on("change", function (cm) {
    var css = cm.getValue();
    self.applyCustomCss(css, false, false);
});

var attachEditor="";
attachEditor += "<div id=\"bd-customcss-attach-controls\">";
attachEditor += "       <ul class=\"checkbox-group\">";
attachEditor += "       <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-0\" type=\"checkbox\" "+(settingsCookie["bda-css-0"] ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Update client css while typing\">Live Update<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "       <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-1\" type=\"checkbox\" "+(settingsCookie["bda-css-1"] ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Autosave css to localstorage when typing\">Autosave<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "        <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-2\" type=\"checkbox\" "+(customCssEditor.hideBackdrop ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Hide the callout backdrop to disable modal close events\">Hide Backdrop<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "   <\/ul>";
attachEditor += "   <div id=\"bd-customcss-detach-controls-buttons\">";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-update\" onclick=\"return false;\">Update<\/button>";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-save\"  onclick=\"return false;\">Save<\/button>";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-detach\" onclick=\"customCssEditor.detach(); return false;\">Detach</button>";
attachEditor += "   <\/div>";
attachEditor += "<\/div>";

this.attachEditor = attachEditor;

$("#bd-customcss-innerpane").append(attachEditor);

$("#bd-customcss-detached-update").on("click", function() {
        self.applyCustomCss(self.editor.getValue(), true, false);
        return false;
});
$("#bd-customcss-detached-save").on("click", function() {
        self.applyCustomCss(self.editor.getValue(), false, true);
        return false;
});


var detachEditor="";
    detachEditor += "<div id=\"bd-customcss-detach-container\">";
    detachEditor += "   <div id=\"bd-customcss-detach-editor\">";
    detachEditor += "   <\/div>";
    detachEditor += "<\/div>";
this.detachedEditor = detachEditor;
};

CustomCssEditor.prototype.attach = function() {
    $("#editor-detached").hide();
    $("#app-mount").removeClass("bd-detached-editor");
    $("#bd-customcss-pane").append($("#bd-customcss-innerpane"));
    $("#bd-customcss-detached-detach").show();
    $("#bd-customcss-detach-container").remove();
};

CustomCssEditor.prototype.detach = function() {
    var self = this;
    this.attach();
    $("#editor-detached").show();
    $("#bd-customcss-detached-detach").hide();
    $("#app-mount").addClass("bd-detached-editor");
    $(".app").parent().append(this.detachedEditor);
    $("#bd-customcss-detach-editor").append($("#bd-customcss-innerpane"));
};

CustomCssEditor.prototype.applyCustomCss = function (css, forceupdate, forcesave) {
    if ($("#customcss").length == 0) {
        $("head").append('<style id="customcss"></style>');
    }

    if(forceupdate || settingsCookie["bda-css-0"]) {
        $("#customcss").html(css);
    }

    if(forcesave || settingsCookie["bda-css-1"]) {
        localStorage.setItem("bdcustomcss", btoa(css));
    }
};