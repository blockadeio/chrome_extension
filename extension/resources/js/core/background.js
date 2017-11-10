/**
 * Core logic for the extensions inspection and blocking capabilities.
 */
if (localStorage.cfg_configured === 'true') {
    chrome.alarms.create("processEvents",
                         {delayInMinutes: 0.1, periodInMinutes: 0.5});
}

chrome.browserAction.onClicked.addListener(function(tab) {
    if (localStorage.cfg_isRunning === 'true') {
        localStorage.cfg_isRunning = false;
        chrome.browserAction.setIcon({path: ICON_DARK});
        msg = chrome.i18n.getMessage("dbgDisabled");
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        chrome.notifications.create('alert', {
            type: 'basic',
            iconUrl: ICON_LARGE,
            title: chrome.i18n.getMessage("notifyStatusAlertTitle"),
            message: chrome.i18n.getMessage("dbgDisabled")
        }, function(notificationId) {
            msg = chrome.i18n.getMessage("dbgNotificationCreated");
            if (localStorage.cfg_debug === 'true') { console.log(msg); }
        });
        // _gaq.push(['_trackEvent', 'extension', 'monitor_disabled']);
    } else {
        localStorage.cfg_isRunning = true;
        chrome.browserAction.setIcon({path: ICON_LIGHT});
        msg = chrome.i18n.getMessage("dbgEnabed");
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        chrome.notifications.create('alert', {
            type: 'basic',
            iconUrl: ICON_LARGE,
            title: chrome.i18n.getMessage("notifyStatusAlertTitle"),
            message: chrome.i18n.getMessage("dbgEnabed")
        }, function(notificationId) {
            msg = chrome.i18n.getMessage("dbgNotificationCreated");
            if (localStorage.cfg_debug === 'true') { console.log(msg); }
        });
        // _gaq.push(['_trackEvent', 'extension', 'monitor_enabled']);
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    function(data) {
        var hashed, indicators;
        var debug = localStorage.cfg_debug === 'true';
        var isRunning = localStorage.cfg_isRunning === 'true';
        if (!(isRunning) || !(blockade.active)) {
            return {cancel: false};
        }
        parser.href = data.url;
        var hostname = parser.hostname;
        hashed = md5(hostname);

        if (pattern.exec(parser.hash)) {
            msg = chrome.i18n.getMessage("dbgBlockBypass");
            if (debug) { console.log(msg); }
            data.url = data.url.replace(bypass, '');
            blockade.whitelistItem(hashed);
            return {redirectUrl: data.url};
        }

        indicators = blockade.indicators;
        if (!indicators.hasOwnProperty(hashed)) {
            return {cancel: false};
        }

        if (localStorage.cfg_notifications === 'true') {
            message = chrome.i18n.getMessage("notifyAlertMessage",
                                            [hostname, data.method, data.type]);
            chrome.notifications.create('alert', {
                type: 'basic',
                iconUrl: ICON_LARGE,
                title: chrome.i18n.getMessage("notifyAlertTitle"),
                message: message
            }, function(notificationId) {
                msg = chrome.i18n.getMessage("dbgNotificationCreated");
                if (debug) { console.log(msg); }
            });
        }

        // We are dealing with something malicious
        msg = chrome.i18n.getMessage("dbgRawRequest", [JSON.stringify(data)]);
        if (debug) { console.log(msg); }
        var events = JSON.parse(localStorage.cfg_events);
        var event = buildEvent(data, hostname, hashed);
        events.push(event);
        localStorage.cfg_events = JSON.stringify(events);
        localStorage[hostname] = JSON.stringify(event);
        var redirect = chrome.extension.getURL(WARNING_PAGE);
        redirect += `?redirect=${data.url}`;
        // _gaq.push(['_trackEvent', 'extension', 'threat_blocked']);
        return {redirectUrl: redirect};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "options") {
        chrome.tabs.create({'url': OPTIONS_PAGE});
        return false;
    }
    var channels = JSON.parse(localStorage.cfg_channels);
    var matched = $.grep(channels, function(e){ return e.url == info.menuItemId; });
    if (matched.length === 0) {
        return false;
    }
    var channel = matched[0];
    var parser = document.createElement('a');
    parser.href = addProtocol(info.selectionText);
    if (parser.hostname.indexOf('.') === -1) {
        return false;
    }
    var indicator = md5(parser.hostname);
    var properties = {method: "POST",
                      body: JSON.stringify({'email': channel.username,
                                            'api_key': channel.api_key,
                                            'indicators': [indicator]}),
                      headers: {"Content-Type": "application/json"}};
    var promises = [fetch(channel.url + 'admin/add-indicators', properties)];
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
        if (localStorage.cfg_notifications === 'true') {
            var msg = chrome.i18n.getMessage("dbgAddIndicator",
                                            [1]);
            chrome.notifications.create('info', {
                type: 'basic',
                iconUrl: ICON_LARGE,
                title: chrome.i18n.getMessage("notifyIndicatorSyncTitle"),
                message: msg
            }, function(notificationId) {
                msg = chrome.i18n.getMessage("dbgNotificationCreated");
                if (localStorage.cfg_debug === 'true') { console.log(msg); }
            });
        }
        var msg = chrome.i18n.getMessage("dbgProcessedEvents");
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        chrome.alarms.create("databaseUpdate",
                             {delayInMinutes: 0.1, periodInMinutes: 1.0});
        // _gaq.push(['_trackEvent', 'extension', 'context_submission']);
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
        // _gaq.push(['_trackEvent', 'extension', 'context_submission_failure']);
    });
});

chrome.runtime.onInstalled.addListener(loadContextMenus);
chrome.runtime.onStartup.addListener(loadContextMenus);
