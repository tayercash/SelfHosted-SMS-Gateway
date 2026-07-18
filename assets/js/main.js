function getQueryVariable(variable, meth = 1, link = "") {
    if (meth == 1) {
        var query = window.location.search.substring(1);
    } else {
        var query = link.split("?")[1];
    }
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

window.addEventListener('resize', resize_text, true);
function resize_text() {
    var text_class = "mou_resize_text";
    var text_size = 8;
    elmnt = $("." + text_class);

    $(elmnt).each(function () {
        text_size = parseInt($(this).attr("data-textsize"));
        elmnt_width = $(this).parent().width();
        new_text_size = text_size / 100 * elmnt_width;
        $(this)[0].style.setProperty('font-size', new_text_size + "px", 'important');
    });

}
Array.prototype.Unshift = function (val) {
    const activePanelKey = sessionStorage.getItem('active_nav_url') || 'default';
    if (typeof what_window["back_buttons_functions_" + activePanelKey] == "undefined") {
        what_window["back_buttons_functions_" + activePanelKey] = [];
    }
    what_window["back_buttons_functions_" + activePanelKey].unshift(val);
}

var close_app_now = false;
function showToast(text, type) {
    const bg = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff';
    Toastify({ text: text, duration: 4000, gravity: "top", position: "center", style: { background: bg } }).showToast();
}

$(document).on("keydown", function (e) {
    if (e.key === "Escape" && !$(e.target).is("input, textarea, select")) back_button_clicked();
});

function back_button_clicked(index = false) {
    if (index == true) {

    } else {
        const activePanelKey = sessionStorage.getItem('active_nav_url') || 'default';

        if (typeof what_window["back_buttons_functions_" + activePanelKey] !== "undefined" && what_window["back_buttons_functions_" + activePanelKey].length > 0) {
            if (typeof what_window["back_buttons_functions_" + activePanelKey][0] == "function") {
                what_window["back_buttons_functions_" + activePanelKey][0]();
            }
            what_window["back_buttons_functions_" + activePanelKey].shift();
        } else {

            if (close_app_now == true) {
                if (typeof mouscripts !== 'undefined' && typeof mouscripts.exit_app === 'function') {
                    mouscripts.exit_app();
                }
            } else {
                if (typeof mouscripts !== 'undefined' && typeof mouscripts.showToast === 'function') {
                    mouscripts.showToast(typeof t === 'function' ? t('common.press_back_exit') : "Press Back Button Again To Exit App.");
                }
                close_app_now = true;
                close_app_now_time_out = setTimeout(function () {
                    close_app_now = false;
                }, 1000 * 2);
            }
        }
    }
}