var BlockadeIO = function() {
    var self = this;
    self.indicatorCount = 0;
    self.indicators = null;
    self.sources = [];
    self.active = false;

    self.init = function() {
        if (localStorage.getItem("cfg_indicators") !== "{}") {
            console.log(localStorage.cfg_indicators);
            console.log("Loading signatures from storage");
            var data = JSON.parse(localStorage.cfg_indicators);
            LZMA.decompress(data, function(decoded, error) {
                self.indicators = JSON.parse(decoded);
                self.active = true;
                self.indicatorCount = Object.keys(self.indicators).length;
            });
            var frequency = parseInt(localStorage.cfg_dbUpdateTime);
            chrome.alarms.create("databaseUpdate", {periodInMinutes: frequency});
        } else {
            console.log("Loading remotely");
            chrome.alarms.create("databaseUpdate",
                                 {delayInMinutes: 0.1, periodInMinutes: 5});
        }
    };

    self.whitelistItem = function(indicator) {
        delete self.indicators[indicator];
    };

    self.addSource = function(data) {
        if (localStorage.cfg_debug === 'true') {
            console.log("Added source:", data);
        }
        self.sources.push(data);
    };

    self.finalize = function() {
        if (localStorage.cfg_debug === 'true') { console.log("Finalizing"); }
        var indicators = {};
        for (var i=0; i < self.sources.length; i++) {
            var data = self.sources[i];
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
        LZMA.compress(store, 1, function(encoded, error) {
            if (localStorage.cfg_debug === 'true') { console.log("Compressing"); }
            try {
                localStorage.cfg_indicators = JSON.stringify(encoded);
                localStorage.cfg_localDatabase = true;
            } catch(err) {
                localStorage.cfg_localDatabase = false;
                localStorage.cfg_indicators = JSON.stringify({});
            }
        });

        self.indicatorCount = Object.keys(indicators).length;
        self.indicators = indicators;
        self.active = true;
        if (localStorage.cfg_firstSync) {
            if (self.indicatorCount > 0) {
                localStorage.cfg_firstSync = false;
                localStorage.cfg_dbUpdateTime = 15;
            }
        }
        var msg = chrome.i18n.getMessage("dbgSavedItems",
                                        [self.indicatorCount]);
        if (self.indicatorCount >
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
        localStorage.cfg_lastIndicatorCount = self.indicatorCount;
        if (localStorage.cfg_debug === 'true') { console.log(msg); }
        var frequency = parseInt(localStorage.cfg_dbUpdateTime);
        chrome.alarms.create("databaseUpdate", {periodInMinutes: frequency});
        return true;
    };
};

var blockade = new BlockadeIO();
blockade.init();
console.log(blockade);