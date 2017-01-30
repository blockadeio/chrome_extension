/**
 * Process the events generated that are stored locally.
 *
 * Checks with local storage to see if we have any events and then sends them
 * along to the remote cloud node. If there are no events, we bail to avoid
 * making the call with no data.
 */
function processEvents() {
    return true;
    var events = JSON.parse(localStorage.cfg_events);
    for (var i = events.length -1; i >= 0 ; i--) {
        if (events[i].indicatorMatch === "test.blockade.io") {
            events.splice(i, 1);
        }
    }
    if (events.length === 0) {
        localStorage.cfg_events = JSON.stringify([]);
        return false;
    }

    $.ajax({
        url: localStorage.cfg_cloudUrl + 'send-event',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({'events': events}),
        contentType: "application/json",
        success: function(data) {
            if (data.success) {
                localStorage.cfg_events = JSON.stringify([]);
                var msg = chrome.i18n.getMessage("dbgProcessedEvents");
                if (localStorage.cfg_debug === 'true') { console.log(msg); }
            }
        }
    });
}

function clientConnect() {
    client.connectAll();
    client.emitAll('fetchDb');
    chrome.alarms.clear("clientConnect");
}

/**
 * Chrome alarm processor that will fire any time an alarm is generated.
 */
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "processEvents") {
        processEvents();
    } else if (alarm.name == "clientConnect") {
        clientConnect();
    }
});

// // Kick-off alarms
// if (localStorage.cfg_configured === 'true') {
//     chrome.alarms.create("processEvents",
//                          {delayInMinutes: 0.1, periodInMinutes: 0.5});
//     var frequency = parseInt(localStorage.cfg_dbUpdateTime);
//     chrome.alarms.create("databaseUpdate", {periodInMinutes: frequency});
// }
