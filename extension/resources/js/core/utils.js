function buildEvent(metadata, match, hashed) {
    var log = {
        'analysisTime': new Date(),
        'userAgent': navigator.userAgent,
        'indicatorMatch': match,
        'metadata': {},
        'hashMatch': hashed
    };
    Object.assign(log.metadata, metadata);
    return log;
}

function addProtocol(url) {
    if (!url || url === "") {
        return "";
    }
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = "https://" + url;
    }
    return url;
}

function removeArrayItem(arr, value) {
    var index = arr.indexOf(value);
    if (index >= 0) {
        arr.splice(index, 1);
    }
    return arr;
}

function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function loadContextMenus() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title": "Blockade", "id": "parent",
                                "contexts": ['all']});
    chrome.contextMenus.create({"title": "Send to cloud", "parentId": "parent",
                                "contexts": ['all'], "id": "cloud"});
    chrome.contextMenus.create({"title": "Options", "parentId": "parent",
                                "contexts": ['all'], "id": "options"});
    var channels = JSON.parse(localStorage.cfg_channels);
    for (i = 0; i < channels.length; i++) {
        var channel = channels[i].url;
        var menuItem = {"title": channel, "parentId": "cloud",
                        "contexts": ['all'], "id": channel};
        chrome.contextMenus.create(menuItem);
    }
}