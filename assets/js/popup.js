// start pop_up_script
readypopups();
function readypopups() {
    $(document).off("click", "[data-openpopup]");
    $(document).off("click", "[data-closepopup],[data-dismisspopup]");
    $(document).off("click", ".mou_popup");
    $(document).on("click", "[data-openpopup]", function () {
        fadein_sec = 1;
        this_popup_id = $(this).attr("data-openpopup");
        $("#" + this_popup_id).openpopup();
    });
    $(document).on("click", "[data-closepopup],[data-dismisspopup]", function (e) {
        e.preventDefault();
        this_popup_id = $(this).parents(".mou_popup");
        $(this_popup_id).closepopup();
    });
    $(document).on("click", ".mou_popup", function (e) {
        if (e.target !== this) return;
        if ($(this).attr("data-lockpopup") !== "true") {
            $("#" + $(this).attr("id")).closepopup();
        }
    })
}
var on_closepopups = {};
(function ($) {
    $.fn.extend({
        openpopup: function () {
            const $this = $(this);
            if (!$this.parent().is("body")) {
                $("body").append($this);
            }
            $this.removeClass("hide");
            void $this[0].offsetHeight;
            $this.addClass("show");
            $("body").css("overflow", "hidden");

            if (window.what_window) {
                const panel = sessionStorage.getItem('active_nav_url') || 'default';
                const key = "back_buttons_functions_" + panel;
                if (typeof what_window[key] === "undefined") {
                    what_window[key] = [];
                }
                what_window[key].Unshift(() => $this.closepopup("back_button"));
            }
            return $this;
        },
        closepopup: function (from_where) {
            if (from_where === undefined) from_where = "normal";
            const $this = $(this);
            $this.removeClass("show").addClass("hide");
            $("body").css("overflow", "unset");

            if (from_where !== "back_button" && window.what_window) {
                const panel = sessionStorage.getItem('active_nav_url') || 'default';
                const key = "back_buttons_functions_" + panel;
                if (typeof what_window[key] !== "undefined") {
                    what_window[key].shift();
                }
            }
            if (typeof on_closepopups[$this.attr("id")] !== "undefined") {
                on_closepopups[$this.attr("id")]();
            }
            return $this;
        },
        on_closepopup: function (callback) {
            on_closepopups[$(this).attr("id")] = callback;
        }
    });
})(jQuery);
// end popup scrpit