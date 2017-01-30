/**
 * Functions to run once the extension has been loaded.
 */
var parser = document.createElement('a');
var pattern = new RegExp(/\bLTBYPASS-[0-9]{5}\b/g);
var bypass = /#LTBYPASS-[0-9]{5}/;

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
        return {redirectUrl: redirect};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);
