function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function populate_url() {
    var redirect = getParameterByName('redirect');
    var parser = document.createElement('a');
    parser.href = redirect;
    var obj = JSON.parse(localStorage[parser.hostname]);
    document.getElementById("details").innerHTML = JSON.stringify(obj, null, '\t');
    localStorage.removeItem(parser.hostname);
    var rand = Math.floor(Math.random()*90000) + 10000;
    document.getElementById("proceed").href = redirect + "#LTBYPASS-" + rand;
    document.getElementById("go-back").onclick = function() {
        localStorage.removeItem(parser.hostname);
        if (document.referrer !== "") {
            window.history.back();
        } else {
            window.location = "about:blank";
        }
    };
    document.getElementById("go-back").innerHTML = chrome.i18n.getMessage("warningLeaveMessage");
    document.getElementById("proceed").innerHTML = chrome.i18n.getMessage("warningProceedMessage");
    document.getElementById("alertTitle").innerHTML = chrome.i18n.getMessage("warningAlertTitle");
    document.getElementById("alertCore").innerHTML = chrome.i18n.getMessage("warningAlertMessage", [parser.hostname]);
}

document.addEventListener('DOMContentLoaded', populate_url);
