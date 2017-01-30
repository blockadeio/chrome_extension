var BlockadeIO = function(hosts) {
    var self = this;
    self.hosts = hosts;
    self.handles = [];
    self.states = ['connect', 'event', 'disconnect'];
    self.db = {};
    self.jobs = 0;

    self.onConnect = function() {
        console.log("Connected");
    };

    self.onEvent = function(data) {
        console.log("Event:", data);
    };

    self.onDisconnect = function() {
        console.log("Disconnected");
    };

    self.connectHost = function(host) {
        var handle = io(host);
        self.states.forEach(function(state) {
            var f = `on${state.capitalize()}`;
            if (self[f] === undefined) {
                console.error(`"${state}" missing handler function of ${f}`);
            }
            handle.on(state, self[f]);
        }, self);
        console.log(`${host} states registered`);
        var count = Object.keys(self.handles).length;
        self.handles[host] = handle;
    };

    self.connectAll = function() {
        console.log("Connecting hosts");
        self.hosts.forEach(function(host) {
            self.connectHost(host);
        }, self);
    };

    self.emitHost = function(host, label, data) {
        if (!self.handles.hasOwnProperty(host)) {
            console.error(`Missing handle for ${host}`);
            return;
        }
        var handle = self.handles[host];
        handle.emit(label, data);
    };

    self.emitAll = function(label, data) {
        console.log("Emitting across handles");
        for (var key in self.handles) {
            self.jobs += 1;
            data = {'source': key};
            self.emitHost(key, label, data);
        }
    };

    self.addHostListener = function(host, label, func) {
        if (!self.handles.hasOwnProperty(host)) {
            console.error(`Missing handle for ${host}`);
            return;
        }
        self.handles[host].on(label, func);
    };

    self.addListener = function(label, func) {
        console.log("Adding listener to all handles");
        for (var key in self.handles) {
            self.addHostListener(key, label, func);
        }
    };
};