/**
 * Process the events generated that are stored locally.
 *
 * Checks with local storage to see if we have any events and then sends them
 * along to the remote cloud node. If there are no events, we bail to avoid
 * making the call with no data.
 */
function processEvents() {
    var events = JSON.parse(localStorage.cfg_events);
    // Prune out our demo code
    for (var i = events.length -1; i >= 0 ; i--) {
        if (events[i].indicatorMatch === "test.blockade.io") {
            events.splice(i, 1);
        }
    }

    if (events.length === 0) {
        localStorage.cfg_events = JSON.stringify([]);
        return false;
    }

    var channels = JSON.parse(localStorage.cfg_channels);
    if (channels.length === 0) {
        msg = chrome.i18n.getMessage("dbgNoServer");
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        return false;
    }

    var promises = [];
    for (var i=0; i < channels.length; i++) {
        var data = new FormData();
        var matchedEvents = [];
        for (var j=0; j < events.length; j++) {
            toNotify = blockade.indicators[events[j].hashMatch];
            if (toNotify.indexOf(channels[i].id) === -1) {
                continue;
            }
            events[j].contact = channels[i].contact;
            matchedEvents.push(events[j]);
        }
        var properties = {method: "POST",
                          body: JSON.stringify({'events': matchedEvents}),
                          headers: {"Content-Type": "application/json"}};
        promises.push(fetch(channels[i].url + 'send-events', properties));
    }
    Promise
    .all(promises)
    .then(function(response) {
        var blobs = [];
        for (var i=0; i < response.length; i++) {
            blobs.push(response[i].json());
        }
        return Promise.all(blobs);
    })
    .then(function(blobs) {
        localStorage.cfg_events = JSON.stringify([]);
        var msg = chrome.i18n.getMessage("dbgProcessedEvents");
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        // _gaq.push(['_trackEvent', 'extension', 'submit_events']);
    })
    .catch(function(error) {
        var message = chrome.i18n.getMessage("notifyRequestError",
                                             ["URL", error.message]);
        chrome.notifications.create('alert', {
            type: 'basic',
            iconUrl: ICON_LARGE,
            title: chrome.i18n.getMessage("notifyRequestErrorTitle"),
            message: message
        }, function(notificationId) {
            msg = chrome.i18n.getMessage("dbgNotificationCreated");
            if (localStorage.cfg_debug === 'true') { console.log(msg); }
        });
        // _gaq.push(['_trackEvent', 'extension', 'submit_events_failure']);
    });
}

/**
 * Update the local signature database with our definitions from the cloud.
 *
 * The storage structure for indicators is aimed to make the processing of
 * web requests as efficient as possible. Having multiple buckets to store
 * indicators based on the starting positions ensures we are only loading a
 * subset of the entire indicator definition.
 */
function databaseUpdate() {
    var channels = JSON.parse(localStorage.cfg_channels);
    if (channels.length === 0) {
        msg = chrome.i18n.getMessage("dbgNoServer");
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        return false;
    }
    localStorage.cfg_isRunning = true;

    var promises = [];
    for (var i=0; i < channels.length; i++) {
        promises.push(fetch(channels[i].url + 'get-indicators'));
    }
    Promise
    .all(promises)
    .then(function(response) {
        var blobs = [];
        for (var i=0; i < response.length; i++) {
            blobs.push(response[i].json());
        }
        return Promise.all(blobs);
    })
    .then(function(blobs) {
        for (var i=0; i < blobs.length; i++) {
            if (!blobs[i].success) {
                continue;
            }
            // Promises should return in order
            blobs[i].source = channels[i].id;
            blockade.addSource(blobs[i]);
        }
        blockade.finalize();
        // _gaq.push(['_trackEvent', 'extension', 'get_indicators']);
    })
    .catch(function(error) {
        var message = chrome.i18n.getMessage("notifyRequestError",
                                             ['URL', error.message]);
        chrome.notifications.create('alert', {
            type: 'basic',
            iconUrl: ICON_LARGE,
            title: chrome.i18n.getMessage("notifyRequestErrorTitle"),
            message: message
        }, function(notificationId) {
            msg = chrome.i18n.getMessage("dbgNotificationCreated");
            if (localStorage.cfg_debug === 'true') { console.log(msg); }
        });
        localStorage.cfg_lastIndicatorCount = -1;
        // _gaq.push(['_trackEvent', 'extension', 'get_indicators_failure']);
    });
}

/**
 * Chrome alarm processor that will fire any time an alarm is generated.
 */
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "processEvents") {
        processEvents();
    } else if (alarm.name == "databaseUpdate") {
        databaseUpdate();
    }
});