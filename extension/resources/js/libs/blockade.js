/**
 * This object handles the in-memory processing of the indicators and housekeeping
 * for the core aspects of the extension. Without this object, the extension
 * has no ability to perform look-ups.
 */
var BlockadeIO = function() {
    var self = this;
    self.indicatorCount = 0;
    self.indicators = null;
    self.sources = [];
    self.active = false;

    /**
     * Attempt to load indicators from local storage or grab remotely.
     * @return null
     */
    self.init = function() {
        if (localStorage.getItem("cfg_indicators") !== "{}") {
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

    /**
     * Remove an indicator from the in-memory database one-time.
     * @param  {string} indicator Indicator to remove from the database
     * @return null
     */
    self.whitelistItem = function(indicator) {
        delete self.indicators[indicator];
    };

    /**
     * Add data collected from cloud nodes to a temporary hold before processing.
     * @param null
     */
    self.addSource = function(data) {
        if (localStorage.cfg_debug === 'true') {
            console.log("Added source:", data);
        }
        self.sources.push(data);
    };

    /**
     * Merge all the data into a memory-lookup and attempt to save locally.
     * @return null
     */
    self.finalize = function() {
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

        // Attempt to save the database locally (5MB limits)
        LZMA.compress(JSON.stringify(indicators), 1, function(encoded, error) {
            if (localStorage.cfg_debug === 'true') { console.log("Compressing"); }
            try {
                localStorage.cfg_indicators = JSON.stringify(encoded);
                localStorage.cfg_localDatabase = true;
            } catch(err) {
                localStorage.cfg_localDatabase = false;
                localStorage.cfg_indicators = JSON.stringify({});
            }
        });

        // Prime the in-memory concepts
        self.indicatorCount = Object.keys(indicators).length;
        localStorage.cfg_lastIndicatorCount = self.indicatorCount;
        self.indicators = indicators;
        self.active = true;
        self.sources = [];
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
        // Reduce the update frequency now that the database is fully setup
        var frequency = parseInt(localStorage.cfg_dbUpdateTime);
        chrome.alarms.create("databaseUpdate", {periodInMinutes: frequency});
    };
};

var blockade = new BlockadeIO();
blockade.init();
