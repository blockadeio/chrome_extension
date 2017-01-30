function populate_setup() {
    chrome.alarms.create("setupWait",
                         {delayInMinutes: 0, periodInMinutes: 0.1});
    document.getElementById("setupTitle").innerHTML = chrome.i18n.getMessage("setupTitle");
    document.getElementById("setupCore").innerHTML = chrome.i18n.getMessage("setupCore");
    document.getElementById("setupQ1").innerHTML = chrome.i18n.getMessage("setupQ1");
    document.getElementById("setupA1").innerHTML = chrome.i18n.getMessage("setupA1");
    document.getElementById("status").innerHTML = chrome.i18n.getMessage("setupSyncing");
    chrome.alarms.create("databaseUpdate",
                         {delayInMinutes: 0.1, periodInMinutes: 5});
    var statusCheck = setInterval(function () {
        var msg;
        if (parseInt(localStorage.cfg_lastIndicatorCount) > 0) {
            msg = "All done! <a href='demo.html' class='test'>Test extension</a>.";
            document.getElementById('loading').style.visibility = "hidden";
            document.getElementById("status").innerHTML = msg;
            localStorage.cfg_configured = true;
            clearInterval(statusCheck);
            var frequency = parseInt(localStorage.cfg_dbUpdateTime);
            chrome.alarms.create("databaseUpdate", {periodInMinutes: frequency});
            chrome.alarms.clear("setupWait");
        }

        if (parseInt(localStorage.cfg_lastIndicatorCount) === -1) {
            msg = "Hmm, we're having issues connecting to the cloud nodes. Please check your Internet connection and the nodes configured in the <a href='options.html'>options page</a>.";
            document.getElementById('loading').style.visibility = "hidden";
            document.getElementById("status").innerHTML = msg;
            localStorage.cfg_configured = true;
        }
    }, 1000);
}
document.addEventListener('DOMContentLoaded', populate_setup);