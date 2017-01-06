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
