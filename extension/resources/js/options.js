function save_options() {
    $('#save').toggleClass('btn-primary').toggleClass('btn-success');
    var input_fields = ['cfg_cloudUrl'];
    var i, field, value, select_fields;
    for (i = 0; i < input_fields.length; i++) {
        field = input_fields[i];
        value = document.getElementById(field).value;
        localStorage[field] = value;
    }

    select_fields = ['cfg_debug', 'cfg_notifications', 'cfg_feedback'];
    for (i = 0; i < select_fields.length; i++) {
        var radio = document.getElementsByName(select_fields[i]);
        for (var j = 0, length = radio.length; j < length; j++) {
            if (radio[j].checked) {
                localStorage[select_fields[i]] = radio[j].value;
                break;
            }
        }
    }

    // Kick-off alarms to perform an update on the indicators
    chrome.alarms.create("processEvents",
                         {delayInMinutes: 0.1, periodInMinutes: 0.5});
    var frequency = parseInt(localStorage.cfg_dbUpdateTime);
    chrome.alarms.create("databaseUpdate",
                         {delayInMinutes: 0.1, periodInMinutes: frequency});
    localStorage.cfg_configured = true;

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = chrome.i18n.getMessage("optionsConfigSaved");
    setTimeout(function() {
        status.innerHTML = "";
        $('#save').toggleClass('btn-primary').toggleClass('btn-success');
    }, 3000);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var input_fields = ['cfg_cloudUrl'];
    var i, field;
    for (i = 0; i < input_fields.length; i++) {
        field = input_fields[i];
        document.getElementById(field).value = localStorage[field];
    }

    var select_fields = ['cfg_debug', 'cfg_notifications', 'cfg_feedback'];
    for (i = 0; i < select_fields.length; i++) {
        var radio = document.getElementsByName(select_fields[i]);
        for (var j = 0, length = radio.length; j < length; j++) {
            if (radio[j].value == localStorage[select_fields[i]]) {
                radio[j].checked = true;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.getElementById("serverUrl").innerHTML = chrome.i18n.getMessage("optionsServerUrl");
document.getElementById("showNotifications").innerHTML = chrome.i18n.getMessage("optionsShowNotifications");
document.getElementById("analystAssist").innerHTML = chrome.i18n.getMessage("optionsAnalystAssist");
document.getElementById("debugMode").innerHTML = chrome.i18n.getMessage("optionsDebugMode");
document.getElementById("save").innerHTML = chrome.i18n.getMessage("optionsSaveConfig");
document.getElementById("optionsServerUrlTooltip").setAttribute("title", chrome.i18n.getMessage("optionsServerUrlTooltip"));
document.getElementById("optionsShowNotificationsTooltip").setAttribute("title", chrome.i18n.getMessage("optionsShowNotificationsTooltip"));
document.getElementById("optionsAnalystAssistTooltip").setAttribute("title", chrome.i18n.getMessage("optionsAnalystAssistTooltip"));
document.getElementById("optionsDebugModeTooltip").setAttribute("title", chrome.i18n.getMessage("optionsDebugModeTooltip"));
var onElements = document.getElementsByClassName("on");
for (var j = 0, length = onElements.length; j < length; j++) {
    onElements[j].innerHTML = chrome.i18n.getMessage("optionsOn");
}
var offElements = document.getElementsByClassName("off");
for (var j = 0, length = offElements.length; j < length; j++) {
    offElements[j].innerHTML = chrome.i18n.getMessage("optionsOff");
}
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});