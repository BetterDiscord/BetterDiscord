$(function () {
    $(".channel-textarea-inner textarea").ready(function () {
        var availableTags = [
            "Kappa",
			"4Head"];

        $("#tags").on("keydown", function () {
            var newY = $(this).textareaHelper('caretPos').top + (parseInt($(this).css('font-size'), 10) * 1.5);
            var newX = $(this).textareaHelper('caretPos').left;
            var posString = "left+" + newX + "px top+" + newY + "px";
            $(this).autocomplete("option", "position", {
                my: "left top",
                at: "left top"
            });
        });

        $(".channel-textarea-inner textarea").autocomplete({
            source: availableTags
        });
    });
});
