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
