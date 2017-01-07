function buildEvent(metadata, match) {
    var log = {
        'analysisTime': new Date(),
        'userAgent': navigator.userAgent,
        'indicatorMatch': match,
        'metadata': {}
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