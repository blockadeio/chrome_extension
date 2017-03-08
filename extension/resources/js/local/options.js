function add_node() {
    var url = document.getElementById('cfg_cloudUrl').value;
    if (url === '') {
        var error = document.getElementById("error_message");
        error.innerHTML = "Address can't be blank.";
        setTimeout(function() {
            error.innerHTML = "";
        }, 3000);
        return false;
    }
    url = addProtocol(url);
    if (url.slice(-1) !== "/") {
        url += "/";
    }
    var contact = document.getElementById('cfg_contact').value;
    if (contact.indexOf('@') === -1 && contact !== '') {
        var error = document.getElementById("error_message");
        error.innerHTML = "Email was invalid.";
        setTimeout(function() {
            error.innerHTML = "";
        }, 3000);
        return false;
    }
    var channels = JSON.parse(localStorage.cfg_channels);
    var result = $.grep(channels, function(e){ return e.url == url; });
    if (result.length > 0) {
        var error = document.getElementById("error_message");
        error.innerHTML = "Address is already used.";
        setTimeout(function() {
            error.innerHTML = "";
        }, 3000);
        return false;
    }
    var username = document.getElementById('cfg_username').value;
    var api_key = document.getElementById('cfg_apiKey').value;
    channels.push({'id': channels.length, 'url': url, 'contact': contact,
                   'username': username, 'api_key': api_key});
    localStorage.cfg_channels = JSON.stringify(channels);
    document.getElementById('cfg_cloudUrl').value = '';
    document.getElementById('cfg_contact').value = '';
    document.getElementById('cfg_username').value = '';
    document.getElementById('cfg_apiKey').value = '';
    chrome.alarms.create("databaseUpdate",
                         {delayInMinutes: 0.1, periodInMinutes: 1.0});
    location.reload();
    loadContextMenus();
}

function save_options() {
    $('#save').toggleClass('btn-primary').toggleClass('btn-success');
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

    var url = document.getElementById('cfg_cloudUrl').value;
    if (url !== '') {
        add_node();
    }

    // Kick-off alarms to perform an update on the indicators
    chrome.alarms.create("processEvents",
                         {delayInMinutes: 0.1, periodInMinutes: 0.5});
    chrome.alarms.create("databaseUpdate",
                         {delayInMinutes: 0.1, periodInMinutes: 1.0});
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
    var select_fields = ['cfg_debug', 'cfg_notifications', 'cfg_feedback'];
    for (i = 0; i < select_fields.length; i++) {
        var radio = document.getElementsByName(select_fields[i]);
        for (var j = 0, length = radio.length; j < length; j++) {
            if (radio[j].value == localStorage[select_fields[i]]) {
                radio[j].checked = true;
            }
        }
    }

    var channels = JSON.parse(localStorage.cfg_channels);
    var rows = [];
    for (i = 0; i < channels.length; i++) {
        var columns = [];
        columns.push($('<td/>').append(channels[i].url));
        columns.push($('<td/>').append(channels[i].contact));
        columns.push($('<td/>').append(channels[i].username));
        columns.push($('<td/>').append(channels[i].api_key));
        var btn = $('<button/>', {
            class: 'btn btn-xs btn-danger remove-node',
            text: '-',
            id: channels[i].id
        });
        columns.push($('<td/>').append(btn));
        var row = $('<tr/>').append(columns);
        rows.push(row);
    }
    $("tbody#nodes").empty().append(rows);
    $('.remove-node').click(function(item) {
        for (i = 0; i < channels.length; i++) {
            if (channels[i].id !== parseInt(this.id)) {
                continue;
            }
            channels.splice(i, 1);
            localStorage.cfg_channels = JSON.stringify(channels);
            location.reload();
            loadContextMenus();
        }
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#add_node').addEventListener('click', add_node);
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


