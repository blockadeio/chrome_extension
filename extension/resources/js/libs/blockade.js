var BlockadeIO = {
    indicatorCount: 0,
    indicators: null,
    sources: [],

    init: function() {
        if (localStorage.getItem("cfg_indicators") !== null) {
            console.log("Loading signatures from storage");
            var data = JSON.parse(localStorage.cfg_indicators);
        }
    },

    addSource: function(data) {
        if (localStorage.cfg_debug === 'true') {
            console.log("Added source:", data);
        }
        BlockadeIO.sources.push(data);
    },

    finalize: function() {
        if (localStorage.cfg_debug === 'true') { console.log("Finalizing"); }
        var indicators = {};
        for (var i=0; i < BlockadeIO.sources.length; i++) {
            var data = BlockadeIO.sources[i];
            for (var j=0; j < data.indicators.length; j++) {
                var item = data.indicators[j];
                if (indicators.hasOwnProperty(item)) {
                    indicators[item].push(data.source);
                } else {
                    indicators[item] = [data.source];
                }
                indicators[item] = uniq(indicators[item]);
            }
        }
        if (localStorage.cfg_debug === 'true') { console.log(indicators); }
        var store = JSON.stringify(indicators);
        BlockadeIO.indicatorCount = Object.keys(indicators).length;
        BlockadeIO.indicators = indicators;
        BlockadeIO.active = true;
        if (localStorage.cfg_firstSync) {
            if (BlockadeIO.indicatorCount > 0) {
                localStorage.cfg_firstSync = false;
                localStorage.cfg_dbUpdateTime = 15;
            }
        }
        var msg = chrome.i18n.getMessage("dbgSavedItems",
                                        [BlockadeIO.indicatorCount]);
        if (BlockadeIO.indicatorCount >
                parseInt(localStorage.cfg_lastIndicatorCount)) {
            if (localStorage.cfg_notifications === 'true') {
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
        }
        localStorage.cfg_lastIndicatorCount = BlockadeIO.indicatorCount;
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        var frequency = parseInt(localStorage.cfg_dbUpdateTime);
        chrome.alarms.create("databaseUpdate", {periodInMinutes: frequency});
        return true;
    }

};