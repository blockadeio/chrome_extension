/**
 * Functions to run once the extension has been loaded.
 */

var parser = document.createElement('a');
var pattern = new RegExp(/\bLTBYPASS-[0-9]{5}\b/g);
var bypass = /#LTBYPASS-[0-9]{5}/;


(function() {
    if (typeof localStorage.cfg_init === "undefined") {
        localStorage.cfg_events = JSON.stringify([]);
        localStorage.cfg_indicators = JSON.stringify({});
        localStorage.cfg_debug = false;
        localStorage.cfg_notifications = true;
        localStorage.cfg_feedback = true;
        localStorage.cfg_cloudUrl = DEFAULT_NODE;
        localStorage.cfg_isRunning = true;
        localStorage.cfg_configured = false;
        localStorage.cfg_lastIndicatorCount = 0;
        localStorage.cfg_init = true;
        console.log(OPTIONS_PAGE);
        chrome.tabs.create({'url': OPTIONS_PAGE});
    }
})();

chrome.browserAction.onClicked.addListener(function(tab) {
    if (localStorage.cfg_isRunning === 'true') {
        localStorage.cfg_isRunning = false;
        chrome.browserAction.setIcon({path: ICON_DARK});
        msg = chrome.i18n.getMessage("dbgDisabled");
        if (localStorage.cfg_debug) { console.log(msg); }
    } else {
        localStorage.cfg_isRunning = true;
        chrome.browserAction.setIcon({path: ICON_LIGHT});
        msg = chrome.i18n.getMessage("dbgEnabed");
        if (localStorage.cfg_debug) { console.log(msg); }
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    function(data) {
        var hashed, indicators;
        var debug = localStorage.cfg_debug;
        var isRunning = localStorage.cfg_isRunning === 'true';
        if (!(isRunning)) {
            return {cancel: false};
        }
        parser.href = data.url;
        var hostname = parser.hostname;
        hashed = md5(hostname);
        var twoBit = hashed.substring(0,2);

        if (pattern.exec(parser.hash)) {
            msg = chrome.i18n.getMessage("dbgBlockBypass");
            if (debug) { console.log(msg); }
            data.url = data.url.replace(bypass, '');
            localStorage.removeItem(hostname);
            indicators = JSON.parse(localStorage[twoBit]);
            delete indicators[hashed];
            localStorage[twoBit] = JSON.stringify(indicators);
            return {redirectUrl: data.url};
        }

        try {
            indicators = JSON.parse(localStorage[twoBit]);
        } catch(err) {
            // Fail to parse means no key, so bounce out.
            return {cancel: false};
        }

        if (!indicators.hasOwnProperty(hashed)) {
            return {cancel: false};
        }

        if (localStorage.cfg_notifications) {
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
        var event = buildEvent(data, hostname);
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
